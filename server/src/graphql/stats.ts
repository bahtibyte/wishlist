import { PostgresContext } from '../db/db';

export interface Stats {
  id: number;
  user_id: number;
  events: number;
  wishes: number;
  friends: number;
}

interface UpdateStatsInput {
  events: number;
  wishes: number;
  friends: number;
}

export const schema = `#graphql
  type Stats {
    id: ID
    user_id: ID
    events: Int
    wishes: Int
    friends: Int
  }

  input UpdateStatsInput {
    events: Int
    wishes: Int
    friends: Int
  }

  type Query {
    stats(user_id: ID!): Stats
  }

  type Mutation {
    createStats(user_id: ID!): Stats
    updateStats(user_id: ID!, input: UpdateStatsInput!): Stats
  }
`;

export const resolver = {
  Query: {
    stats: async (_: any, { user_id }: { user_id: number }, { db }: PostgresContext) => {
      return await getStats(user_id, { db });
    }
  },
  Mutation: {
    createStats: async (_: any, { user_id }: { user_id: number }, { db }: PostgresContext) => {
      return await createStats(user_id, { db });
    },
    updateStats: async (_: any, { user_id, input }: { user_id: number, input: UpdateStatsInput }, { db }: PostgresContext) => {
      return await updateStats(user_id, input, { db });
    }
  }
};

export const getStats = async (user_id: number, { db }: PostgresContext) => {
  try {
    const result = await db.query(
      'SELECT * FROM stats WHERE user_id = $1 LIMIT 1',
      [user_id]
    );
    if (result.rows.length === 0) {
      return await createStats(user_id, { db });
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw new Error('Failed to fetch stats');
  }
}

export const createStats = async (user_id: number, { db }: PostgresContext) => {
  try {
    const result = await db.query(
      'INSERT INTO stats (user_id, events, wishes, friends) VALUES ($1, 0, 0, 0) RETURNING *',
      [user_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating stats:', error);
    throw new Error('Failed to create stats');
  }
}

export const updateStats = async (user_id: number, input: UpdateStatsInput, { db }: PostgresContext) => {
  try {
    const { events, wishes, friends } = input;
    const result = await db.query(
      'UPDATE stats SET events = $1, wishes = $2, friends = $3 WHERE user_id = $4 RETURNING *',
      [events, wishes, friends, user_id]
    );
    if (result.rows.length === 0) {
      return await createStats(user_id, { db });
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error updating stats:', error);
    throw new Error('Failed to update stats');
  }
}