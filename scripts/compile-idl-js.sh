#!/usr/bin/env bash

source "$(dirname "$0")/lib/utils.sh" "$@"

# Compiles candid .did files to .idl.js and .d.ts via @icp-sdk/bindgen.

did_files_to_compile() {
  find src/declarations -type f -name '*.did'
}

# Normal API access.
compile_did() {
  local didfile="$1"
  local didfolder="$(dirname "$didfile")"
  local jsFactoryFile="$(echo "$didfile" | sed 's/did$/idl.js/g')"
  local tsFactoryFile="$(echo "$didfile" | sed 's/did$/idl.d.ts/g')"

  generate_did "$didfile" "$didfolder" "$jsFactoryFile" "$tsFactoryFile"
}

# The certified API makes use of the fact that update calls are always signed,
# so it calls query calls as updates. Useful when query certification is not
# guaranteed.
compile_certified_did() {
  local didfile="$1"

  # Temporary folder and DID file
  local didtmpfolder="$(mktemp -d)"
  local certified_didfile="$didtmpfolder/tmp.did"

  # Output finds place in the project
  local jsFactoryFile="$(echo "$didfile" | sed 's/did$/certified.idl.js/g')"
  local tsFactoryFile="$(echo "$didfile" | sed 's/did$/certified.idl.d.ts/g')"

  sed -E "s/(query|composite_query);/;/g" "$didfile" >"$certified_didfile"

  generate_did "$certified_didfile" "$didtmpfolder" "$jsFactoryFile" "$tsFactoryFile"

  rm -r "$didtmpfolder"
}

generate_did() {
  local didfile="$1"
  local didfolder="$2"
  local jsFactoryFile="$3"
  local tsFactoryFile="$4"

  local tsfile="$(echo "$didfile" | sed 's/did$/d.ts/g')"

  # icp-bindgen non-optional output folder and filenames
  local declarationsfolder="${didfolder}/declarations"
  local filename="$(basename "$didfile" .did)"
  local generatedTsfile="${declarationsfolder}/${filename}.did.d.ts"
  local generatedJsfile="${declarationsfolder}/${filename}.did.js"

  # --actor-disabled: skip generating actor files, since we handle those ourselves
  # --force: overwrite files. Required; otherwise, icp-bindgen would delete files at preprocess,
  # which causes issues when multiple .did files are located in the same folder.
  npx icp-bindgen --did-file "${didfile}" --out-dir "${didfolder}" --actor-disabled --force

  # icp-bindgen generates the files in a `declarations` subfolder
  # using suffixes different from those historically used in ic-js.
  mv "${generatedTsfile}" "${tsfile}"
  mv "${generatedJsfile}" "${jsFactoryFile}"
  rm -r "${declarationsfolder}"

  generate_did_factory_ts "${tsFactoryFile}"
}

generate_did_factory_ts() {
  local tsFactoryFile="$1"

  echo "import type { IDL } from \"@icp-sdk/core/candid\";export const idlFactory: IDL.InterfaceFactory;" >"${tsFactoryFile}"
}

# Move to root of the repo
cd "$SCRIPT_DIR/.."

# First generate default certified versions of normal did files.
# Where there are custom certified did files the normal compilation will override the default.
did_files_to_compile | grep -v certified | while read line; do
  compile_certified_did "$line"
done

did_files_to_compile | while read line; do
  compile_did "$line"
done

# didc might generate definition files with invalid trailing commas, which the
# code formatter cleans up. The factory `.d.ts` files we emit are also unformatted.
npm run format
