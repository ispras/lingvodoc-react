import { ApolloClient, from, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { createUploadLink } from "apollo-upload-client";

// eslint-disable-next-line import/no-unresolved
import config from "config";

const filter_out_error_set = {
  InvalidRegularExpression: null
};

export const globalErrorHandler = ({ networkError = {}, graphQLErrors = [] }) => {
  if (networkError.statusCode === 500) {
    window.logger.err("Internal server error");
  }

  graphQLErrors.forEach(error => {
    if (!filter_out_error_set.hasOwnProperty(error.message)) {
      window.logger.err(`GraphQL error: ${error.message}`);
      if (config.logGraphQLErrors) {
        console.warn(`GraphQL error: ${error.message}`);
      }
    }
  });
};

const uploadLink = createUploadLink({
  uri: `${config.apiUrl}/graphql`,
  credentials: "same-origin"
});

export default new ApolloClient({
  link: from([onError(globalErrorHandler), uploadLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Metadata: { merge: true }
    }
  })
});
