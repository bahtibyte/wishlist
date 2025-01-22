import { PostgresContext } from '../rds';
import { dateScalar } from './date.js';

export interface Event {
  id: number;
  user_id: number;
  event_type: string;
  event_date: Date;
  timezone: string;
  color: string;
}

export interface CreateEventInput {
  event_type: string;
  event_date: Date;
  timezone: string;
  color: string;
}

export interface UpdateEventInput {
  event_type: string;
  event_date: Date;
  timezone: string;
  color: string;
}

export const schema = `#graphql
  scalar Date

  type Event {
    id: ID
    user_id: ID
    event_type: String
    event_date: Date
    timezone: String
    color: String
  }

  input CreateEventInput {
    event_type: String!
    event_date: Date!
    timezone: String!
    color: String!
  }

  type Query {
    events(user_id: ID!): [Event]
    event(id: ID!): Event
  }

  type Mutation {
    createEvent(user_id: ID!, input: CreateEventInput!): Event
    updateEvent(id: ID!, input: UpdateEventInput!): Event
    deleteEvent(id: ID!): Boolean
  }
`;

export const resolver = {
  Date: dateScalar,
  Query: {
    events: async (_: any, { user_id }: { user_id: number }, { db }: PostgresContext) => {
      return await getEvents(user_id, { db });
    },
    event: async (_: any, { id }: { id: number }, { db }: PostgresContext) => {
      return await getEvent(id, { db });
    }
  },
  Mutation: {
    createEvent: async (_: any, { user_id, input }: { user_id: number, input: CreateEventInput }, { db }: PostgresContext) => {
      return await createEvent(user_id, input, { db });
    },
    updateEvent: async (_: any, { id, input }: { id: number, input: UpdateEventInput }, { db }: PostgresContext) => {
      return await updateEvent(id, input, { db });
    },
    deleteEvent: async (_: any, { id }: { id: number }, { db }: PostgresContext) => {
      return await deleteEvent(id, { db });
    }
  }
};

export const getEvents = async (user_id: number, { db }: PostgresContext) => {
  try {
    const result = await db.query('SELECT * FROM events WHERE user_id = $1', [user_id]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
}

export const getEvent = async (id: number, { db }: PostgresContext) => {
  try {
    const result = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching event:', error);
    throw new Error('Failed to fetch event');
  }
}

export const createEvent = async (user_id: number, input: CreateEventInput, { db }: PostgresContext) => {
  try {
    const { event_type, event_date, timezone, color } = input;
    const result = await db.query(
      'INSERT INTO events (user_id, event_type, event_date, timezone, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, event_type, event_date, timezone, color]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
}

export const updateEvent = async (id: number, input: UpdateEventInput, { db }: PostgresContext) => {
  try {
    const { event_type, event_date, timezone, color } = input;
    const result = await db.query(
      'UPDATE events SET event_type = $2, event_date = $3, timezone = $4, color = $5 WHERE id = $1 RETURNING *',
      [id, event_type, event_date, timezone, color]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }
}

export const deleteEvent = async (id: number, { db }: PostgresContext) => {
  try {
    const result = await db.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event');
  }
}