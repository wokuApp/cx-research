import {SESv2Client,SendEmailCommand} from '@aws-sdk/client-sesv2';
import type {Context} from 'aws-lambda';
import {required,runtimeStore} from './runtime';
import {runMailBatch,type VerificationMail} from './mail';
// SES interface endpoint advertises this API hostname, not email.<region>.amazonaws.com.
const ses=new SESv2Client({endpoint:'https://email.us-east-1.api.aws',maxAttempts:2});
async function send(mail:VerificationMail):Promise<string> {
  const text=`Gracias por participar en el estudio de IA en la experiencia del cliente en Hispanoamérica.\n\nTu respuesta ya está guardada. Para verificar tu correo, abre este enlace y pulsa «Verificar mi correo»:\n\n${mail.url}\n\nEl enlace vence en 24 horas. Tu respuesta se conservará aunque no verifiques el correo.\n\nSi no participaste, puedes ignorar este mensaje. No utilizaremos tu dirección para marketing. Sólo se usa para verificar la respuesta y enviar los resultados al finalizar el estudio.\n\nwoku research`;
  const result=await ses.send(new SendEmailCommand({FromEmailAddress:required('MAIL_FROM'),ReplyToAddresses:[required('MAIL_REPLY_TO')],ConfigurationSetName:required('SES_CONFIGURATION_SET'),Destination:{ToAddresses:[mail.to]},Content:{Simple:{Subject:{Charset:'UTF-8',Data:'Verifica tu correo para el estudio de IA en experiencia del cliente'},Body:{Text:{Charset:'UTF-8',Data:text}}}}}));
  if(!result.MessageId)throw new Error('Missing delivery acknowledgement');return result.MessageId;
}
export const handler=async(_event:unknown,context:Context):Promise<{sent:number;failed:number}>=>{
  context.callbackWaitsForEmptyEventLoop=false;
  try {const result=await runMailBatch(await runtimeStore(),send,required('PUBLIC_ORIGIN'));console.log(JSON.stringify({event:'mail_batch',...result}));return result;}
  catch{console.error(JSON.stringify({event:'mail_batch_failed',requestId:context.awsRequestId}));throw new Error('Mail batch failed');}
};
