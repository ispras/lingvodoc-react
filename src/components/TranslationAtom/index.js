import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { Button, Input, Select } from 'semantic-ui-react';

import { translationGistQuery } from '../TranslationGist';
import { languagesQuery } from '../../graphql/language';

@graphql(gql`
  mutation updateAtom($id: LingvodocID!, $content: String!) {
    update_translationatom(id: $id, content: $content) {
      triumph
    }
  }
`, { name: 'updateAtomMutation' })
@graphql(gql`
  mutation ($parent_id: LingvodocID!, $locale_id: Int!, $content: String!) {
    create_translationatom( parent_id: $parent_id, locale_id: $locale_id, content: $content) {
      translationatom {
        content
      }
      triumph
    }
  }`, { name: 'createAtomMutation' })
export default class TranslationAtom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      localeId: props.localeId,
      content: props.content,
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

  createAtom() {
    const { parentId, createAtomMutation, onAtomCreated } = this.props;
    const { localeId, content } = this.state;
    createAtomMutation({
      variables: { parent_id: parentId, locale_id: localeId, content },
      refetchQueries: [{
        query: translationGistQuery,
        variables: {
          id: parentId,
        },
      }, {
        query: languagesQuery,
      }],
    });
    onAtomCreated();
  }

  updateAtom() {
    const { id, parentId, updateAtomMutation } = this.props;
    const { content } = this.state;
    updateAtomMutation({
      variables: { id, content },
      refetchQueries: [{
        query: translationGistQuery,
        variables: {
          id: parentId,
        },
      },
      {
        query: languagesQuery,
      }],
    });
  }

  render() {
    const { id, locales, editable } = this.props;

    // true if atom is to be create
    const isAtomNew = id.every(n => n == null);

    const options = locales.map(
      locale => (
        { key: locale.shortcut, text: locale.intl_name, value: locale.shortcut }
      )
    );

    const locale = locales.find(lc => lc.id === this.state.localeId);

    return (
      <Input
        placeholder=""
        value={this.state.content}
        onChange={this.onChangeContent}
        disabled={!editable}
        action
      >
        <input />
        <Select
          defaultValue={locale.shortcut}
          options={options}
          disabled={!editable || !isAtomNew}
          onChange={this.onChangeLocale}
        />
        {editable && isAtomNew &&
          <Button onClick={() => this.createAtom()}>Save</Button>
        }
        {editable && !isAtomNew &&
          <Button onClick={() => this.updateAtom()}>Update</Button>
        }
      </Input>
    );
  }
}

TranslationAtom.propTypes = {
  id: PropTypes.array,
  parentId: PropTypes.array.isRequired,
  localeId: PropTypes.number,
  content: PropTypes.string,
  locales: PropTypes.array.isRequired,
  editable: PropTypes.bool,
  createAtomMutation: PropTypes.func,
  updateAtomMutation: PropTypes.func,
  onAtomCreated: PropTypes.func,
};

TranslationAtom.defaultProps = {
  id: [null, null],
  localeId: 1,
  content: '',
  editable: true,
  createAtomMutation: () => {},
  updateAtomMutation: () => {},
  onAtomCreated: () => {},
};
