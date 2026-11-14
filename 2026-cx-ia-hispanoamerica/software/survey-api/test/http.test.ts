import { describe, expect, it, vi } from 'vitest';
import { createHandler } from '../src/http';
import { DomainError } from '../src/errors';
const origin = 'https://research.woku.app';
const status = {phase:'pilot', paused:false, completed:0, pilotLimit:50, pilotQuestions:true, reason:null};
const event = (method='GET', path='/api/survey/status', body?:unknown) => ({
  httpMethod:method, path, headers:{origin, 'content-type':'application/json'},
  body:body === undefined ? null : JSON.stringify(body), isBase64Encoded:false,
  requestContext:{identity:{sourceIp:'192.0.2.1'}, requestId:'test-request'},
});
function setup() {
  const service = {status:vi.fn().mockResolvedValue(status), emailStatus:vi.fn(), submit:vi.fn(), resend:vi.fn(), verify:vi.fn(), limit:vi.fn().mockResolvedValue(true)};
  const log = vi.fn(); return {service, log, handle:createHandler(service, {allowedOrigin:origin, log})};
}
describe('public transport boundary', () => {
  it('returns no-store responses, precise CORS and no credentials', async () => {
    const {handle}=setup(); const r=await handle(event());
    expect(r.statusCode).toBe(200); expect(JSON.parse(r.body)).toEqual(status);
    expect(r.headers['Cache-Control']).toBe('no-store');
    expect(r.headers['Access-Control-Allow-Origin']).toBe(origin);
    expect(r.headers['Access-Control-Allow-Credentials']).toBeUndefined();
  });
  it('rejects foreign origins and never reflects them', async () => {
    const {handle,service}=setup(); const r=await handle({...event(),headers:{origin:'https://attacker.example'}});
    expect(r.statusCode).toBe(403); expect(service.status).not.toHaveBeenCalled();
    expect(r.headers['Access-Control-Allow-Origin']).toBeUndefined();
  });
  it('enforces JSON, byte size, schema and server-owned verification', async () => {
    const {handle,service}=setup();
    expect((await handle({...event('POST','/api/survey/email-status',{email:'a@example.com'}),headers:{origin,'content-type':'text/plain'}})).statusCode).toBe(415);
    expect((await handle({...event('POST','/api/survey/responses'),body:'x'.repeat(33000)})).statusCode).toBe(413);
    expect((await handle({...event('POST','/api/survey/responses'),body:'{broken'})).statusCode).toBe(400);
    expect((await handle(event('POST','/api/survey/email-status',{email:'a@example.com',admin:true}))).statusCode).toBe(400);
    expect((await handle(event('POST','/api/survey/responses',{emailVerified:true}))).statusCode).toBe(400);
    expect(service.submit).not.toHaveBeenCalled();
  });
  it('does not consume tokens on GET or expose administrative routes', async () => {
    const {handle,service}=setup();
    expect((await handle(event('GET','/api/survey/verify'))).statusCode).toBe(404);
    expect((await handle(event('POST','/api/survey/admin',{phase:'main'}))).statusCode).toBe(404);
    expect(service.verify).not.toHaveBeenCalled();
  });
  it('uses the gateway source IP, not spoofed forwarded headers', async () => {
    const {handle,service}=setup(); await handle({...event(),headers:{...event().headers,'x-forwarded-for':'127.0.0.1'}});
    expect(service.limit).toHaveBeenCalledWith('192.0.2.1','status');
  });
  it('enforces rate limits before business methods', async () => {
    const {handle,service}=setup(); service.limit.mockResolvedValue(false);
    const r=await handle(event()); expect(r.statusCode).toBe(429); expect(r.headers['Retry-After']).toBeDefined(); expect(service.status).not.toHaveBeenCalled();
  });
  it('does not log tokens, email addresses or database errors', async () => {
    const {handle,service,log}=setup(); service.status.mockRejectedValue(new Error('secret person@example.com password=abc'));
    const r=await handle(event()); expect(r.statusCode).toBe(503);
    expect(JSON.stringify([r,log.mock.calls])).not.toMatch(/person@example|password=abc|secret/);
  });
  it('maps expected domain errors without leaking payloads', async () => {
    const {handle,service}=setup(); service.resend.mockRejectedValue(new DomainError('rate_limited',429));
    expect((await handle(event('POST','/api/survey/resend-verification',{email:'a@example.com'}))).statusCode).toBe(429);
  });
});
