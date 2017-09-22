import { ApolloClient, createNetworkInterface } from 'react-apollo';
import config from 'config';

const networkInterface = createNetworkInterface({ uri: `${config.apiUrl}/graphql` });

export default new ApolloClient({
  networkInterface,
});
