import express from 'express';
import https from 'https';
import httpProxy from 'http-proxy';
import selfsigned from 'selfsigned';
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Generate self-signed certificate
const attrs = [{ name: 'commonName', value: '*.lynx.dev' }];
const pems = selfsigned.generate(attrs, {
  algorithm: 'sha256',
  days: 365,
  keySize: 2048
});

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
    const userDoc = await auth.getUser(userId);
    const subdomain = userDoc.email.split('@')[0];
    const tunnelId = `${subdomain}-${port}`;

    if (activeTunnels.has(tunnelId)) {
      return res.status(400).json({ error: 'Tunnel already exists' });
    }

    // Create HTTPS server for the tunnel
    const server = https.createServer({
      key: pems.private,
      cert: pems.cert
    }, (req, res) => {
      proxy.web(req, res, {
        target: `http://localhost:${port}`,
        secure: false
      });
    });

    server.listen(0, () => {
      const tunnelPort = server.address().port;
      activeTunnels.set(tunnelId, {
        server,
        port: tunnelPort,
        targetPort: port,
        userId
      });

      res.json({
        url: `https://${subdomain}.lynx.dev:${tunnelPort}`,
        tunnelId
      });
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

  tunnel.server.close();
  activeTunnels.delete(tunnelId);
  res.json({ message: 'Tunnel stopped successfully' });
});

// Get tunnel status
app.get('/api/tunnel/status', verifyApiKey, async (req, res) => {
  const userId = req.userId;
  const userTunnels = Array.from(activeTunnels.entries())
    .filter(([_, tunnel]) => tunnel.userId === userId)
    .map(([tunnelId, tunnel]) => ({
      tunnelId,
      targetPort: tunnel.targetPort,
      status: 'active'
    }));

  res.json({ tunnels: userTunnels });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Lynx server running on port ${PORT}`);
});