import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
const ALGO = 'aes-256-gcm';
function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) throw new Error('ENCRYPTION_KEY must be 64 hex chars');
  return Buffer.from(hex, 'hex');
}
export function encrypt(p: string) {
  const iv = randomBytes(12);
  const c = createCipheriv(ALGO, getKey(), iv);
  const e = Buffer.concat([c.update(p, 'utf8'), c.final()]);
  return { enc: e.toString('base64'), iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64') };
}
export function decrypt(enc: string, iv: string, tag: string): string {
  const d = createDecipheriv(ALGO, getKey(), Buffer.from(iv, 'base64'));
  d.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(enc, 'base64')), d.final()]).toString('utf8');
}
