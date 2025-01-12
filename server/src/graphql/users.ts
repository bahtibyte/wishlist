import { Client } from 'pg';

export interface User {
  id: string;
  profile_name: string;
  username: string;
  email: string;
  icon: string;
}

export const schema = `#graphql
  type User {
    id: ID
    profile_name: String
    username: String
    email: String
    icon: String
  }

  input CreateUserInput {
    profile_name: String!
    email: String!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User
  }

  type Query {
    users: [User]
  }
`;

interface Context {
  db: Client;
}

export const resolver = {
  Query: {
    users: async (_: any, __: any, { db }: Context) => {
      try {
        const result = await db.query('SELECT * FROM users');
        return result.rows;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: any, { db }: Context) => {
      try {
        const { profile_name, email } = input;
        const result = await db.query(
          'INSERT INTO users(profile_name, email) VALUES($1, $2) RETURNING *',
          [profile_name, email]
        );
        return result.rows[0];
      } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user');
      }
    },
  }
};