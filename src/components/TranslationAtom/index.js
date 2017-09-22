import React from 'react';
import PropTypes from 'prop-types';
import { graphql, gql } from 'react-apollo';

import { Button, Input, Select } from 'semantic-ui-react';

@graphql(gql`
  mutation updateAtom($id: [Int], $content: String!) {
    update_translationatom(id: $id, content: $content) {
      triumph
    }
  }
`)
export default class TranslationAtom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      content: props.atom.content,
      localeId: props.atom.locale_id,
    };

    this.onChangeContent = this.onChangeContent.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.onSave = this.onSave.bind(this);
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

  onSave(atom) {
    this.props.mutate({
      variables: { id: atom.id, content: atom.content },
    });
  }

  render() {
    const { atom, locales, editable } = this.props;

    const options = locales.map(
      locale => (
        { key: locale.shortcut, text: locale.intl_name, value: locale.shortcut }
      )
    );

    const locale = locales.find(lc => lc.id === this.state.localeId);

    const updatedAtom = {
      ...atom,
      content: this.state.content,
      locale_id: this.state.localeId,
    };

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
          disabled={!editable}
          onChange={this.onChangeLocale}
        />
        {editable &&
          <Button onClick={() => this.onSave(updatedAtom)}>Save</Button>
        }
      </Input>
    );
  }
}

TranslationAtom.propTypes = {
  atom: PropTypes.object.isRequired,
  locales: PropTypes.array.isRequired,
  editable: PropTypes.bool.isRequired,
  mutate: PropTypes.func,
};

TranslationAtom.defaultProps = {
  mutate: () => {},
};
