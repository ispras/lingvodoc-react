import { ApolloClient } from 'react-apollo';
import { createNetworkInterface } from 'apollo-upload-client';
import config from 'config';

const networkInterface = createNetworkInterface({
  uri: `${config.apiUrl}/graphql`,
  opts: {
    credentials: 'same-origin',
  },
});

export default new ApolloClient({
  networkInterface,
});
