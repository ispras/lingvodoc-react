import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';

import { each } from 'lodash';
import config from 'config';
import { signOut } from 'ducks/user';
import { push } from 'react-router-redux';

// const handleErrors = ({ response }, next) => {
//   // clone response so we can turn it into json independently
//   const res = response.clone();
//   // if it's not user error, we skip this afterware (for example a 401)
//   if (!res.ok) {
//     // handle network errors based on res.status here, for example:
//     if (res.status === 500) {
//       window.logger.err('Internal server error');
//     }
//     return next();
//   }

//   // handle apollo errors
//   res.json().then((json) => {
//     if (json.error) {
//       window.logger.err(`GraphQL error: ${json.error}`);
//     }

//     if (json.errors && json.errors.length > 0) {
//       each(json.errors, (error) => {
//         /* If we've caught a deactivated user, we sign them out and go to the starting page. */
//         if (error.message === 'this user account is deactivated') {
//           window.dispatch(signOut());
//           window.dispatch(push('/'));
//         }
//         window.logger.err(`GraphQL error: ${error.message}`);
//       });
//     }

//     each(json.data, (data) => {
//       if (data && data.errors && data.errors.length) {
//         window.logger.err(data.errors[0]);
//       }
//     });
//     next();
//   });
// };

const errorLink = onError(({ networkError = {}, graphQLErrors }) => {
  if (networkError.statusCode === 500) {
    window.logger.err('Internal server error');
  }

  each(graphQLErrors, (error) => {
    window.logger.err(error.message);
  });
});

const httpLink = createHttpLink({
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
