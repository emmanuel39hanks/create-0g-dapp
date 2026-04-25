#!/usr/bin/env node
/**
 * Patches @0glabs/0g-ts-sdk to match the current 0G contract ABI.
 *
 * The Submission struct was updated on-chain to add an `address submitter` field,
 * changing the submit() selector. The npm package may still ship the old ABI.
 *
 * This runs automatically via postinstall. Safe to re-run — skips if already patched.
 */

const fs = require('fs');
const path = require('path');

const SDK = '@0glabs/0g-ts-sdk';

function findSdkRoot() {
  const candidates = [
    path.join(__dirname, '..', 'node_modules', SDK),
    path.join(__dirname, '..', 'packages', 'web', 'node_modules', SDK),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const OLD_SUBMIT_ABI = `                components: [
                    {
                        internalType: "uint256",
                        name: "length",
                        type: "uint256",
                    },
                    {
                        internalType: "bytes",
                        name: "tags",
                        type: "bytes",
                    },
                    {
                        components: [
                            {
                                internalType: "bytes32",
                                name: "root",
                                type: "bytes32",
                            },
                            {
                                internalType: "uint256",
                                name: "height",
                                type: "uint256",
                            },
                        ],
                        internalType: "struct SubmissionNode[]",
                        name: "nodes",
                        type: "tuple[]",
                    },
                ],
                internalType: "struct Submission",
                name: "submission",
                type: "tuple",`;

const NEW_SUBMIT_ABI = `                components: [
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "length",
                                type: "uint256",
                            },
                            {
                                internalType: "bytes",
                                name: "tags",
                                type: "bytes",
                            },
                            {
                                components: [
                                    {
                                        internalType: "bytes32",
                                        name: "root",
                                        type: "bytes32",
                                    },
                                    {
                                        internalType: "uint256",
                                        name: "height",
                                        type: "uint256",
                                    },
                                ],
                                internalType: "struct SubmissionNode[]",
                                name: "nodes",
                                type: "tuple[]",
                            },
                        ],
                        internalType: "struct SubmissionData",
                        name: "data",
                        type: "tuple",
                    },
                    {
                        internalType: "address",
                        name: "submitter",
                        type: "address",
                    },
                ],
                internalType: "struct Submission",
                name: "submission",
                type: "tuple",`;

const OLD_UPLOADER_LINE = '[submission], txOpts, retryOpts)';
const NEW_UPLOADER_LINE = '[{ data: submission, submitter: await this.flow.runner.getAddress() }], txOpts, retryOpts)';

function patchFile(filePath, oldStr, newStr, label) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(oldStr)) {
    return false; // already patched or different version
  }
  fs.writeFileSync(filePath, content.replace(oldStr, newStr));
  console.log(`  patched: ${label}`);
  return true;
}

const sdkRoot = findSdkRoot();
if (!sdkRoot) {
  console.log('patch-0g-sdk: SDK not found, skipping (install dependencies first).');
  process.exit(0);
}

console.log(`patch-0g-sdk: found SDK at ${sdkRoot}`);

let patched = 0;
for (const variant of ['lib.esm', 'lib.commonjs']) {
  if (patchFile(
    path.join(sdkRoot, variant, 'contracts', 'flow', 'factories', 'FixedPriceFlow__factory.js'),
    OLD_SUBMIT_ABI, NEW_SUBMIT_ABI,
    `${variant}/FixedPriceFlow__factory.js`
  )) patched++;

  if (patchFile(
    path.join(sdkRoot, variant, 'transfer', 'Uploader.js'),
    OLD_UPLOADER_LINE, NEW_UPLOADER_LINE,
    `${variant}/Uploader.js`
  )) patched++;
}

if (patched === 0) {
  console.log('patch-0g-sdk: already up to date (no patches needed).');
} else {
  console.log(`patch-0g-sdk: done (${patched} files patched).`);
}
