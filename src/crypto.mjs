import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'node:crypto';
export function encrypt(payload, password) {
  const salt = randomBytes(16), iv = randomBytes(12), iterations = 310000;
  const key = pbkdf2Sync(String(password), salt, iterations, 32, 'sha256');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final(), cipher.getAuthTag()]);
  return { algorithm: 'AES-GCM', iterations, salt: salt.toString('base64'), iv: iv.toString('base64'), ciphertext: ciphertext.toString('base64') };
}
export function decrypt(bundle, password) {
  const key = pbkdf2Sync(String(password), Buffer.from(bundle.salt, 'base64'), bundle.iterations, 32, 'sha256');
  const encrypted = Buffer.from(bundle.ciphertext, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(bundle.iv, 'base64'));
  decipher.setAuthTag(encrypted.subarray(-16));
  return JSON.parse(Buffer.concat([decipher.update(encrypted.subarray(0, -16)), decipher.final()]).toString('utf8'));
}
