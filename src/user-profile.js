/**
 * MemHawk User Profile Manager
 * Manages analyst information for report generation
 * 
 * Authors: Adriteyo Das, Anvita Warjri, Shivam Lahoty
 */

const fs = require('fs').promises;
const path = require('path');

class UserProfileManager {
  constructor() {
    this.profilePath = path.join(__dirname, '..', 'user-profile.json');
    this.defaultProfile = {
      analystName: '',
      organization: '',
      email: '',
      phone: '',
      title: 'Digital Forensics & Incident Response Analyst',
      certifications: [],
      badgeNumber: '',
      reportSignature: true,
      includeContactInfo: true
    };
  }

  /**
   * Load user profile from file
   */
  async loadProfile() {
    try {
      const data = await fs.readFile(this.profilePath, 'utf8');
      const profile = JSON.parse(data);
      return { ...this.defaultProfile, ...profile };
    } catch (error) {
      // File doesn't exist or is invalid, return default profile
      return { ...this.defaultProfile };
    }
  }

  /**
   * Save user profile to file
   */
  async saveProfile(profile) {
    try {
      const profileData = { ...this.defaultProfile, ...profile };
      await fs.writeFile(this.profilePath, JSON.stringify(profileData, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get formatted analyst signature for reports
   */
  async getAnalystSignature() {
    const profile = await this.loadProfile();
    
    if (!profile.analystName && !profile.email && !profile.phone) {
      return {
        hasProfile: false,
        signature: `**Prepared by:**
Digital Forensics & Incident Response Analyst
MemHawk Forensic Analysis Tool

*Please configure analyst information in Settings → User Profile*`
      };
    }

    let signature = '**Prepared by:**\n';
    
    if (profile.analystName) {
      signature += `${profile.analystName}`;
      if (profile.title) {
        signature += ` – ${profile.title}`;
      }
      signature += '\n';
    }

    if (profile.organization) {
      signature += `**Organization:** ${profile.organization}\n`;
    }

    if (profile.includeContactInfo) {
      const contactInfo = [];
      if (profile.email) contactInfo.push(profile.email);
      if (profile.phone) contactInfo.push(profile.phone);
      
      if (contactInfo.length > 0) {
        signature += `**Contact:** ${contactInfo.join(' | ')}\n`;
      }
    }

    if (profile.badgeNumber) {
      signature += `**Badge/ID:** ${profile.badgeNumber}\n`;
    }

    if (profile.certifications && profile.certifications.length > 0) {
      signature += `**Certifications:** ${profile.certifications.join(', ')}\n`;
    }

    signature += `\n**Report Generated:** ${new Date().toLocaleString()}\n`;
    signature += `**Tool:** MemHawk Forensic Analysis Platform v1.0\n`;

    return {
      hasProfile: true,
      signature: signature,
      profile: profile
    };
  }

  /**
   * Validate profile data
   */
  validateProfile(profile) {
    const errors = [];

    if (profile.email && !this.isValidEmail(profile.email)) {
      errors.push('Invalid email format');
    }

    if (profile.phone && !this.isValidPhone(profile.phone)) {
      errors.push('Invalid phone format');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Basic email validation
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Basic phone validation
   */
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
}

module.exports = UserProfileManager;