'use client';
import { useState } from 'react';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { app } from '../../lib/firebase';

type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

interface AccountSettingsProps {
  user: User;
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingBusinessName, setIsEditingBusinessName] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState(user.displayName || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccess('Account deleted successfully. You will be signed out.');
        setTimeout(() => {
          signOut(getAuth(app));
        }, 2000);
      } else {
        setError(result.error || 'Failed to delete account. Please try again.');
      }
    } catch {
      setError('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth(app));
    } catch {
      setError('Failed to sign out. Please try again.');
    }
  };

  const handleUpdateBusinessName = async () => {
    if (!newBusinessName.trim()) {
      setError('Business name cannot be empty');
      return;
    }

    try {
      const auth = getAuth(app);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: newBusinessName.trim()
        });
        setSuccess('Business name updated successfully!');
        setIsEditingBusinessName(false);
        // Force a page refresh to update the user state
        window.location.reload();
      }
    } catch {
      setError('Failed to update business name. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Account Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border">
            <p className="font-medium text-gray-900 mb-1">Email Address</p>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <p className="font-medium text-gray-900 mb-1">User ID</p>
            <p className="text-gray-600 font-mono text-sm">{user.uid}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <p className="font-medium text-gray-900 mb-1">Business Name</p>
            {isEditingBusinessName ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-900"
                  placeholder="Enter business name"
                />
                <button
                  onClick={handleUpdateBusinessName}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingBusinessName(false);
                    setNewBusinessName(user.displayName || '');
                  }}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-600">{user.displayName || 'Not set'}</p>
                <button
                  onClick={() => setIsEditingBusinessName(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-900">Sign Out</p>
              <p className="text-sm text-gray-600">Sign out of your account on this device</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Sign Out
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Data Usage */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Privacy</h3>
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">What happens when you delete your account?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All your business campaigns will be permanently deleted</li>
              <li>• All donation records will be removed</li>
              <li>• Your Stripe Connect account will be unlinked</li>
              <li>• This action cannot be undone</li>
            </ul>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including all your business campaigns.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 