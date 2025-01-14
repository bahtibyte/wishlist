import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
const { json } = bodyParser;

import { dbClient, PostgresContext, initializeDB } from './db/db.js';

import { schema as userSchema } from "./graphql/users.js";
import { resolver as userResolver } from "./graphql/users.js";

const typeDefs = [userSchema]
const resolvers = [userResolver]

const app = express();

// Auth middleware
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header' });
  }

  // TODO: add auth logic here. return if fail res.status(401).json({ message: 'Unauthorized' });

  next();
};

// Apply middleware
app.use(cors());
app.use(json());

// Public REST endpoints
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok' });
});

// Private REST endpoints (with auth)
app.use('/api/*', authMiddleware);
app.get('/api/generate-signed-url', (req, res) => {
  res.json({ message: 'This is a protected route' });
});

// Setup Apollo Server
const server = new ApolloServer<PostgresContext>({
  typeDefs,
  resolvers,
});

// Initialize the database and server connections.
await initializeDB();
await server.start();

// TODO: Add auth requirements to apollo server.
app.use('/graphql', expressMiddleware(server, {
  context: async () => ({
    db: dbClient
  })
}));

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
});