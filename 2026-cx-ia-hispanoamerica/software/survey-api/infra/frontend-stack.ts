import {Stack,type StackProps,Duration,RemovalPolicy,CfnOutput,CfnParameter,CfnCondition,Fn,Tags} from 'aws-cdk-lib';
import type {Construct} from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
export class ResearchFrontendStack extends Stack {
 constructor(scope:Construct,id:string,props:StackProps={}) {
  super(scope,id,props);
  Tags.of(this).add('Project','woku-research');
  const origin='https://research.woku.app';
  const apiOrigin=new CfnParameter(this,'ApiOrigin',{type:'String',default:'',allowedPattern:'^$|https://[a-z0-9]+\\.execute-api\\.us-east-1\\.amazonaws\\.com',description:'Backend origin after its separate deployment; empty while preparing the study.'});
  const hasApi=new CfnCondition(this,'HasApi',{expression:Fn.conditionNot(Fn.conditionEquals(apiOrigin.valueAsString,''))});
  const connectApi=Fn.conditionIf(hasApi.logicalId,` ${apiOrigin.valueAsString}`,'').toString();
    const certArn=new CfnParameter(this,'FrontendCertificateArn',{type:'String',description:'Issued ACM certificate in us-east-1 covering research.woku.app. No production certificate is modified.',allowedPattern:'arn:aws:acm:us-east-1:[0-9]{12}:certificate/[a-f0-9-]+'});
    const bucket=new s3.Bucket(this,'FrontendBucket',{blockPublicAccess:s3.BlockPublicAccess.BLOCK_ALL,encryption:s3.BucketEncryption.S3_MANAGED,enforceSSL:true,versioned:true,removalPolicy:RemovalPolicy.RETAIN});
    const rewrite=new cloudfront.Function(this,'FrontendRoutes',{code:cloudfront.FunctionCode.fromInline("function handler(event) { var request = event.request; if (request.uri === '/' || request.uri === '/verify' || request.uri === '/verify/') request.uri = '/index.html'; return request; }")});
    const headers=new cloudfront.ResponseHeadersPolicy(this,'FrontendSecurityHeaders',{securityHeadersBehavior:{
      contentSecurityPolicy:{contentSecurityPolicy:`default-src 'self'; script-src 'self' https://*.clarity.ms; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.clarity.ms https://c.bing.com; font-src 'self'; connect-src 'self'${connectApi} https://*.clarity.ms https://c.bing.com; frame-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; worker-src 'none'; upgrade-insecure-requests`,override:true},
      contentTypeOptions:{override:true},frameOptions:{frameOption:cloudfront.HeadersFrameOption.DENY,override:true},referrerPolicy:{referrerPolicy:cloudfront.HeadersReferrerPolicy.NO_REFERRER,override:true},strictTransportSecurity:{accessControlMaxAge:Duration.days(365),includeSubdomains:true,override:true},
    },customHeadersBehavior:{customHeaders:[{header:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()',override:true}]}});
    const documentHeaders=new cloudfront.ResponseHeadersPolicy(this,'ManuscriptSecurityHeaders',{securityHeadersBehavior:{contentSecurityPolicy:{contentSecurityPolicy:"default-src 'none'; frame-ancestors 'self'; base-uri 'none'",override:true},contentTypeOptions:{override:true},frameOptions:{frameOption:cloudfront.HeadersFrameOption.SAMEORIGIN,override:true},referrerPolicy:{referrerPolicy:cloudfront.HeadersReferrerPolicy.NO_REFERRER,override:true},strictTransportSecurity:{accessControlMaxAge:Duration.days(365),includeSubdomains:true,override:true}}});
    const documentOrigin=origins.S3BucketOrigin.withOriginAccessControl(bucket);
    const distribution=new cloudfront.Distribution(this,'FrontendDistribution',{domainNames:['research.woku.app'],certificate:acm.Certificate.fromCertificateArn(this,'FrontendCertificate',certArn.valueAsString),minimumProtocolVersion:cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      additionalBehaviors:{'manuscrito/*':{origin:documentOrigin,viewerProtocolPolicy:cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,allowedMethods:cloudfront.AllowedMethods.ALLOW_GET_HEAD,cachePolicy:cloudfront.CachePolicy.CACHING_OPTIMIZED,responseHeadersPolicy:documentHeaders,compress:true}},
      defaultBehavior:{origin:origins.S3BucketOrigin.withOriginAccessControl(bucket),viewerProtocolPolicy:cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,allowedMethods:cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,cachePolicy:cloudfront.CachePolicy.CACHING_OPTIMIZED,responseHeadersPolicy:headers,compress:true,functionAssociations:[{function:rewrite,eventType:cloudfront.FunctionEventType.VIEWER_REQUEST}]},
    });
  new CfnOutput(this,'FrontendBucketName',{value:bucket.bucketName});
  new CfnOutput(this,'CloudFrontDistributionId',{value:distribution.distributionId});
  new CfnOutput(this,'CloudFrontDomain',{value:distribution.distributionDomainName});
  new CfnOutput(this,'PublicUrl',{value:origin});
  new CfnOutput(this,'AllowedApiOrigin',{value:apiOrigin.valueAsString});
 }
}
