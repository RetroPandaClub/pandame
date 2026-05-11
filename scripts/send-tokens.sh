#!/usr/bin/env bash
#
# Mints local ICP (or any other ICRC-1 token) into one or more principals
# by calling the Juno emulator's admin endpoint at
# `http://localhost:5999/ledger/transfer/`. The endpoint runs the transfer
# from the anonymous identity, which holds minter rights on PocketIC, so
# it works as a faucet for fresh `juno emulator start` runs.
#
# Endpoint contract:
#   GET /ledger/transfer/?to=<principal>&amount=<e8s>&ledgerId=<canister-id>
# Documented at https://github.com/junobuild/juno-docker#endpoints.
#
# Usage (from repo root):
#   ./scripts/send-tokens.sh                                # prompts for principal, sends 10 ICP
#   ./scripts/send-tokens.sh <principal>                    # sends 10 ICP
#   ./scripts/send-tokens.sh <principal> 25                 # sends 25 ICP
#   ./scripts/send-tokens.sh <principal-1> <principal-2> 5  # sends 5 ICP to each
#   ./scripts/send-tokens.sh <principal> --amount 25
#   ./scripts/send-tokens.sh <principal> --ledger-id <canister-id>
#
# Only `--local` is supported; the live ICP ledger has no faucet.

SCRIPTS_LIB="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib"
# shellcheck source=scripts/lib/utils.sh
source "$SCRIPTS_LIB/utils.sh"

if [[ "$NETWORK" != "local" ]]; then
	echo "error: send-tokens.sh only supports --local. Got --$NETWORK." >&2
	exit 1
fi

# Mirrors $lib/constants/canisters.constants.ts (ICP_LEDGER_CANISTER_ID).
DEFAULT_LEDGER_ID="ryjl3-tyaaa-aaaaa-aaaba-cai"
DEFAULT_AMOUNT_ICP="10"
ICP_DECIMALS=8
ADMIN_PORT="${JUNO_ADMIN_PORT:-5999}"

LEDGER_ID="$DEFAULT_LEDGER_ID"
AMOUNT_ICP=""
PRINCIPALS=()

while [[ $# -gt 0 ]]; do
	case $1 in
		--ledger-id)
			LEDGER_ID="${2:-}"
			if [[ -z "$LEDGER_ID" ]]; then
				echo "error: --ledger-id requires an argument" >&2
				exit 1
			fi
			shift 2
			;;
		--amount)
			AMOUNT_ICP="${2:-}"
			if [[ -z "$AMOUNT_ICP" ]]; then
				echo "error: --amount requires an argument" >&2
				exit 1
			fi
			shift 2
			;;
		--admin-port)
			ADMIN_PORT="${2:-}"
			if [[ -z "$ADMIN_PORT" ]]; then
				echo "error: --admin-port requires an argument" >&2
				exit 1
			fi
			shift 2
			;;
		--local | --staging | local | staging)
			# Already consumed by utils.sh; ignore here.
			shift
			;;
		--*)
			echo "error: unknown flag $1" >&2
			exit 1
			;;
		*)
			# Numeric => amount in whole ICP, otherwise treat as a principal.
			if [[ "$1" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
				AMOUNT_ICP="$1"
			else
				PRINCIPALS+=("$1")
			fi
			shift
			;;
	esac
done

if [[ ${#PRINCIPALS[@]} -eq 0 ]]; then
	read -r -p "Enter the PRINCIPAL: " PROMPTED
	if [[ -z "$PROMPTED" ]]; then
		echo "error: no principal provided" >&2
		exit 1
	fi
	PRINCIPALS=("$PROMPTED")
fi

if [[ -z "$AMOUNT_ICP" ]]; then
	AMOUNT_ICP="$DEFAULT_AMOUNT_ICP"
fi

# Whole tokens -> e8s. Use awk so fractional inputs (e.g. 0.5) work even
# without bc, and so we don't depend on $((…)) integer-only math.
AMOUNT_E8S=$(awk -v amt="$AMOUNT_ICP" -v dec="$ICP_DECIMALS" \
	'BEGIN { printf("%.0f", amt * (10 ^ dec)) }')

if [[ -z "$AMOUNT_E8S" || "$AMOUNT_E8S" == "0" ]]; then
	echo "error: refusing to send a 0-token transfer (amount=$AMOUNT_ICP)" >&2
	exit 1
fi

ENDPOINT="http://localhost:${ADMIN_PORT}/ledger/transfer/"

if ! curl -fsS -o /dev/null --max-time 2 "http://localhost:${ADMIN_PORT}/health"; then
	echo "error: Juno emulator admin server is not responding at http://localhost:${ADMIN_PORT}." >&2
	echo "       Run \`juno emulator start\` first." >&2
	exit 1
fi

echo "Sending $AMOUNT_ICP token(s) ($AMOUNT_E8S base units) from ledger $LEDGER_ID..."

for PRINCIPAL in "${PRINCIPALS[@]}"; do
	echo "  -> $PRINCIPAL"
	if ! curl -fsS --max-time 10 \
		--get \
		--data-urlencode "to=$PRINCIPAL" \
		--data-urlencode "amount=$AMOUNT_E8S" \
		--data-urlencode "ledgerId=$LEDGER_ID" \
		"$ENDPOINT" \
		>/dev/null; then
		echo "error: transfer to $PRINCIPAL failed" >&2
		exit 1
	fi
done

echo "Done. Sent $AMOUNT_ICP token(s) to ${#PRINCIPALS[@]} principal(s)."
