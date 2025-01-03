import { USERS } from './data.js';

export interface User {
  id: string;
  name: string;
  email: string;
}

export const schema = `#graphql
  type User {
    id: ID
    name: String
    email: String
  }

  type Query {
    users: [User]
  }
`;

export const resolver = {
  Query: {
    users: () => USERS,
  },
};