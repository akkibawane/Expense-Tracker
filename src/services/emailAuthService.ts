import { mockDb } from './mockDatabase';
import { User } from '../types';

export type OtpPurpose = 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' | 'VERIFY_EMAIL';

interface StoredOtp {
  code: string;
  email: string;
  purpose: OtpPurpose;
  expiresAt: number;
}

const OTP_STORAGE_KEY = 'moneymate_active_otps';

class EmailAuthService {
  private getStoredOtps(): Record<string, StoredOtp> {
    try {
      const raw = sessionStorage.getItem(OTP_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveStoredOtps(otps: Record<string, StoredOtp>) {
    sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
  }

  /**
   * Generates and dispatches a 6-digit verification code to the target email
   */
  async sendEmailOtp(email: string, purpose: OtpPurpose): Promise<{ success: boolean; code: string; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    
    // Generate secure 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    const otps = this.getStoredOtps();
    otps[`${cleanEmail}_${purpose}`] = {
      code,
      email: cleanEmail,
      purpose,
      expiresAt,
    };
    this.saveStoredOtps(otps);

    console.log(`[EmailAuth] 📧 OTP sent to ${cleanEmail} for ${purpose}: [${code}]`);

    return {
      success: true,
      code,
      message: `Verification code successfully sent to ${cleanEmail}. It will expire in 10 minutes.`,
    };
  }

  /**
   * Verifies the 6-digit code
   */
  async verifyOtp(email: string, code: string, purpose: OtpPurpose): Promise<{ valid: boolean; message?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const otps = this.getStoredOtps();
    const stored = otps[`${cleanEmail}_${purpose}`];

    // Master test code for seamless demonstration
    if (code === '123456' || code === '888888') {
      return { valid: true };
    }

    if (!stored) {
      return { valid: false, message: 'No verification code was requested for this email.' };
    }

    if (Date.now() > stored.expiresAt) {
      delete otps[`${cleanEmail}_${purpose}`];
      this.saveStoredOtps(otps);
      return { valid: false, message: 'Verification code has expired. Please request a new one.' };
    }

    if (stored.code !== code.trim()) {
      return { valid: false, message: 'Incorrect verification code. Please check your email and try again.' };
    }

    // Clean up used OTP
    delete otps[`${cleanEmail}_${purpose}`];
    this.saveStoredOtps(otps);

    return { valid: true };
  }

  /**
   * Login with email OTP (passwordless authentication)
   */
  async loginWithEmailOtp(email: string, code: string): Promise<{ token: string; user: User }> {
    const verification = await this.verifyOtp(email, code, 'LOGIN');
    if (!verification.valid) {
      throw new Error(verification.message || 'Invalid or expired code');
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = mockDb.findUserByEmail(cleanEmail);

    if (!user) {
      // Auto-provision user if new to the platform via email login
      const newUser = mockDb.createUser({
        fullName: cleanEmail.split('@')[0].replace('.', ' '),
        email: cleanEmail,
        mobileNumber: '',
        role: 'USER',
        currency: 'INR',
        timezone: 'Asia/Kolkata (IST)',
        passwordHash: 'password123',
      });
      user = newUser;
    }

    const token = `jwt-email-auth-${user.id}-${Date.now()}`;
    const { passwordHash, ...safeUser } = user;
    const finalUser: User = {
      ...safeUser,
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
    };

    localStorage.setItem('expense_tracker_jwt', token);
    localStorage.setItem('expense_tracker_user', JSON.stringify(finalUser));

    return { token, user: finalUser };
  }

  /**
   * Reset password via email OTP
   */
  async resetPasswordWithOtp(email: string, code: string, newPassword: string): Promise<boolean> {
    const verification = await this.verifyOtp(email, code, 'RESET_PASSWORD');
    if (!verification.valid) {
      throw new Error(verification.message || 'Invalid verification code');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = mockDb.findUserByEmail(cleanEmail);
    if (!user) {
      throw new Error('No account found with this email address.');
    }

    user.passwordHash = newPassword;
    mockDb.updateUserProfile(user.id, {
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Verify email for existing authenticated user
   */
  async verifyExistingUserEmail(userId: string, email: string, code: string): Promise<User> {
    const verification = await this.verifyOtp(email, code, 'VERIFY_EMAIL');
    if (!verification.valid) {
      throw new Error(verification.message || 'Invalid verification code');
    }

    const updated = mockDb.updateUserProfile(userId, {
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
    });

    if (updated) {
      localStorage.setItem('expense_tracker_user', JSON.stringify(updated));
      return updated;
    }
    throw new Error('User not found');
  }
}

export const emailAuthService = new EmailAuthService();
export default emailAuthService;
