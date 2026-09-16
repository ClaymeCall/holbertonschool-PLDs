import fs from 'node:fs';
import { providerStatus } from '../working/ai/provider.js';

console.log('PATCH//ZERO - DOCTOR\n');

let hasBlockingIssue = false;
const nodeMajor = Number(process.versions.node.split('.')[0]);
const nodeOk = Number.isInteger(nodeMajor) && nodeMajor >= 20;
console.log(`${nodeOk ? 'OK  ' : 'FAIL'} Node.js - ${process.versions.node}${nodeOk ? '' : ' (Node 20+ required)'}`);
if (!nodeOk) hasBlockingIssue = true;

const requiredAssets = [
  '../public/index.html',
  '../public/app.js',
  '../public/styles.css',
  '../public/vendor/react.production.min.js',
  '../public/vendor/react-dom.production.min.js',
  '../public/vendor/three.min.js',
];
const missingAssets = requiredAssets.filter(rel => !fs.existsSync(new URL(rel, import.meta.url)));
console.log(`${missingAssets.length ? 'FAIL' : 'OK  '} Mission Control assets - ${missingAssets.length ? `missing: ${missingAssets.join(', ')}` : 'present'}`);
if (missingAssets.length) hasBlockingIssue = true;

const ai = providerStatus();
console.log(`${ai.live || ai.provider === 'fixture' ? 'OK  ' : 'WARN'} AI Link - provider=${ai.provider} model=${ai.model} ${ai.live ? '(LIVE)' : ai.provider === 'fixture' ? '(FIXTURE SAFE MODE)' : '(CONFIG INCOMPLETE -> FIXTURE SAFE MODE)'}`);
if (ai.warning) console.log(`     ${ai.warning}`);
console.log('OK   Checkers - deterministic; no paid API required');
console.log('\nStart: npm start -> http://localhost:4177');

if (hasBlockingIssue) process.exitCode = 1;
