import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Form, Select } from "semantic-ui-react";
import { useQuery } from "@apollo/client";

import { getLanguagesForSearch } from "backend";
import { useTranslations } from "hooks";
import { compositeIdToString } from "utils/compositeId";

import "./styles.scss";

/**
 * Dropdown language selector with search capability.
 */
const LanguageSearchField = ({ variables }) => {
  const { getTranslation, chooseTranslation } = useTranslations();

  const [searchParams, setSearchParams] = useSearchParams();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState();

  const { loading, data } = useQuery(getLanguagesForSearch, {
    variables,
    fetchPolicy: "network-only"
  });

  const options = useMemo(
    () =>
      data
        ? data.languages
            .map(language => ({
              text: chooseTranslation(language.translations),
              value: compositeIdToString(language.id)
            }))
            .filter(option => option.value !== undefined && option.text !== "")
            .sort((first, second) => {
              const translationFirst = first.text.toLocaleLowerCase();
              const translationSecond = second.text.toLocaleLowerCase();
              if (translationFirst < translationSecond) {
                return -1;
              } else if (translationFirst > translationSecond) {
                return 1;
              }
              return 0;
            })
        : [],
    [data]
  );

  return (
    <Container>
      <Form>
        <Form.Field>
          <Select
            className={`langs-search-field${selected ? " langs-search-field-filled" : ""}`}
            fluid
            search
            clearable
            lazyLoad
            loading={loading}
            selectOnBlur={false}
            selectOnNavigation={false}
            placeholder={getTranslation("Start typing language name")}
            noResultsMessage={getTranslation("No languages found")}
            options={options}
            value={selected}
            onChange={(_event, d) => {
              setSelected(d.value);
              searchParams.set("entity", d.value);
              setSearchParams(searchParams);
            }}
          />
        </Form.Field>
      </Form>
    </Container>
  );
};

export default LanguageSearchField;
