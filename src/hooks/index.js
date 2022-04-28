import { useMutation as useApolloMutation } from "@apollo/client";

import { globalErrorHandler } from "apolo";

export function useMutation(mutation, { onError, ...options }) {
  return useApolloMutation(mutation, {
    onError: onError
      ? error => {
          globalErrorHandler(error);
          onError(error);
        }
      : globalErrorHandler,
    ...options
  });
}
