"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = require("crypto");
const algorithm = 'aes-256-gcm';
const password = process.env.ENCRYPTION_KEY || 'a_very_secret_key_for_encryption_and_decryption'; // Use a strong, securely managed key
// Derive a key from the password
const key = (0, crypto_1.scryptSync)(password, 'salt', 32); // 'salt' should be unique per application
function encrypt(text) {
    const iv = (0, crypto_1.randomBytes)(16); // Initialization vector
    const cipher = (0, crypto_1.createCipheriv)(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
}
function decrypt(encryptedText) {
    const [ivHex, encrypted, tagHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = (0, crypto_1.createDecipheriv)(algorithm, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
