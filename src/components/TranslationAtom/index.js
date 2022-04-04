import React from "react";
import { Button, Input, Select } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";

import { languagesQuery } from "../../graphql/language";
import { translationGistQuery } from "../TranslationGist";

export default class TranslationAtom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      localeId: props.localeId,
      content: props.content
    };

    this.onChangeContent = this.onChangeContent.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.createAtom = this.createAtom.bind(this);
    this.updateAtom = this.updateAtom.bind(this);
  }

  onChangeContent(event, data) {
    this.setState({ content: data.value });
  }

  onChangeLocale(event, data) {
    const locale = this.props.locales.find(l => l.shortcut === data.value);
    if (locale) {
      this.setState({ localeId: locale.id });
    }
  }

  createAtom(locale_id) {
    const { updateAtomMutation, objectId, id, parentId, onAtomCreated } = this.props;
    updateAtomMutation({
      variables: {
        id: objectId,
        atom_id: id,
        locale_id,
        content: this.state.content
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
        }
      ]
    }).then(() => {
      onAtomCreated();
    });
  }

  updateAtom(locale_id) {
    const { updateAtomMutation, objectId, id, parentId } = this.props;
    updateAtomMutation({
      variables: {
        id: objectId,
        atom_id: id,
        locale_id,
        content: this.state.content
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
        }
      ]
    });
  }

  render() {
    const { id, locales, editable, content } = this.props;

    // true if atom is to be created
    const isAtomNew = id == null;

    const options = locales.map(locale => ({ key: locale.shortcut, text: locale.intl_name, value: locale.shortcut }));

    const locale = locales.find(lc => lc.id === this.state.localeId);

    return (
      <Input
        fluid
        value={this.state.content}
        onChange={this.onChangeContent}
        disabled={!editable}
        action
        className="label-input-adaptive"
      >
        <input />
        <Select
          defaultValue={locale.shortcut}
          options={options}
          disabled={!editable || !isAtomNew}
          onChange={this.onChangeLocale}
        />
        {editable && isAtomNew && (
          <Button
            onClick={() => this.createAtom(locale.id)}
            className="lingvo-button-violet lingvo-button-violet_bradius-right"
          >
            {getTranslation("Save")}
          </Button>
        )}
        {editable && !isAtomNew && (
          <Button
            disabled={content == this.state.content}
            onClick={() => this.updateAtom(locale.id)}
            className="lingvo-button-basic-black lingvo-button-violet_bradius-right"
          >
            {getTranslation("Update")}
          </Button>
        )}
      </Input>
    );
  }
}

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
