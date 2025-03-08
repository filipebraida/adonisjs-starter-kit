import { randomBytes } from 'node:crypto'

export class TokenUtils {
  static generateToken(byteSize: number = 20): string {
    return randomBytes(byteSize).toString('hex')
  }
}
