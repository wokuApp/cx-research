import {App} from 'aws-cdk-lib';
import {ResearchStack} from './research-stack';
import {ResearchFrontendStack} from './frontend-stack';
const app=new App();
new ResearchStack(app,'woku-research',{env:{account:process.env.CDK_DEFAULT_ACCOUNT,region:'us-east-1'}});

new ResearchFrontendStack(app,'woku-research-web',{env:{account:process.env.CDK_DEFAULT_ACCOUNT,region:'us-east-1'}});
