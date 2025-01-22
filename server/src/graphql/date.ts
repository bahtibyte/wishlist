import { Kind } from 'graphql/language/index.js';
import { GraphQLScalarType } from 'graphql';

export const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Custom Date scalar type',
  serialize(value: any) {
    return value.toISOString(); // Convert Date object to ISO string
  },
  parseValue(value: any) {
    return new Date(value); // Convert incoming string to Date object
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value); // Convert hard-coded string to Date object
    }
    return null; // Invalid hard-coded value
  },
});