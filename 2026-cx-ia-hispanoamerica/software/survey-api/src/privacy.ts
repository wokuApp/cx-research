import {createCipheriv, createDecipheriv, createHash, createHmac, randomBytes} from 'node:crypto';
import {canonicalEmail} from '@woku-research/contracts';

export class Privacy {
  constructor(private readonly encryptionKey: Buffer, private readonly indexKey: Buffer) {
    if(encryptionKey.length !== 32 || indexKey.length !== 32) throw new Error('Invalid privacy key length');
  }
  emailKey(value: string): string { return this.hmac(`email:${canonicalEmail(value)}`); }
  originKey(value: string, day: string): string { return this.hmac(`origin:${day}:${value}`); }
  private hmac(value: string): string { return createHmac('sha256',this.indexKey).update(value).digest('hex'); }
  seal(value: string, purpose: string): string {
    const iv=randomBytes(12); const cipher=createCipheriv('aes-256-gcm',this.encryptionKey,iv);
    cipher.setAAD(Buffer.from(purpose));
    const ciphertext=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
    return ['v1',iv.toString('base64url'),cipher.getAuthTag().toString('base64url'),ciphertext.toString('base64url')].join('.');
  }
  open(value: string, purpose: string): string {
    const [version,iv,tag,ciphertext,...extra]=value.split('.');
    if(version!=='v1'||!iv||!tag||!ciphertext||extra.length) throw new Error('Invalid ciphertext');
    const decipher=createDecipheriv('aes-256-gcm',this.encryptionKey,Buffer.from(iv,'base64url'));
    decipher.setAAD(Buffer.from(purpose)); decipher.setAuthTag(Buffer.from(tag,'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext,'base64url')),decipher.final()]).toString('utf8');
  }
}
export const newToken = (): string => randomBytes(32).toString('base64url');
export const tokenDigest = (value: string): string => createHash('sha256').update(value).digest('hex');
function canonical(value: unknown): unknown {
  if(Array.isArray(value)) return value.map(canonical);
  if(value !== null && typeof value==='object') return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,entry])=>[key,canonical(entry)]));
  return value;
}
export const fingerprint = (value: unknown): string => tokenDigest(JSON.stringify(canonical(value)));
