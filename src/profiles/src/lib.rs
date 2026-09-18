//! User profiles for PandaMe.
//!
//! This replaces the `profiles` Datastore collection that used to live in the
//! Juno satellite. The satellite is being reinstalled as a plain asset
//! canister, so the data needs a home of its own.
//!
//! The access model is carried over unchanged: profiles are **publicly
//! readable** (any caller can resolve a profile from a principal, which is how
//! counterparties are rendered on a deal) and **writable only by their owner**.
//!
//! One deliberate difference from the old model: the owner is taken from
//! `msg_caller()` rather than from a key supplied by the caller, so it is not
//! possible to write into someone else's profile by passing their principal.

use candid::{CandidType, Decode, Encode, Principal};
use ic_cdk::api::msg_caller;
use ic_cdk::{query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::Deserialize;
use std::borrow::Cow;
use std::cell::RefCell;

/// Principals are at most 29 bytes.
const PRINCIPAL_MAX_LEN: u32 = 29;

/// Free-text fields a user types about themselves.
const MAX_TEXT_LEN: usize = 64;

/// Mirrors `MAX_AVATAR_DATA_URL_BYTES` in `src/lib/utils/image.utils.ts`.
/// The frontend checks this too, but that check is advisory — a canister has to
/// assume any caller, so the limit is enforced here as well. Without a cap,
/// anyone could fill stable memory and brick the canister.
const MAX_AVATAR_URL_LEN: usize = 340_000;

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Profile {
    pub owner: Principal,
    pub username: String,
    pub name: String,
    pub surname: String,
    pub avatar_url: Option<String>,
    /// Nanoseconds since the epoch, set by the canister.
    pub created_at: u64,
    pub updated_at: u64,
    /// Bumped on every write. Callers echo it back to `set_profile` so a stale
    /// write is rejected instead of silently overwriting a newer one.
    pub version: u64,
}

/// What a caller may set. The owner and the timestamps are not in here: they
/// are derived from the caller and the clock, never trusted from input.
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct SetProfile {
    pub username: String,
    pub name: String,
    pub surname: String,
    pub avatar_url: Option<String>,
    /// The `version` last read, or `None` when creating the profile.
    ///
    /// Every write submits a whole profile, so without this two tabs — or an
    /// avatar upload racing a text edit — would each overwrite the other's
    /// fields with whatever they last saw. This is the optimistic-concurrency
    /// check the Datastore used to provide.
    pub version: Option<u64>,
}

impl Storable for Profile {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(Encode!(self).expect("failed to encode profile"))
    }

    fn into_bytes(self) -> Vec<u8> {
        Encode!(&self).expect("failed to encode profile")
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).expect("failed to decode profile")
    }

    const BOUND: Bound = Bound::Unbounded;
}

/// `Principal` has no `Storable` implementation of its own, and the key type
/// must be bounded for `StableBTreeMap`.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
struct PrincipalKey(Principal);

impl Storable for PrincipalKey {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(self.0.as_slice().to_vec())
    }

    fn into_bytes(self) -> Vec<u8> {
        self.0.as_slice().to_vec()
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Principal::from_slice(bytes.as_ref()))
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: PRINCIPAL_MAX_LEN,
        is_fixed_size: false,
    };
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // Stable memory, so there is no pre_upgrade serialisation step that could
    // trap and leave the canister permanently un-upgradeable.
    static PROFILES: RefCell<StableBTreeMap<PrincipalKey, Profile, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))))
    );
}

fn require_authenticated() -> Result<(), String> {
    if msg_caller() == Principal::anonymous() {
        return Err("anonymous caller not allowed".to_string());
    }
    Ok(())
}

fn validate(profile: &SetProfile) -> Result<(), String> {
    for (field, value) in [
        ("username", &profile.username),
        ("name", &profile.name),
        ("surname", &profile.surname),
    ] {
        if value.chars().count() > MAX_TEXT_LEN {
            return Err(format!("{field} exceeds {MAX_TEXT_LEN} characters"));
        }
    }

    if let Some(avatar_url) = &profile.avatar_url {
        if avatar_url.len() > MAX_AVATAR_URL_LEN {
            return Err(format!("avatar_url exceeds {MAX_AVATAR_URL_LEN} bytes"));
        }
    }

    Ok(())
}

/// Publicly readable, as the Juno collection was: any caller can resolve a
/// profile from a principal.
#[query]
fn get_profile(owner: Principal) -> Option<Profile> {
    PROFILES.with(|p| p.borrow().get(&PrincipalKey(owner)))
}

/// Creates or replaces the caller's own profile.
#[update(guard = "require_authenticated")]
fn set_profile(update: SetProfile) -> Result<Profile, String> {
    validate(&update)?;

    let owner = msg_caller();
    let key = PrincipalKey(owner);
    let now = ic_cdk::api::time();

    let existing = PROFILES.with(|p| p.borrow().get(&key));

    // Reject a write based on a version other than the one stored, rather than
    // letting the last writer win.
    match (&existing, update.version) {
        (Some(existing), Some(expected)) if existing.version != expected => {
            return Err(format!(
                "profile has version {}, write expected {expected}",
                existing.version
            ));
        }
        (Some(existing), None) => {
            return Err(format!(
                "profile already exists at version {}; pass it to update",
                existing.version
            ));
        }
        (None, Some(expected)) => {
            return Err(format!(
                "no profile to update; write expected version {expected}"
            ));
        }
        _ => {}
    }

    let created_at = existing
        .as_ref()
        .map_or(now, |existing| existing.created_at);
    let version = existing.as_ref().map_or(1, |existing| existing.version + 1);

    let profile = Profile {
        owner,
        username: update.username,
        name: update.name,
        surname: update.surname,
        avatar_url: update.avatar_url,
        created_at,
        updated_at: now,
        version,
    };

    PROFILES.with(|p| p.borrow_mut().insert(key, profile.clone()));

    Ok(profile)
}

ic_cdk::export_candid!();
