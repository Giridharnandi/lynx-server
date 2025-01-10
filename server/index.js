import express from 'express';
import https from 'https';
import httpProxy from 'http-proxy';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const proxy = httpProxy.createProxyServer();

// Initialize Firebase Admin
initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS))
});

const auth = getAuth();
const db = getFirestore();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Store active tunnels
const activeTunnels = new Map();

// Middleware to verify API key
async function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const apiKeysRef = db.collection('apiKeys');
    const snapshot = await apiKeysRef.where('key', '==', apiKey).get();
    
    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const apiKeyDoc = snapshot.docs[0];
    req.userId = apiKeyDoc.data().userId;
    next();
  } catch (error) {
    console.error('Error verifying API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Start tunnel
app.post('/api/tunnel/start', verifyApiKey, async (req, res) => {
  const { port = 3000 } = req.body;
  const userId = req.userId;

  try {
    const tunnelId = `tunnel-${userId}-${Date.now()}`;

    // Create proxy to local server
    const proxyServer = httpProxy.createProxyServer({
      target: `http://localhost:${port}`,
      ws: true
    });

    // Handle proxy errors
    proxyServer.on('error', (err) => {
      console.error('Proxy error:', err);
    });

    // Store tunnel info
    activeTunnels.set(tunnelId, {
      proxy: proxyServer,
      userId,
      port
    });

    res.json({
      url: `https://lynx-seven.vercel.app:3000`,
      tunnelId
    });
  } catch (error) {
    console.error('Error starting tunnel:', error);
    res.status(500).json({ error: 'Failed to start tunnel' });
  }
});

// Stop tunnel
app.post('/api/tunnel/stop', verifyApiKey, async (req, res) => {
  const { tunnelId } = req.body;
  const userId = req.userId;

  const tunnel = activeTunnels.get(tunnelId);
  if (!tunnel || tunnel.userId !== userId) {
    return res.status(404).json({ error: 'Tunnel not found' });
  }

  tunnel.proxy.close();
  activeTunnels.delete(tunnelId);
  res.json({ message: 'Tunnel stopped successfully' });
});

// Proxy all other requests to local server
app.use('/', (req, res) => {
  const host = req.headers.host;
  const tunnelId = req.headers['x-tunnel-id'];
  
  const tunnel = activeTunnels.get(tunnelId);
  if (!tunnel) {
    return res.status(404).json({ error: 'Tunnel not found' });
  }

  tunnel.proxy.web(req, res);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Lynx server running on port ${PORT}`);
});