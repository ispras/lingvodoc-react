import { ApolloClient } from 'react-apollo';
import { createNetworkInterface } from 'apollo-upload-client';
import { each } from 'lodash';
import config from 'config';

const handleErrors = ({ response }, next) => {
  // clone response so we can turn it into json independently
  const res = response.clone();
  // if it's not user error, we skip this afterware (for example a 401)
  if (!res.ok) {
    // handle network errors based on res.status here, for example:
    if (res.status === 500) {
      window.logger.err('Internal server error');
    }
    return next();
  }

  // handle apollo errors
  res.json().then((json) => {
    if (json.error) {
      window.logger.err(`GraphQL error: ${json.error}`);
    }

    if (json.errors && json.errors.length > 0) {
      each(json.errors, (error) => {
        window.logger.err(`GraphQL error: ${error}`);
      });
    }

    each(json.data, (data) => {
      if (data && data.errors && data.errors.length) {
        window.logger.err(data.errors[0]);
      }
    });
    next();
  });
};

// Create Apollo GraphQL client
const networkInterface = createNetworkInterface({
  uri: `${config.apiUrl}/graphql`,
  opts: {
    credentials: 'same-origin',
  },
});

// register global GraphQL error handler
networkInterface.useAfter([
  {
    applyAfterware: handleErrors,
  },
]);

const apolloClient = new ApolloClient({
  networkInterface,
});

export default apolloClient;
