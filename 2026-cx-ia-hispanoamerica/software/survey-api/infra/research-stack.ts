import {Stack,type StackProps,Duration,RemovalPolicy,CfnOutput,CfnParameter,Tags,ArnFormat} from 'aws-cdk-lib';
import type {Construct} from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as waf from 'aws-cdk-lib/aws-wafv2';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';

export class ResearchStack extends Stack {
  constructor(scope:Construct,id:string,props:StackProps&{runtimePath?:string}={}) {
    super(scope,id,props);
    const origin='https://research.woku.app';
    const trialReset=new CfnParameter(this,'EnableTrialReset',{type:'String',default:'false',allowedValues:['true','false'],description:'Temporary IAM-only reset capability for the initial production trial. Disable before fieldwork.'});
    Tags.of(this).add('Project','woku-research');Tags.of(this).add('DataClass','research-confidential');
    const vpc=new ec2.Vpc(this,'ResearchVpc',{ipAddresses:ec2.IpAddresses.cidr('10.82.0.0/20'),maxAzs:2,natGateways:0,subnetConfiguration:[{name:'isolated',subnetType:ec2.SubnetType.PRIVATE_ISOLATED,cidrMask:24}],restrictDefaultSecurityGroup:true});
    const selected={subnets:[vpc.isolatedSubnets[0]]};
    const apiSg=new ec2.SecurityGroup(this,'ApiSecurityGroup',{vpc,allowAllOutbound:false});
    const mailSg=new ec2.SecurityGroup(this,'MailSecurityGroup',{vpc,allowAllOutbound:false});
    const adminSg=new ec2.SecurityGroup(this,'AdminSecurityGroup',{vpc,allowAllOutbound:false});
    const dbSg=new ec2.SecurityGroup(this,'DatabaseSecurityGroup',{vpc,allowAllOutbound:false});
    const secretSg=new ec2.SecurityGroup(this,'SecretEndpointSecurityGroup',{vpc,allowAllOutbound:false});
    const sesSg=new ec2.SecurityGroup(this,'SesEndpointSecurityGroup',{vpc,allowAllOutbound:false});
    for(const sg of [apiSg,mailSg,adminSg]) {
      sg.addEgressRule(dbSg,ec2.Port.tcp(5432));dbSg.addIngressRule(sg,ec2.Port.tcp(5432));
      sg.addEgressRule(secretSg,ec2.Port.tcp(443));secretSg.addIngressRule(sg,ec2.Port.tcp(443));
    }
    mailSg.addEgressRule(sesSg,ec2.Port.tcp(443));sesSg.addIngressRule(mailSg,ec2.Port.tcp(443));
    const secretEndpoint=vpc.addInterfaceEndpoint('SecretsEndpoint',{service:ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,subnets:selected,securityGroups:[secretSg],open:false,privateDnsEnabled:true});
    const sesEndpoint=vpc.addInterfaceEndpoint('SesApiEndpoint',{service:new ec2.InterfaceVpcEndpointService('com.amazonaws.us-east-1.email',443),subnets:selected,securityGroups:[sesSg],open:false,privateDnsEnabled:true});
    const apiSecret=new secrets.Secret(this,'ApiDatabaseCredentials',{generateSecretString:{secretStringTemplate:JSON.stringify({username:'research_api'}),generateStringKey:'password',passwordLength:40,excludePunctuation:true}});
    const mailSecret=new secrets.Secret(this,'MailDatabaseCredentials',{generateSecretString:{secretStringTemplate:JSON.stringify({username:'research_mail'}),generateStringKey:'password',passwordLength:40,excludePunctuation:true}});
    const privacySecret=new secrets.Secret(this,'PrivacyMaterial',{generateSecretString:{secretStringTemplate:'{}',generateStringKey:'key',passwordLength:64,excludePunctuation:true}});
    for(const resource of [apiSecret,mailSecret,privacySecret])resource.applyRemovalPolicy(RemovalPolicy.RETAIN);
    const engine=rds.DatabaseInstanceEngine.postgres({version:rds.PostgresEngineVersion.of('18.6','18')});
    const parameters=new rds.ParameterGroup(this,'DatabaseParameters',{engine,parameters:{'rds.force_ssl':'1',log_statement:'none',log_min_duration_statement:'-1',log_min_error_statement:'panic',log_parameter_max_length:'0',log_parameter_max_length_on_error:'0'}});
    const database=new rds.DatabaseInstance(this,'Database',{engine,parameterGroup:parameters,vpc,vpcSubnets:{subnetType:ec2.SubnetType.PRIVATE_ISOLATED},securityGroups:[dbSg],
      credentials:rds.Credentials.fromGeneratedSecret('research_owner'),databaseName:'research',
      instanceType:ec2.InstanceType.of(ec2.InstanceClass.T4G,ec2.InstanceSize.MICRO),allocatedStorage:20,maxAllocatedStorage:40,storageType:rds.StorageType.GP3,storageEncrypted:true,
      publiclyAccessible:false,multiAz:false,availabilityZone:vpc.availabilityZones[0],backupRetention:Duration.days(7),deleteAutomatedBackups:false,deletionProtection:true,removalPolicy:RemovalPolicy.SNAPSHOT,
      autoMinorVersionUpgrade:true,copyTagsToSnapshot:true,enablePerformanceInsights:false,
    });
    database.secret!.applyRemovalPolicy(RemovalPolicy.RETAIN);
    const code=lambda.Code.fromAsset(props.runtimePath??'dist/runtime');
    const makeFunction=(name:string,handler:string,sg:ec2.SecurityGroup,secret:secrets.ISecret,concurrency:number,timeout:number)=>{
      const logGroup=new logs.LogGroup(this,`${name}Logs`,{retention:logs.RetentionDays.ONE_MONTH,removalPolicy:RemovalPolicy.RETAIN});
      const functionName=`${this.stackName}-${name}`;
      const fn=new lambda.Function(this,name,{functionName,runtime:lambda.Runtime.NODEJS_24_X,architecture:lambda.Architecture.ARM_64,code,handler,memorySize:256,timeout:Duration.seconds(timeout),reservedConcurrentExecutions:concurrency,
        vpc,vpcSubnets:selected,securityGroups:[sg],logGroup,
        environment:{DB_HOST:database.dbInstanceEndpointAddress,DB_SECRET_ARN:secret.secretArn,PUBLIC_ORIGIN:origin,NODE_OPTIONS:'--enable-source-maps'},
      });
      secret.grantRead(fn);
      // VPC permissions are required by the Lambda service, not by code running in the function.
      fn.addToRolePolicy(new iam.PolicyStatement({effect:iam.Effect.DENY,actions:['ec2:CreateNetworkInterface','ec2:DeleteNetworkInterface','ec2:DescribeNetworkInterfaces','ec2:DescribeSubnets','ec2:DetachNetworkInterface','ec2:AssignPrivateIpAddresses','ec2:UnassignPrivateIpAddresses'],resources:['*'],conditions:{ArnEquals:{'lambda:SourceFunctionArn':this.formatArn({service:'lambda',resource:'function',resourceName:functionName,arnFormat:ArnFormat.COLON_RESOURCE_NAME})}}}));
      return {fn,logGroup};
    };
    const api=makeFunction('ApiFunction','api.handler',apiSg,apiSecret,5,12);
    const mail=makeFunction('MailFunction','worker.handler',mailSg,mailSecret,1,60);
    const admin=makeFunction('AdminFunction','admin.handler',adminSg,database.secret!,1,120);
    for(const fn of [api.fn,mail.fn]) {privacySecret.grantRead(fn);fn.addEnvironment('PRIVACY_SECRET_ARN',privacySecret.secretArn);}
    apiSecret.grantRead(admin.fn);mailSecret.grantRead(admin.fn);
    admin.fn.addEnvironment('API_SECRET_ARN',apiSecret.secretArn);admin.fn.addEnvironment('MAIL_SECRET_ARN',mailSecret.secretArn);
    admin.fn.addEnvironment('TRIAL_RESET_ENABLED',trialReset.valueAsString);
    const config=new ses.ConfigurationSet(this,'ResearchEmailConfiguration',{reputationMetrics:true,sendingEnabled:true,tlsPolicy:ses.ConfigurationSetTlsPolicy.REQUIRE});
    mail.fn.addEnvironment('MAIL_FROM','research@woku.app');mail.fn.addEnvironment('MAIL_REPLY_TO','team@woku.app');mail.fn.addEnvironment('SES_CONFIGURATION_SET',config.configurationSetName);
    const sesResources=[`arn:${this.partition}:ses:${this.region}:${this.account}:identity/woku.app`,`arn:${this.partition}:ses:${this.region}:${this.account}:configuration-set/${config.configurationSetName}`];
    mail.fn.addToRolePolicy(new iam.PolicyStatement({actions:['ses:SendEmail'],resources:sesResources,conditions:{StringEquals:{'ses:FromAddress':'research@woku.app'}}}));
    secretEndpoint.addToPolicy(new iam.PolicyStatement({principals:[new iam.ArnPrincipal(api.fn.role!.roleArn),new iam.ArnPrincipal(mail.fn.role!.roleArn),new iam.ArnPrincipal(admin.fn.role!.roleArn)],actions:['secretsmanager:GetSecretValue','secretsmanager:DescribeSecret'],resources:[apiSecret.secretArn,mailSecret.secretArn,privacySecret.secretArn,database.secret!.secretArn]}));
    sesEndpoint.addToPolicy(new iam.PolicyStatement({principals:[new iam.ArnPrincipal(mail.fn.role!.roleArn)],actions:['ses:SendEmail'],resources:sesResources}));
    new events.Rule(this,'VerificationDispatch',{schedule:events.Schedule.rate(Duration.minutes(1)),targets:[new targets.LambdaFunction(mail.fn,{retryAttempts:0})]});
    // API Gateway's CloudWatch role is account-global. Do not mutate that shared setting.
    // Request metadata is emitted by the dedicated Lambda without IPs, bodies or query strings.
    const gateway=new apigateway.RestApi(this,'ResearchApi',{endpointTypes:[apigateway.EndpointType.REGIONAL],cloudWatchRole:false,
      deployOptions:{stageName:'v1',throttlingRateLimit:20,throttlingBurstLimit:40,dataTraceEnabled:false,loggingLevel:apigateway.MethodLoggingLevel.OFF,metricsEnabled:true},
      defaultCorsPreflightOptions:{allowOrigins:[origin],allowMethods:['GET','POST','OPTIONS'],allowHeaders:['Content-Type'],maxAge:Duration.minutes(10)},
    });
    const survey=gateway.root.addResource('api').addResource('survey');
    const integration=new apigateway.LambdaIntegration(api.fn);
    for(const [path,method] of [['status','GET'],['email-status','POST'],['responses','POST'],['resend-verification','POST'],['verify','POST']])survey.addResource(path).addMethod(method,integration);
    for(const type of [apigateway.ResponseType.DEFAULT_4XX,apigateway.ResponseType.DEFAULT_5XX])gateway.addGatewayResponse(`Errors${type.responseType}`,{type,responseHeaders:{'Access-Control-Allow-Origin':`'${origin}'`,'Cache-Control':"'no-store'"},templates:{'application/json':'{"code":"gateway_error","message":"No pudimos completar la solicitud. Vuelve a intentar."}'}});
    const acl=new waf.CfnWebACL(this,'ResearchFirewall',{scope:'REGIONAL',defaultAction:{allow:{}},visibilityConfig:{cloudWatchMetricsEnabled:true,metricName:'research-waf',sampledRequestsEnabled:false},rules:[
      {name:'RequestRate',priority:0,action:{block:{}},statement:{rateBasedStatement:{aggregateKeyType:'IP',limit:300,evaluationWindowSec:300}},visibilityConfig:{cloudWatchMetricsEnabled:true,metricName:'research-rate',sampledRequestsEnabled:false}},
      {name:'OversizeBody',priority:1,action:{block:{}},statement:{sizeConstraintStatement:{comparisonOperator:'GT',size:32768,fieldToMatch:{body:{oversizeHandling:'MATCH'}},textTransformations:[{priority:0,type:'NONE'}]}},visibilityConfig:{cloudWatchMetricsEnabled:true,metricName:'research-size',sampledRequestsEnabled:false}},
    ],associationConfig:{requestBody:{API_GATEWAY:{defaultSizeInspectionLimit:'KB_32'}}}});
    const association=new waf.CfnWebACLAssociation(this,'ResearchFirewallAssociation',{resourceArn:gateway.deploymentStage.stageArn,webAclArn:acl.attrArn});association.node.addDependency(gateway.deploymentStage);
    const alerts=new sns.Topic(this,'ResearchAlerts',{enforceSSL:true});
    const alarm=(name:string,metric:cloudwatch.IMetric,threshold:number)=>{
      const a=new cloudwatch.Alarm(this,name,{metric,threshold,evaluationPeriods:1,treatMissingData:cloudwatch.TreatMissingData.NOT_BREACHING});a.addAlarmAction(new actions.SnsAction(alerts));
    };
    alarm('ApiErrors',api.fn.metricErrors({period:Duration.minutes(5)}),3);
    alarm('GatewayErrors',gateway.metricServerError({period:Duration.minutes(5),statistic:'Sum'}),3);
    alarm('MailErrors',mail.fn.metricErrors({period:Duration.minutes(5)}),1);
    const failures=new logs.MetricFilter(this,'DeliveryFailures',{logGroup:mail.logGroup,filterPattern:logs.FilterPattern.numberValue('$.failed','>',0),metricNamespace:'WokuResearch',metricName:'DeliveryFailures',metricValue:'$.failed'});
    alarm('DeliveryFailureAlarm',failures.metric({period:Duration.minutes(5),statistic:'Sum'}),1);
    const lowMemory=new cloudwatch.Alarm(this,'DatabaseMemory',{metric:database.metricFreeableMemory({period:Duration.minutes(5),statistic:'Minimum'}),threshold:64*1024*1024,comparisonOperator:cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,evaluationPeriods:2,treatMissingData:cloudwatch.TreatMissingData.NOT_BREACHING});
    lowMemory.addAlarmAction(new actions.SnsAction(alerts));
    // Infrastructure only. Publishing the front is a separate, explicit command after its real API URL exists.
    new CfnOutput(this,'ApiBaseUrl',{value:gateway.url.replace(/\/$/,'')});
    new CfnOutput(this,'PublicUrl',{value:origin});
    new CfnOutput(this,'AdminFunctionName',{value:admin.fn.functionName});new CfnOutput(this,'AlertsTopicArn',{value:alerts.topicArn});
    new CfnOutput(this,'DatabaseIdentifier',{value:database.instanceIdentifier});
  }
}
