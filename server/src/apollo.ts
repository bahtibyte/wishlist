import { rds, initializeDB, PostgresContext } from './rds.js'

import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';

import { schema as userSchema } from "./graphql/users.js";
import { resolver as userResolver } from "./graphql/users.js";

import { schema as statsSchema } from "./graphql/stats.js";
import { resolver as statsResolver } from "./graphql/stats.js";

import { schema as eventsSchema } from "./graphql/events.js";
import { resolver as eventsResolver } from "./graphql/events.js";

const typeDefs = [userSchema, statsSchema, eventsSchema]
const resolvers = [userResolver, statsResolver, eventsResolver]

// Setup Apollo Server
export const server = new ApolloServer<PostgresContext>({ typeDefs, resolvers });

// Initialize the database and server connections.
await initializeDB();
await server.start();

// Apollo middleware for Express
export const apolloMiddleware = expressMiddleware(server, {
  context: async () => ({ db: rds })
})