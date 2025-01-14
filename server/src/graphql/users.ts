import { PostgresContext } from '../db/db';

export interface User {
  id: number;
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
    username: String!
    email: String!
    icon: String!
  }

  input UpdateUserProfileInput {
    id: ID!
    profile_name: String!
    icon: String!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User
    updateUserProfile(input: UpdateUserProfileInput!): User
  }

  type Query {
    users: [User]
    user(username: String!): User
  }
`;

export const resolver = {
  Query: {
    users: async (_: any, __: any, { db }: PostgresContext) => {
      return getUsers({ db });
    },
    user: async (_: any, { username }: { username: string }, { db }: PostgresContext) => {
      return getUser(username, { db });
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: any, { db }: PostgresContext) => {
      const { profile_name, username, email, icon } = input;
      return createUser(profile_name, username, email, icon, { db });
    },
    updateUserProfile: async (_: any, { input }: any, { db }: PostgresContext) => {
      const { id, profile_name, icon } = input;
      return updateUserProfile(id, profile_name, icon, { db });
    },
  }
};

export const getUsers = async ({ db }: PostgresContext) => {
  try {
    const result = await db.query('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

export const getUser = async (username: string, { db }: PostgresContext) => {
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1 LIMIT 1',
      [username]
    );
    return result.rows.length === 1 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}

export const createUser = async (profile_name: string, username: string, email: string, icon: string, { db }: PostgresContext) => {
  try {
    const result = await db.query(
      'INSERT INTO users(profile_name, username, email, icon) VALUES($1, $2, $3, $4) RETURNING *',
      [profile_name, username, email, icon]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

export const updateUserProfile = async (id: number, profile_name: string, icon: string, { db }: PostgresContext) => {
  try {
    const result = await db.query(
      'UPDATE users SET profile_name = $1, icon = $2 WHERE id = $3 RETURNING *',
      [profile_name, icon, id]
    );
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}
