import {describe,it,expect} from 'vitest';
import {App} from 'aws-cdk-lib';
import {Template,Match} from 'aws-cdk-lib/assertions';
import {ResearchStack} from '../infra/research-stack';
import {ResearchFrontendStack} from '../infra/frontend-stack';
const template=()=>Template.fromStack(new ResearchStack(new App(),'ResearchTest',{env:{account:'111111111111',region:'us-east-1'},runtimePath:'test/fixtures/runtime'}));
describe('cloud security boundaries',()=>{
  it('uses the study sender with the team reply address',()=>{
    template().hasResourceProperties('AWS::Lambda::Function',{Handler:'worker.handler',Environment:{Variables:Match.objectLike({MAIL_FROM:'research@woku.app',MAIL_REPLY_TO:'team@woku.app'})}});
  });
  it('creates its own encrypted private database, backup policy and isolated network',()=>{
    const t=template();t.resourceCountIs('AWS::RDS::DBInstance',1);t.resourceCountIs('AWS::EC2::VPC',1);
    t.hasResourceProperties('AWS::RDS::DBInstance',{PubliclyAccessible:false,StorageEncrypted:true,DeletionProtection:true,BackupRetentionPeriod:7,DBName:'research'});
    t.resourceCountIs('AWS::EC2::NatGateway',0);t.resourceCountIs('AWS::EC2::InternetGateway',0);
    t.hasResourceProperties('AWS::RDS::DBParameterGroup',{Parameters:Match.objectLike({'rds.force_ssl':'1'})});
    const json=JSON.stringify(t.toJSON());expect(json).not.toContain('woku-agents');expect(json).not.toContain('vpc-0f4f8e3419df2df52');
  });
  it('limits concurrency, isolates runtime roles from the master secret and exposes no admin API',()=>{
    const t=template();t.hasResourceProperties('AWS::Lambda::Function',{Runtime:'nodejs24.x',ReservedConcurrentExecutions:5,Handler:'api.handler'});
    t.hasResourceProperties('AWS::Lambda::Function',{ReservedConcurrentExecutions:1,Handler:'admin.handler'});
    const permissions=t.findResources('AWS::Lambda::Permission');expect(JSON.stringify(permissions)).not.toMatch(/AdminFunction/);
    const policies=t.findResources('AWS::IAM::Policy');
    for(const [name,value] of Object.entries(policies)) {
      const raw=JSON.stringify(value);
      if(name.includes('FunctionServiceRoleDefaultPolicy')){expect(raw).toContain('function:ResearchTest-');expect(raw).not.toContain('function/ResearchTest-');}
      if(name.includes('ApiFunction')||name.includes('MailFunction'))expect(raw).not.toContain('DatabaseSecret');
      if(name.includes('ApiFunction'))expect(raw).not.toContain('ses:SendEmail');
    }
  });
  it('protects the REST stage and never grants public database access',()=>{
    const t=template();t.resourceCountIs('AWS::WAFv2::WebACLAssociation',1);
    t.hasResourceProperties('AWS::EC2::VPCEndpoint',{ServiceName:'com.amazonaws.us-east-1.email',PrivateDnsEnabled:true});
    for(const resource of Object.values(t.findResources('AWS::EC2::SecurityGroupIngress')))expect(resource.Properties.CidrIp).not.toBe('0.0.0.0/0');
  });
  it('deploys the private CDN independently of backend concurrency',()=>{
    const t=Template.fromStack(new ResearchFrontendStack(new App(),'FrontendTest',{env:{account:'111111111111',region:'us-east-1'}}));
    t.resourceCountIs('AWS::Lambda::Function',0);t.resourceCountIs('AWS::RDS::DBInstance',0);
    t.hasResourceProperties('AWS::S3::Bucket',{PublicAccessBlockConfiguration:{BlockPublicAcls:true,BlockPublicPolicy:true,IgnorePublicAcls:true,RestrictPublicBuckets:true}});
    t.hasResourceProperties('AWS::CloudFront::Distribution',{DistributionConfig:Match.objectLike({Aliases:['research.woku.app']})});
    t.hasResourceProperties('AWS::CloudFront::Distribution',{DistributionConfig:Match.objectLike({CacheBehaviors:Match.arrayWith([Match.objectLike({PathPattern:'manuscrito/*'})])})});
    const policies=JSON.stringify(t.findResources('AWS::CloudFront::ResponseHeadersPolicy'));
    expect(policies).toContain('https://*.clarity.ms');expect(policies).toContain("frame-ancestors 'self'");expect(policies).toContain("object-src 'none'");
  });
});
