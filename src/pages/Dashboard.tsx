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

  function getCliCommand(apiKey: string) {
    return `npx @lynx-glopx/cli start --key ${apiKey}`;
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
                <p className="mt-1 text-sm text-gray-500">
                  Generate an API key to connect your local development server to Lynx.
                </p>
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

                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Quick Start</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Follow these steps to start your local development server with HTTPS:
                      </p>
                      
                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">1. Install the Lynx CLI globally:</p>
                          <code className="mt-2 block rounded bg-gray-100 p-2">
                            npm install -g @lynx-glopx/cli
                          </code>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">2. Start your local development server (e.g., npm run dev)</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">3. In a new terminal, run the Lynx CLI:</p>
                          <div className="mt-2 flex items-center gap-2">
                            <code className="flex-1 rounded bg-gray-100 p-2">
                              {getCliCommand(apiKeys[0]?.key)}
                            </code>
                            <button
                              onClick={() => copyToClipboard(getCliCommand(apiKeys[0]?.key))}
                              className="text-blue-600 hover:text-blue-900"
                              title="Copy command"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">4. Your local server will be available at:</p>
                          <div className="mt-2 flex items-center gap-2">
                            <code className="flex-1 rounded bg-gray-100 p-2">
                              https://lynx-seven.vercel.app:3000
                            </code>
                            <button
                              onClick={() => copyToClipboard('https://lynx-seven.vercel.app:3000')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Copy URL"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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