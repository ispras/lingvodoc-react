import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Form, Select } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import PropTypes from "prop-types";

import { getLanguagesForSearch } from "backend";
import { useTranslations } from "hooks";
import { compositeIdToString } from "utils/compositeId";

import "./styles.scss";

/**
 * Dropdown language selector with search capability.
 */
const LanguageSearchField = ({ sortMode, entityId, dataList, onSelectId }) => {
  const { getTranslation, chooseTranslation } = useTranslations();

  const [searchParams, setSearchParams] = useSearchParams();

  const data = dataList[0] || dataList[1];

  const [options, languageIdSet] = useMemo(() => {
    const languageIdSet = new Set();

    if (!data) {
      return [[], languageIdSet];
    }

    const options = (data.languages ? data.languages : data.language_tree.languages)
      .map(language => {
        const languageIdStr = compositeIdToString(language.id);
        languageIdSet.add(languageIdStr);
        return {
          text: chooseTranslation(language.translations),
          value: languageIdStr
        };
      })
      .filter(option => option.value !== undefined && option.text !== "")
      .sort((first, second) => {
        const translationFirst = first.text;
        const translationSecond = second.text;
        const translationFirstLower = translationFirst.toLocaleLowerCase();
        const translationSecondLower = translationSecond.toLocaleLowerCase();
        if (translationFirstLower < translationSecondLower) {
          return -1;
        } else if (translationFirstLower > translationSecondLower) {
          return 1;
        } else if (translationFirst < translationSecond) {
          return -1;
        } else if (translationFirst > translationSecond) {
          return 1;
        }
        return 0;
      });

    return [options, languageIdSet];
  }, [chooseTranslation, data]);

  return (
    <Container>
      <Form>
        <Form.Field>
          <Select
            className={`langs-search-field${entityId ? " langs-search-field-filled" : ""}`}
            fluid
            search
            clearable
            lazyLoad
            loading={!data}
            disabled={!data}
            selectOnBlur={false}
            selectOnNavigation={false}
            placeholder={data ? getTranslation("Start typing language name") : `${getTranslation("Loading")}...`}
            noResultsMessage={getTranslation("No languages found")}
            options={options}
            value={languageIdSet.has(entityId) ? entityId : ""}
            onChange={(_event, d) => {
              if (d.value) {
                onSelectId(d.value);
              }
              if (sortMode === "language" && d.value === "") {
                searchParams.delete("language");
              } else {
                searchParams.set(sortMode, d.value);
              }
              setSearchParams(searchParams);
            }}
          />
        </Form.Field>
      </Form>
    </Container>
  );
};

LanguageSearchField.propTypes = {};

export default LanguageSearchField;
