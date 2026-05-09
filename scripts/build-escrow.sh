#!/usr/bin/env bash
#
# Builds the upstream escrow Rust canister wasm so dfx can pick it up.
# Invoked by `dfx deploy escrow` via the `build` field of dfx.json. The
# escrow source lives in the sibling `../escrow/` repo (separate Cargo
# workspace), not here, so we build out-of-tree against its manifest.

set -euo pipefail

SCRIPTS_LIB="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib"
# shellcheck source=scripts/lib/utils.sh
source "$SCRIPTS_LIB/utils.sh"

ESCROW_DIR="${ESCROW_DIR:-$PROJECT_ROOT/../escrow}"

if [[ ! -d "$ESCROW_DIR" ]]; then
	echo "error: escrow repo not found at $ESCROW_DIR" >&2
	echo "       clone https://github.com/AntonioVentilii/escrow as a sibling, or set" >&2
	echo "       ESCROW_DIR to the absolute path of your local checkout." >&2
	exit 1
fi

echo "Building escrow.wasm from $ESCROW_DIR"

cargo build \
	--manifest-path "$ESCROW_DIR/Cargo.toml" \
	--target wasm32-unknown-unknown \
	--release \
	-p escrow

WASM_PATH="$ESCROW_DIR/target/wasm32-unknown-unknown/release/escrow.wasm"

if [[ ! -f "$WASM_PATH" ]]; then
	echo "error: expected wasm not produced at $WASM_PATH" >&2
	exit 1
fi

echo "escrow.wasm ready at $WASM_PATH"
