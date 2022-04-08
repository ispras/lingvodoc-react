import { ApolloClient, from, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { createUploadLink } from "apollo-upload-client";
import { each } from "lodash";

// eslint-disable-next-line import/no-unresolved
import config from "config";
import { signOut } from "ducks/user";

const errorLink = onError(({ networkError = {}, graphQLErrors }) => {
  if (networkError.statusCode === 500) {
    window.logger.err("Internal server error");
  }

  each(graphQLErrors, error => {
    if (error.message === "this user account is deactivated") {
      window.dispatch(signOut());
    }
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
