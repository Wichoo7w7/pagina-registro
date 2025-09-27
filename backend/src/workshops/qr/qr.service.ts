import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

// Datos embebidos: { eid: enrollmentId, uid: userId, ws: workshopId, ts: issuedAt }
// Cifrado simétrico AES-256-GCM
@Injectable()
export class QrService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer; // 32 bytes

  constructor() {
    const secret = process.env.QR_SECRET_KEY || 'change_this_qr_secret_key_please_32bytes!!';
    this.key = crypto.createHash('sha256').update(secret).digest();
  }

  async generateEncryptedPayload(data: Record<string, any>): Promise<string> {
    const iv = crypto.randomBytes(12); // GCM nonce 96 bits
    const plaintext = Buffer.from(JSON.stringify(data));
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Formato: iv.encrypted.authtag base64url
    const packed = Buffer.concat([iv, authTag, encrypted]).toString('base64url');
    return packed;
  }

  async decodeEncryptedPayload(token: string): Promise<any> {
    try {
      const raw = Buffer.from(token, 'base64url');
      const iv = raw.subarray(0, 12);
      const authTag = raw.subarray(12, 28);
      const encrypted = raw.subarray(28);
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return JSON.parse(decrypted.toString('utf8'));
    } catch (e) {
      throw new BadRequestException('QR inválido');
    }
  }

  async generateQrImageDataUrl(payloadToken: string): Promise<string> {
    return QRCode.toDataURL(payloadToken, { errorCorrectionLevel: 'M', scale: 4 });
  }
}
