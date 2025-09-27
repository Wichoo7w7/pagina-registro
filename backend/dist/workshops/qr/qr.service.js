"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const QRCode = __importStar(require("qrcode"));
// Datos embebidos: { eid: enrollmentId, uid: userId, ws: workshopId, ts: issuedAt }
// Cifrado simétrico AES-256-GCM
let QrService = class QrService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        const secret = process.env.QR_SECRET_KEY || 'change_this_qr_secret_key_please_32bytes!!';
        this.key = crypto.createHash('sha256').update(secret).digest();
    }
    async generateEncryptedPayload(data) {
        const iv = crypto.randomBytes(12); // GCM nonce 96 bits
        const plaintext = Buffer.from(JSON.stringify(data));
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        const authTag = cipher.getAuthTag();
        // Formato: iv.encrypted.authtag base64url
        const packed = Buffer.concat([iv, authTag, encrypted]).toString('base64url');
        return packed;
    }
    async decodeEncryptedPayload(token) {
        try {
            const raw = Buffer.from(token, 'base64url');
            const iv = raw.subarray(0, 12);
            const authTag = raw.subarray(12, 28);
            const encrypted = raw.subarray(28);
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            decipher.setAuthTag(authTag);
            const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
            return JSON.parse(decrypted.toString('utf8'));
        }
        catch (e) {
            throw new common_1.BadRequestException('QR inválido');
        }
    }
    async generateQrImageDataUrl(payloadToken) {
        return QRCode.toDataURL(payloadToken, { errorCorrectionLevel: 'M', scale: 4 });
    }
};
exports.QrService = QrService;
exports.QrService = QrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], QrService);
