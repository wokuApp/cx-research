import {spawnSync} from 'node:child_process';
const expected=process.env.RESEARCH_EXPECTED_ACCOUNT;
if(!expected||!/^\d{12}$/.test(expected))throw new Error('Set RESEARCH_EXPECTED_ACCOUNT to the intended isolated study account.');
function aws(args) {const r=spawnSync('aws',[...args,'--region','us-east-1','--output','json'],{encoding:'utf8'});if(r.status!==0)throw new Error(`Read-only check failed: ${args.slice(0,2).join(' ')}`);return JSON.parse(r.stdout);}
const identity=aws(['sts','get-caller-identity']);
if(identity.Account!==expected)throw new Error('The active AWS identity does not match RESEARCH_EXPECTED_ACCOUNT.');
const ses=aws(['sesv2','get-account']);const domain=aws(['sesv2','get-email-identity','--email-identity','woku.app']);
if(!ses.ProductionAccessEnabled||!ses.SendingEnabled||!domain.VerifiedForSendingStatus)throw new Error('SES is not ready to send study verification messages.');
const lambda=aws(['lambda','get-account-settings']);
let alreadyReserved=0;
for(const name of ['ApiFunction','MailFunction','AdminFunction']) {
  const r=spawnSync('aws',['lambda','get-function-concurrency','--function-name',`woku-research-${name}`,'--region','us-east-1','--output','json'],{encoding:'utf8'});
  if(r.status===0)alreadyReserved+=JSON.parse(r.stdout).ReservedConcurrentExecutions??0;
  else if(!r.stderr.includes('ResourceNotFoundException'))throw new Error('Cannot verify existing study reservations.');
}
if(lambda.AccountLimit.UnreservedConcurrentExecutions<100+Math.max(0,7-alreadyReserved))throw new Error('Insufficient unreserved Lambda concurrency for the reserved capacity.');
const versions=aws(['rds','describe-orderable-db-instance-options','--engine','postgres','--engine-version','18.6','--db-instance-class','db.t4g.micro']);
if(!versions.OrderableDBInstanceOptions.length)throw new Error('The planned PostgreSQL version/instance is not orderable.');
const endpoints=aws(['ec2','describe-vpc-endpoint-services','--filters','Name=service-name,Values=com.amazonaws.us-east-1.email,com.amazonaws.us-east-1.secretsmanager']);
if(endpoints.ServiceDetails.length!==2)throw new Error('Required private service endpoints are missing.');
console.log(JSON.stringify({accountMatches:true,region:'us-east-1',sesReady:true,postgresReady:true,privateEndpointsReady:true,resourcesModified:false},null,2));
