import {z} from 'zod';
import {emailSchema, acceptedSubmissionSchema, type IncomingSubmission} from '@woku-research/contracts';
import {DomainError} from './errors';

export type Route = 'status'|'email-status'|'responses'|'resend-verification'|'verify';
export interface SurveyService {
  status(): Promise<unknown>;
  emailStatus(email: string): Promise<unknown>;
  submit(payload: IncomingSubmission): Promise<unknown>;
  resend(email: string): Promise<unknown>;
  verify(token: string): Promise<unknown>;
  limit(ip: string, route: Route): Promise<boolean>;
}
export interface HttpEvent {
  httpMethod: string; path: string; headers: Record<string,string|undefined>;
  body: string|null; isBase64Encoded: boolean;
  requestContext: {identity: {sourceIp: string}; requestId: string};
}
export interface HttpResult {statusCode: number; headers: Record<string,string>; body: string;}
const emailBody=z.strictObject({email:emailSchema});
const tokenBody=z.strictObject({token:z.string().regex(/^[A-Za-z0-9_-]{43}$/)});
const messages: Record<string,string>={
  paused:'La recepción está pausada. Tu respuesta guardada en este navegador se conserva.',
  duplicate:'Este correo ya tiene una respuesta.', idempotency_conflict:'El identificador ya se usó con otro contenido.',
  instrument_changed:'Se actualizó el cuestionario. Recarga la página para completar la nueva pregunta; tu avance se conserva.',
  pilot_changed:'Cambió la etapa del estudio. Revisa el cuestionario.',
  invalid_token:'El enlace no es válido o venció. Solicita otro correo de verificación.',
  rate_limited:'Espera unos minutos antes de volver a intentar.',
  resend_limit:'Alcanzaste el límite de reenvíos para esta dirección. Intenta más tarde.',
  invalid_payload:'Revisa los datos enviados.', unavailable:'No pudimos completar la operación. Vuelve a intentar.',
};
export const createHandler = (service: SurveyService, config: {allowedOrigin: string; log: (entry: Record<string,unknown>)=>void}) => async (event: HttpEvent): Promise<HttpResult> => {
  const headers: Record<string,string>={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Vary':'Origin'};
  const inputHeaders=Object.fromEntries(Object.entries(event.headers||{}).map(([key,value])=>[key.toLowerCase(),value]));
  const respond=(statusCode:number,data:unknown):HttpResult=>{
    config.log({event:'request',requestId:event.requestContext?.requestId,status:statusCode});
    return {statusCode,headers,body:JSON.stringify(data)};
  };
  if(inputHeaders.origin && inputHeaders.origin!==config.allowedOrigin) return respond(403,{code:'forbidden',message:'Origen no permitido.'});
  if(inputHeaders.origin===config.allowedOrigin) headers['Access-Control-Allow-Origin']=config.allowedOrigin;
  if(event.httpMethod==='OPTIONS') {
    headers['Access-Control-Allow-Methods']='GET, POST, OPTIONS'; headers['Access-Control-Allow-Headers']='Content-Type';
    return respond(204,null);
  }
  const route=event.path.replace(/^\/api\/survey\//,'') as Route;
  const routes: Route[]=['status','email-status','responses','resend-verification','verify'];
  if(!event.path.startsWith('/api/survey/') || !routes.includes(route) || event.httpMethod!==(route==='status'?'GET':'POST')) return respond(404,{code:'not_found',message:'Ruta no encontrada.'});
  try {
    let body:unknown;
    if(event.httpMethod==='POST') {
      if(inputHeaders['content-type']?.split(';')[0].trim().toLowerCase()!=='application/json') throw new DomainError('unsupported_media',415);
      if((event.body?.length??0)>44000) throw new DomainError('payload_too_large',413);
      const raw=event.isBase64Encoded?Buffer.from(event.body??'','base64').toString('utf8'):event.body??'';
      if(Buffer.byteLength(raw,'utf8')>32768) throw new DomainError('payload_too_large',413);
      try {body=JSON.parse(raw);} catch {throw new DomainError('invalid_payload',400);}
    }
    if(!event.requestContext?.identity?.sourceIp) throw new DomainError('unavailable',503);
    if(!await service.limit(event.requestContext.identity.sourceIp,route)) throw new DomainError('rate_limited',429);
    if(route==='status') return respond(200,await service.status());
    if(route==='responses') {
      const parsed=acceptedSubmissionSchema.safeParse(body); if(!parsed.success) throw new DomainError('invalid_payload',400);
      return respond(200,await service.submit(parsed.data));
    }
    if(route==='verify') {
      const parsed=tokenBody.safeParse(body); if(!parsed.success) throw new DomainError('invalid_payload',400);
      return respond(200,await service.verify(parsed.data.token));
    }
    const parsed=emailBody.safeParse(body); if(!parsed.success) throw new DomainError('invalid_payload',400);
    return respond(200,route==='email-status'?await service.emailStatus(parsed.data.email):await service.resend(parsed.data.email));
  } catch(error) {
    const expected=error instanceof DomainError;
    const code=expected?error.code:'unavailable';
    if(code==='rate_limited') headers['Retry-After']='60';
    if(!expected) config.log({event:'request_failed',requestId:event.requestContext?.requestId,route});
    return respond(expected?error.status:503,{code,message:messages[code]??'No pudimos completar esta solicitud.'});
  }
};
