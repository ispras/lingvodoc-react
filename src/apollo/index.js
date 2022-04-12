import { ApolloClient, from, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { createUploadLink } from "apollo-upload-client";

// eslint-disable-next-line import/no-unresolved
import config from "config";

const errorLink = onError(({ networkError = {}, graphQLErrors }) => {
  if (networkError.statusCode === 500) {
    window.logger.err("Internal server error");
  }

  graphQLErrors.forEach(error => {
    window.logger.err(`GraphQL error: ${error.message}`);
  });
});

const uploadLink = createUploadLink({
  uri: `${config.apiUrl}/graphql`,
  credentials: "same-origin"
});

export default new ApolloClient({
  link: from([errorLink, uploadLink]),
  cache: new InMemoryCache()
});
