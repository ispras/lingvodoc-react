import React, { useCallback, useEffect, useState, useContext } from "react";
import { Button, Dropdown, Input, List, TextArea } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { difference, head, isEmpty, nth } from "lodash";
import PropTypes from "prop-types";
import { compose } from "recompose";

import TranslationContext from "Layout/TranslationContext";

const localesQuery = gql`
  query Locales {
    all_locales
  }
`;

export const Translation = ({
  translation,
  locales,
  usedLocaleIds,
  textArea,
  translations,
  onChange,
  onChangeTranslations
}) => {
  const [id, setId] = useState(translation.id);
  const [localeId, setLocaleId] = useState(translation.localeId);
  const [content, setContent] = useState(translation.content);

  useEffect(() => {
    onChange({
      id,
      localeId,
      content
    });
  }, [id, localeId, content]);

  const onChangeContent = (event, data) => {
    setContent(data.value);
  };

  const onChangeLocale = (event, data) => {
    const locale = locales.find(l => l.shortcut === data.value);
    if (locale) {
      setLocaleId(locale.id);
    }
  };

  const onDeleteTranslation = (event, { translationid }) => {
    const newTranslations = [];
    translations.forEach(translation => {
      if (translation.id != translationid) {
        newTranslations.push(translation);
      }
    });

    onChangeTranslations(newTranslations);
  };

  const options = locales
    .filter(locale => usedLocaleIds.indexOf(locale.id) < 0 || locale.id === localeId)
    .map(locale => ({ key: locale.shortcut, text: locale.intl_name, value: locale.shortcut }));

  const selectedLocale = locales.find(locale => locale.id === localeId);

  return textArea ? (
    <div className="lingvo-atom-grid" key={id}>
      <div className="lingvo-atom-grid__text">
        <TextArea
          rows={2}
          placeholder=""
          value={content}
          onChange={onChangeContent}
          className="lingvo-gist-elem lingvo-gist-elem_textarea"
        />
      </div>
      <div className="lingvo-atom-grid__lang">
        <Dropdown
          className="lingvo-gist-elem lingvo-gist-elem_language"
          options={options}
          value={selectedLocale.shortcut}
          onChange={onChangeLocale}
          selection
          icon={<i className="lingvo-icon lingvo-icon_arrow" />}
        />
      </div>
      <div className="lingvo-atom-grid__delete">
        <Button
          icon={<i className="lingvo-icon lingvo-icon_trash" />}
          disabled={translations.length == 1}
          onClick={onDeleteTranslation}
          translationid={id}
          className="lingvo-button-atom-delete lingvo-button-atom-delete_disab-hidden"
        />
      </div>
    </div>
  ) : (
    <div className="lingvo-atom-grid" key={id}>
      <div className="lingvo-atom-grid__text">
        <Input value={content} onChange={onChangeContent} fluid className="lingvo-gist-elem" />
      </div>
      <div className="lingvo-atom-grid__lang">
        <Dropdown
          className="lingvo-gist-elem lingvo-gist-elem_language"
          options={options}
          value={selectedLocale.shortcut}
          onChange={onChangeLocale}
          selection
          icon={<i className="lingvo-icon lingvo-icon_arrow" />}
        />
      </div>
      <div className="lingvo-atom-grid__delete">
        <Button
          icon={<i className="lingvo-icon lingvo-icon_trash" />}
          disabled={translations.length == 1}
          onClick={onDeleteTranslation}
          translationid={id}
          className="lingvo-button-atom-delete lingvo-button-atom-delete_disab-hidden"
        />
      </div>
    </div>
  );
};

Translation.propTypes = {
  locales: PropTypes.array.isRequired,
  usedLocaleIds: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  translation: PropTypes.object.isRequired,
  onChangeTranslations: PropTypes.func.isRequired,
  translations: PropTypes.array
};

const Translations = ({ data, onChange, textArea, textAddButton, translations }) => {
  const getTranslation = useContext(TranslationContext);

  const [translationsState, setTranslationsState] = useState(
    (translations.length && translations) || [{ id: 1, localeId: 1, content: "" }]
  );

  useEffect(() => {
    onChange(translationsState);
  }, [translationsState]);

  const onChange2 = useCallback(
    translation => {
      const updateState = translationsState.map(t => {
        if (t.id === translation.id) {
          return {
            ...t,
            localeId: translation.localeId,
            content: translation.content
          };
        }
        return t;
      });

      setTranslationsState(updateState);
    },
    [translationsState]
  );

  const addTranslation = useCallback(() => {
    const { error, loading, all_locales: locales } = data;

    if (!loading && !error) {
      const lastId =
        nth(
          translationsState.map(t => t.id),
          -1
        ) + 1 || 1;

      // pick next free locale id
      const ids = locales.map(locale => locale.id);

      const usedIds = translationsState.map(t => t.localeId);

      const freeLocales = difference(ids, usedIds);

      if (!isEmpty(freeLocales)) {
        setTranslationsState([...translationsState, { id: lastId, localeId: head(freeLocales), content: "" }]);
      } else {
        window.logger.err(getTranslation("No more locales!"));
      }
    }
  }, [translationsState]);

  const isAddTranslationDisabled = useCallback(() => {
    return !translationsState.length || translationsState.some(translation => translation.content.length === 0);
  }, [translationsState]);

  const { error, loading, all_locales: locales } = data;

  if (loading || error) {
    return null;
  }

  const usedLocaleIds = translationsState.map(t => t.localeId);

  return (
    <div className="lingvo-translation__content">
      <List style={{ marginBottom: "20px" }}>
        {translationsState.map(translation => (
          <List.Item key={translation.id} style={{ marginBottom: "16px", paddingTop: "0", paddingBottom: "0" }}>
            <Translation
              locales={locales}
              translation={translation}
              translations={translationsState}
              onChangeTranslations={translations => setTranslationsState(translations)}
              usedLocaleIds={usedLocaleIds}
              onChange={onChange2}
              textArea={textArea}
            />
          </List.Item>
        ))}
      </List>
      <Button
        onClick={addTranslation}
        content={(textAddButton && getTranslation(textAddButton)) || getTranslation("Add translation")}
        disabled={isAddTranslationDisabled()}
        className="lingvo-button-violet"
      />
    </div>
  );
};

Translations.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    all_locales: PropTypes.array
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  translations: PropTypes.array
};

Translations.defaultProps = {
  translations: []
};

export default compose(graphql(localesQuery, { options: { fetchPolicy: "cache-and-network" } }))(Translations);
