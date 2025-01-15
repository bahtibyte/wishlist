import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { HOST } from '@/utils/api';

const uri = HOST + '/graphql';

const httpLink = createHttpLink({ uri: uri });

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;