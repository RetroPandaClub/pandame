#!/usr/bin/env bash
#
# Bootstraps a working local-development setup for pandame: builds the
# upstream escrow canister and deploys it into the running Juno emulator's
# replica via dfx --network local. After this runs, the dashboard can talk
# to a real (local) escrow canister instead of erroring with IC0301.
#
# Prerequisites:
#   - `juno emulator start` is already running (gateway on 127.0.0.1:5987)
#   - dfx is on PATH (see https://internetcomputer.org/docs/...)
#   - Rust toolchain with the wasm target:
#       rustup target add wasm32-unknown-unknown
#   - The upstream escrow repo cloned as `../escrow/` (or override with
#     ESCROW_DIR=<absolute path>)

set -euo pipefail

SCRIPTS_LIB="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib"
# shellcheck source=scripts/lib/utils.sh
source "$SCRIPTS_LIB/utils.sh"

JUNO_GATEWAY="${JUNO_GATEWAY:-http://127.0.0.1:5987}"
JUNO_GATEWAY_HOST="${JUNO_GATEWAY#http://}"
JUNO_GATEWAY_HOST="${JUNO_GATEWAY_HOST#https://}"
ENV_FILE="$PROJECT_ROOT/.env.local"

echo "→ Verifying Juno emulator is reachable at $JUNO_GATEWAY"
if ! curl -fsS -o /dev/null --max-time 2 "$JUNO_GATEWAY/api/v2/status"; then
	echo "error: Juno emulator gateway is not responding at $JUNO_GATEWAY." >&2
	echo "       Run \`juno emulator start\` in another terminal first." >&2
	exit 1
fi

echo "→ Deploying escrow canister into the local replica (dfx --network local)"
cd "$PROJECT_ROOT"
dfx deploy escrow --network local --upgrade-unchanged --yes

ESCROW_LOCAL_ID="$(dfx canister --network local id escrow)"

if [[ -z "$ESCROW_LOCAL_ID" ]]; then
	echo "error: dfx returned an empty canister id for escrow" >&2
	exit 1
fi

echo "→ Local escrow canister id: $ESCROW_LOCAL_ID"

write_env_var() {
	local key="$1"
	local value="$2"
	local file="$3"

	if [[ -f "$file" ]] && grep -q "^${key}=" "$file"; then
		# Replace existing line in-place (BSD/GNU sed compatible).
		local tmp
		tmp="$(mktemp)"
		awk -v k="$key" -v v="$value" -F= '
			BEGIN { OFS="=" }
			{
				if ($1 == k) { print k, v }
				else { print $0 }
			}
		' "$file" >"$tmp"
		mv "$tmp" "$file"
	else
		echo "${key}=${value}" >>"$file"
	fi
}

write_env_var "VITE_ESCROW_CANISTER_ID" "$ESCROW_LOCAL_ID" "$ENV_FILE"

echo "→ Wrote VITE_ESCROW_CANISTER_ID=$ESCROW_LOCAL_ID to $ENV_FILE"
echo
echo "Done. Start the dev server with: npm run dev"
