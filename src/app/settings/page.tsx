'use client';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';
import StripeSettings from '../../components/settings/StripeSettings';
import AccountSettings from '../../components/settings/AccountSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';

type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

type SettingsTab = 'stripe' | 'account' | 'notifications' | 'security';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('stripe');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
        });
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center pt-14">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'stripe' as SettingsTab, name: 'Payment Settings', icon: '💳' },
    { id: 'account' as SettingsTab, name: 'Account', icon: '👤' },
    { id: 'notifications' as SettingsTab, name: 'Notifications', icon: '🔔' },
    { id: 'security' as SettingsTab, name: 'Security', icon: '🔒' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stripe':
        return <StripeSettings user={user} />;
      case 'account':
        return <AccountSettings user={user} />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <StripeSettings user={user} />;
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Settings Container */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header inside the white box */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your account preferences and payment settings</p>
            </div>
            
            <div className="flex">
              {/* Sidebar */}
              <div className="w-64 bg-gray-50 border-r border-gray-200">
                <nav className="p-4">
                  <ul className="space-y-2">
                    {tabs.map((tab) => (
                      <li key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                            activeTab === tab.id
                              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-xl mr-3">{tab.icon}</span>
                          <span className="font-medium">{tab.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-8">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 