import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Copy, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';

interface ApiKey {
  id: string;
  key: string;
  createdAt: Date;
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeLink, setActiveLink] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadApiKeys();
  }, [currentUser, navigate]);

  async function loadApiKeys() {
    if (!currentUser) return;
    
    const q = query(collection(db, 'apiKeys'), where('userId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);
    const keys: ApiKey[] = [];
    querySnapshot.forEach((doc) => {
      keys.push({
        id: doc.id,
        ...doc.data()
      } as ApiKey);
    });
    setApiKeys(keys);
  }

  async function generateApiKey() {
    if (!currentUser) return;
    
    setIsGenerating(true);
    try {
      const key = crypto.randomUUID();
      await addDoc(collection(db, 'apiKeys'), {
        userId: currentUser.uid,
        key,
        createdAt: new Date()
      });
      await loadApiKeys();
      setActiveLink(`https://${currentUser.email?.split('@')[0]}.lynx.dev:3000`);
    } catch (error) {
      console.error('Error generating API key:', error);
    }
    setIsGenerating(false);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-2xl font-semibold leading-6 text-gray-900">Dashboard</h3>
          </div>

          <div className="mt-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">API Keys</h4>
                <div className="mt-4">
                  <Button
                    onClick={generateApiKey}
                    isLoading={isGenerating}
                    className="flex items-center"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate New API Key
                  </Button>
                </div>
              </div>

              {apiKeys.length > 0 && (
                <div className="mt-6">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">API Key</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                          <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {apiKeys.map((apiKey) => (
                          <tr key={apiKey.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                              {apiKey.key}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(apiKey.createdAt).toLocaleDateString()}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                              <button
                                onClick={() => copyToClipboard(apiKey.key)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeLink && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900">Your HTTPS Link</h4>
                  <div className="mt-2 flex items-center space-x-2">
                    <code className="rounded bg-gray-100 px-2 py-1">{activeLink}</code>
                    <button
                      onClick={() => copyToClipboard(activeLink)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    To start the HTTPS tunnel, run this command in your terminal:
                  </p>
                  <div className="mt-2">
                    <code className="block rounded bg-gray-100 p-2">
                      npx @lynx/cli start --key {apiKeys[0]?.key}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}