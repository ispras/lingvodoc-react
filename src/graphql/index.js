import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createUploadLink } from 'apollo-upload-client';
import { onError } from 'apollo-link-error';

import { each } from 'lodash';
import config from 'config';
import { signOut } from 'ducks/user';


const errorLink = onError(({ networkError = {}, graphQLErrors }) => {
  if (networkError.statusCode === 500) {
    window.logger.err('Internal server error');
  }

  each(graphQLErrors, (error) => {
    if (error.message === 'this user account is deactivated') {
      window.dispatch(signOut());
    }
    window.logger.err(`GraphQL error: ${error.message}`);
  });
});

const httpLink = createUploadLink({
  uri: `${config.apiUrl}/graphql`,
  credentials: 'same-origin',


});

// register global GraphQL error handler
const link = errorLink.concat(httpLink);

const cache = new InMemoryCache();

// Create Apollo GraphQL client
export default new ApolloClient({
  link,
  cache,
});
