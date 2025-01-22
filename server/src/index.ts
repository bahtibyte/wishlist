import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
const { json } = bodyParser;
import { authMiddleware } from './auth.js';
import { upload, profile } from './api.js';

import { apolloMiddleware } from './apollo.js';

const app = express();

// Apply middleware
app.use(cors());
app.use(json());

// Public REST endpoints
app.get('/ping', (req, res) => { res.json({ status: 'ok' }); });

// Private REST endpoints (with auth)
app.use('/api/*', authMiddleware);
app.post('/api/profile', upload.single('image'), profile);

// TODO: Add auth requirements to apollo server.
app.use('/graphql', apolloMiddleware);

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
});