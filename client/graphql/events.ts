import { gql } from '@apollo/client';

export const GET_EVENTS = gql`
  query GetEvents($user_id: ID!) {
    events(user_id: $user_id) {
      id
      user_id
      event_type
      event_date
      timezone
      color
    }
  }
`;

export const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
      id
      event_type
      event_date
      timezone
      color
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($user_id: ID!, $input: CreateEventInput!) {
    createEvent(user_id: $user_id, input: $input) {
      id
      event_type
      event_date
      timezone
      color
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      event_type
      event_date
      timezone
      color
    }
  }
`;  

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id) {
      id
    }
  }
`;
