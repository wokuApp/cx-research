import {spawnSync} from 'node:child_process';
const expected=process.env.RESEARCH_EXPECTED_ACCOUNT;
if(!expected||!/^\d{12}$/.test(expected))throw new Error('Set RESEARCH_EXPECTED_ACCOUNT before deployment.');
const result=spawnSync('aws',['sts','get-caller-identity','--query','Account','--output','text'],{encoding:'utf8'});
if(result.status!==0||result.stdout.trim()!==expected)throw new Error('AWS account does not match the selected study account.');
