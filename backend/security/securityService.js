import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { RiskEngine } from './riskEngine.js';

export class SecurityService {
  static async generateToken(player) {
    return jwt.sign(
      { playerId: player.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static async verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token غير صالح');
    }
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  static async comparePasswords(inputPassword, storedHash) {
    return bcrypt.compare(inputPassword, storedHash);
  }

  static async checkFraud(player, action) {
    const riskScore = await RiskEngine.analyze(player, action);
    
    if (riskScore > 70) {
      await this.blockSuspiciousActivity(player, action);
      return false;
    }
    
    return true;
  }
}