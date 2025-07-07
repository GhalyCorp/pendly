'use client';
import { useState, useEffect } from 'react';

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    donationAlerts: true,
    campaignUpdates: true,
    marketingEmails: false,
    weeklyReports: true,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load notification settings on component mount
  useEffect(() => {
    // Load from localStorage or use defaults
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setNotifications(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved notification settings:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Save to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(notifications));
      setSuccess('Notification settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Settings</h2>
          <p className="text-gray-600">Manage how and when you receive notifications</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Settings</h2>
        <p className="text-gray-600">Manage how and when you receive notifications</p>
      </div>

      {/* Email Notifications */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-900">Donation Alerts</p>
              <p className="text-sm text-gray-600">Get notified when someone donates to your campaigns</p>
            </div>
            <button
              onClick={() => handleToggle('donationAlerts')}
              disabled={!notifications.emailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.donationAlerts && notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              } ${!notifications.emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.donationAlerts && notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-900">Campaign Updates</p>
              <p className="text-sm text-gray-600">Receive updates about your campaign performance</p>
            </div>
            <button
              onClick={() => handleToggle('campaignUpdates')}
              disabled={!notifications.emailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.campaignUpdates && notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              } ${!notifications.emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.campaignUpdates && notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-900">Weekly Reports</p>
              <p className="text-sm text-gray-600">Receive weekly summaries of your campaign activity</p>
            </div>
            <button
              onClick={() => handleToggle('weeklyReports')}
              disabled={!notifications.emailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.weeklyReports && notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              } ${!notifications.emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.weeklyReports && notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Marketing Communications */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Communications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-900">Marketing Emails</p>
              <p className="text-sm text-gray-600">Receive updates about new features and platform improvements</p>
            </div>
            <button
              onClick={() => handleToggle('marketingEmails')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="p-4 bg-white rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2">Current Settings</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Email notifications: {notifications.emailNotifications ? 'Enabled' : 'Disabled'}</p>
            <p>• Donation alerts: {notifications.donationAlerts && notifications.emailNotifications ? 'Enabled' : 'Disabled'}</p>
            <p>• Campaign updates: {notifications.campaignUpdates && notifications.emailNotifications ? 'Enabled' : 'Disabled'}</p>
            <p>• Weekly reports: {notifications.weeklyReports && notifications.emailNotifications ? 'Enabled' : 'Disabled'}</p>
            <p>• Marketing emails: {notifications.marketingEmails ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
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