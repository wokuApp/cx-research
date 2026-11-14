import type {APIGatewayProxyHandler} from 'aws-lambda';
import {createHandler} from './http';
import {required,runtimeStore} from './runtime';
export const handler:APIGatewayProxyHandler=async(event,context)=>{
  context.callbackWaitsForEmptyEventLoop=false;
  const origin=required('PUBLIC_ORIGIN');
  try {
    return await createHandler(await runtimeStore(),{allowedOrigin:origin,log:entry=>console.log(JSON.stringify(entry))})({
      httpMethod:event.httpMethod,path:event.path,headers:event.headers,body:event.body,isBase64Encoded:event.isBase64Encoded,
      requestContext:{identity:{sourceIp:event.requestContext.identity.sourceIp},requestId:event.requestContext.requestId},
    });
  }catch{
    console.error(JSON.stringify({event:'api_initialization_failed',requestId:context.awsRequestId}));
    return {statusCode:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Vary':'Origin'},body:JSON.stringify({code:'unavailable',message:'No pudimos completar la operación. Vuelve a intentar.'})};
  }
};
