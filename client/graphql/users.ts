import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($username: String!) {
    user(username: $username) {
      id
      profile_name
      email
      username
      icon
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      profile_name
      email
      username
      icon
    }
  }
`;