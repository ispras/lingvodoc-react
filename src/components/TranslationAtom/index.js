import React, { useContext, useState } from "react";
import { Button, Input, Select } from "semantic-ui-react";
import PropTypes from "prop-types";

import { languagesQuery } from "backend";
import TranslationContext from "Layout/TranslationContext";

import { translationGistQuery } from "../TranslationGist";

const TranslationAtom = ({
  locales,
  updateAtomMutation,
  objectId,
  id,
  parentId,
  onAtomCreated,
  editable,
  content,
  localeId
}) => {
  const getTranslation = useContext(TranslationContext);

  const [localeIdState, setLocaleIdState] = useState(localeId);
  const [contentState, setContentState] = useState(content);

  const onChangeContent = (event, data) => {
    setContentState(data.value);
  };

  const onChangeLocale = (event, data) => {
    const locale = locales.find(l => l.shortcut === data.value);
    if (locale) {
      setLocaleIdState(locale.id);
    }
  };

  const createAtom = locale_id => {
    updateAtomMutation({
      variables: {
        id: objectId,
        atom_id: id,
        locale_id,
        content: contentState
      },
      refetchQueries: [
        {
          query: translationGistQuery,
          variables: {
            id: parentId
          }
        },
        {
          query: languagesQuery
        },
        "queryPerspectivePath"
      ]
    }).then(() => {
      onAtomCreated();
    });
  };

  const updateAtom = locale_id => {
    updateAtomMutation({
      variables: {
        id: objectId,
        atom_id: id,
        locale_id,
        content: contentState
      },
      refetchQueries: [
        {
          query: translationGistQuery,
          variables: {
            id: parentId
          }
        },
        {
          query: languagesQuery
        },
        "queryPerspectivePath"
      ]
    });
  };

  // true if atom is to be created
  const isAtomNew = id == null;

  const options = locales.map(locale => ({ key: locale.shortcut, text: locale.intl_name, value: locale.shortcut }));

  const locale = locales.find(lc => lc.id === localeIdState);

  return (
    <Input
      fluid
      value={contentState}
      onChange={onChangeContent}
      disabled={!editable}
      action
      className="label-input-adaptive"
    >
      <input />
      <Select
        defaultValue={locale.shortcut}
        options={options}
        disabled={!editable || !isAtomNew}
        onChange={onChangeLocale}
      />
      {editable && isAtomNew && (
        <Button
          onClick={() => createAtom(locale.id)}
          className="lingvo-button-violet lingvo-button-violet_bradius-right"
        >
          {getTranslation("Save")}
        </Button>
      )}
      {editable && !isAtomNew && (
        <Button
          disabled={content == contentState}
          onClick={() => updateAtom(locale.id)}
          className="lingvo-button-basic-black lingvo-button-violet_bradius-right"
        >
          {getTranslation("Update")}
        </Button>
      )}
    </Input>
  );
};

TranslationAtom.propTypes = {
  objectId: PropTypes.array.isRequired,
  id: PropTypes.array,
  parentId: PropTypes.array.isRequired,
  localeId: PropTypes.number,
  content: PropTypes.string,
  locales: PropTypes.array.isRequired,
  editable: PropTypes.bool,
  createAtomMutation: PropTypes.func,
  updateAtomMutation: PropTypes.func,
  onAtomCreated: PropTypes.func
};

TranslationAtom.defaultProps = {
  id: null,
  localeId: 1,
  content: "",
  editable: true,
  onAtomCreated: () => {}
};

export default TranslationAtom;
