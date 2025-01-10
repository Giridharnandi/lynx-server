import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Terminal, Key, Trash2, FileJson } from 'lucide-react';
import Button from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "react-hot-toast";

interface ApiKey {
  id: string;
  key: string;
  createdAt: Date;
  port: number;
  status: 'running' | 'stopped';
}

export default function Dashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoadingContainer, setShowLoadingContainer] = useState(false);

  useEffect(() => {
    const mockData: ApiKey[] = [
      { id: '1', key: crypto.randomUUID(), createdAt: new Date(), port: 3000, status: 'running' }
    ];
    setApiKeys(mockData);
  }, []);

  async function generateApiKey() {
    setIsGenerating(true);
    setShowLoadingContainer(true);

    try {
      // Show loading container for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newKey: ApiKey = {
        id: crypto.randomUUID(),
        key: crypto.randomUUID(),
        createdAt: new Date(),
        port: 3000 + apiKeys.length,
        status: 'running'
      };
      setApiKeys([...apiKeys, newKey]);
      toast.success("New API key generated successfully");
    } catch (error) {
      toast.error("Failed to generate API key");
      console.error('Error generating API key:', error);
    } finally {
      setIsGenerating(false);
      setShowLoadingContainer(false);
    }
  }

  async function copyToClipboard(text: string, message: string = "Copied to clipboard!") {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
      console.error('Failed to copy text:', err);
    }
  }

  async function deleteApiKey(id: string) {
    try {
      setApiKeys(apiKeys.filter(apiKey => apiKey.id !== id));
      toast.success("API key deleted successfully");
    } catch (error) {
      toast.error("Failed to delete API key");
      console.error('Error deleting API key:', error);
    }
  }

  const jsondocs = `{
    "scripts": {
      "build": "next build",
      "prepublishOnly": "npm run build",
      "test": "echo 'No tests yet' && exit 0",
      "lint": "eslint .",
      "dev": "next dev",
      "start": "next start"
    }
  }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
              Developer Dashboard
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your Local Port Access keys and get started with local development, LPA keys are used to access your local server from the internet to make it more secure the keys will get refreshed and ported to the same port number as the previous key.<br/>
              The HTTPS sever can only run under the same local network.<br/>
              {showLoadingContainer && (
                <div className="text-center mt-4">
                  <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-500 mx-auto"></div>
                  <h2 className="text-white mt-4">Running...</h2>
                  <p className="text-zinc-400">Creating tunnel to localhost:3000</p>
                </div>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-200">LPA Keys</h2>
                  <p className="text-sm text-gray-400">Generate and manage your API keys</p>
                </div>
                <Button
                  onClick={generateApiKey}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Generate LPA Key
                </Button>
              </div>

              {apiKeys.length > 0 && (
                <Card className="border-gray-800 bg-black/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800">
                        <TableHead className="text-gray-400">LPA Key</TableHead>
                        <TableHead className="text-gray-400">Created</TableHead>
                        <TableHead className="text-gray-400">Port</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-right text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((apiKey) => (
                        <TableRow key={apiKey.id} className="border-gray-800">
                          <TableCell className="font-mono text-gray-300">{apiKey.key}</TableCell>
                          <TableCell className="text-gray-400">
                            {new Date(apiKey.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-gray-400">{apiKey.port}</TableCell>
                          <TableCell className="text-gray-200">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${apiKey.status === 'running' ? 'bg-green-700' : 'bg-red-700'}`}>
                              {apiKey.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right flex space-x-2 justify-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => copyToClipboard(apiKey.key, "API key copied!")}
                              className="hover:bg-gray-800 bg-transparent text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant='secondary'
                              onClick={() => deleteApiKey(apiKey.id)}
                              className="hover:bg-red-800 bg-transparent text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-200">Quick Start Guide</h2>
              <div className="grid gap-4">
                {[
                  {
                    step: 1,
                    title: "Install the CLI",
                    command: "npm install -g @lynx-glopx/cli",
                    icon: Terminal
                  },
                  {
                    step: 2,
                    title: "Initialize Lynx",
                    command: `npx @lynx-glopx/cli start --port 3000 --project-dir path-to-project`,
                    icon: RefreshCw
                  },
                  {
                    step: 3,
                    title: "Navigate",
                    command: `https://localhost:3001`,
                    icon: Key
                  },
                  {
                    step: 4,
                    title: "Example package.json scripts React/Next JS",
                    command: jsondocs,
                    icon: FileJson
                  }
                ].map((item) => (
                  <Card key={item.step} className="border-gray-800 bg-black/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-gray-800 p-2">
                          <item.icon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-200">
                              Step {item.step}: {item.title}
                            </h3>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => copyToClipboard(item.command)}
                              className="hover:bg-gray-800 bg-transparent text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <code className="block rounded bg-gray-800/50 p-2 text-sm text-gray-300">
                            {item.command}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}