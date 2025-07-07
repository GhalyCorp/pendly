'use client';
import { useState } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { app } from '../../lib/firebase';

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setChangingPassword(true);
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.email) {
      setError('User not found');
      setChangingPassword(false);
      return;
    }

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Change password
      await updatePassword(currentUser, newPassword);
      
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as { code: string }).code;
        if (errorCode === 'auth/wrong-password') {
          setError('Current password is incorrect');
        } else if (errorCode === 'auth/weak-password') {
          setError('Password is too weak. Please choose a stronger password');
        } else {
          setError('Failed to change password. Please try again.');
        }
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h2>
        <p className="text-gray-600">Manage your account security and privacy</p>
      </div>

      {/* Password Management */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Management</h3>
        
        {!showPasswordForm ? (
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your current password"
              />
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your new password"
              />
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your new password"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changingPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Information</h3>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Account Security</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your account is protected with Firebase Authentication</li>
              <li>• Passwords are securely hashed and encrypted</li>
              <li>• All data transmission is encrypted with HTTPS</li>
              <li>• Regular security audits are performed</li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Password Requirements</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Minimum 6 characters long</li>
              <li>• Use a combination of letters, numbers, and symbols</li>
              <li>• Avoid using common passwords or personal information</li>
              <li>• Consider using a password manager for better security</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Management</h3>
        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Current Session</p>
              <p className="text-sm text-gray-600">You are currently signed in on this device</p>
            </div>
            <div className="text-sm text-green-600 font-medium">Active</div>
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}
    </div>
  );
} 