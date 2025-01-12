import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { dbClient, PostgresContext, initializeDB } from './db/db.js';

import { schema as userSchema } from "./graphql/users.js";
import { resolver as userResolver } from "./graphql/users.js";

const typeDefs = [userSchema]
const resolvers = [userResolver]

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer<PostgresContext>({ 
  typeDefs, 
  resolvers,
});

// Initialize the database connection.
initializeDB();

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  context: async () => ({
    db: dbClient
  }),
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);