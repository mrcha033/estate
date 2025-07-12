import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const algorithm = 'aes-256-gcm'
const password = process.env.ENCRYPTION_KEY || 'a_very_secret_key_for_encryption_and_decryption' // Use a strong, securely managed key

// Derive a key from the password
const key = scryptSync(password, 'salt', 32) // 'salt' should be unique per application

export function encrypt(text: string) {
  const iv = randomBytes(16) // Initialization vector
  const cipher = createCipheriv(algorithm, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const tag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`
}

export function decrypt(encryptedText: string) {
  const [ivHex, encrypted, tagHex] = encryptedText.split(':')

  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')

  const decipher = createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
