import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Award, Save, X, CheckCircle } from 'lucide-react';

const UserProfile = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState({
    analystName: '',
    organization: '',
    email: '',
    phone: '',
    title: 'Digital Forensics & Incident Response Analyst',
    certifications: [],
    badgeNumber: '',
    reportSignature: true,
    includeContactInfo: true
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState([]);
  const [newCertification, setNewCertification] = useState('');

  // Load profile when component opens
  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      const result = await window.electronAPI.loadUserProfile();
      if (result.success) {
        setProfile(result.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setErrors([]);
    setSaved(false);

    try {
      const result = await window.electronAPI.saveUserProfile(profile);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrors(result.errors || [result.error]);
      }
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCertification = () => {
    if (newCertification.trim() && !profile.certifications.includes(newCertification.trim())) {
      setProfile({
        ...profile,
        certifications: [...profile.certifications, newCertification.trim()]
      });
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (cert) => {
    setProfile({
      ...profile,
      certifications: profile.certifications.filter(c => c !== cert)
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddCertification();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6" />
            User Profile Settings
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-lg flex items-center gap-2 text-green-200">
            <CheckCircle className="w-5 h-5" />
            Profile saved successfully!
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <ul className="text-red-200 text-sm">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Analyst Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Analyst Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={profile.analystName}
                onChange={(e) => setProfile({ ...profile, analystName: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Digital Forensics & Incident Response Analyst"
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Organization
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Your organization or company"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="analyst@example.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="+1-555-123-4567"
              />
            </div>
          </div>

          {/* Badge Number */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Badge/ID Number
            </label>
            <input
              type="text"
              value={profile.badgeNumber}
              onChange={(e) => setProfile({ ...profile, badgeNumber: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Badge or employee ID (optional)"
            />
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Certifications
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Award className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="e.g., GCFE, GCFA, EnCE"
                />
              </div>
              <button
                onClick={handleAddCertification}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm flex items-center gap-2"
                >
                  {cert}
                  <button
                    onClick={() => handleRemoveCertification(cert)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                Include contact information in reports
              </label>
              <input
                type="checkbox"
                checked={profile.includeContactInfo}
                onChange={(e) => setProfile({ ...profile, includeContactInfo: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                Add signature to reports
              </label>
              <input
                type="checkbox"
                checked={profile.reportSignature}
                onChange={(e) => setProfile({ ...profile, reportSignature: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;