import { useContext, useMemo } from "react";
import { useMutation as useApolloMutation } from "@apollo/client";

import { chooseTranslation } from "api/i18n";
import { globalErrorHandler } from "apolo";
import TranslationContext from "Layout/TranslationContext";

export function useTranslations() {
  const getTranslation = useContext(TranslationContext);

  const result = useMemo(() => ({ getTranslation, chooseTranslation }), [getTranslation]);

  return result;
}

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
