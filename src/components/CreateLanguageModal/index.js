import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql, gql } from 'react-apollo';
import { Button, Modal, List, Input, Select } from 'semantic-ui-react';
import { closeModal } from 'ducks/language';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { head, nth, difference, isEmpty } from 'lodash';
import { languagesQuery } from 'graphql/language';


const localesQuery = gql`
  query Locales {
    all_locales
  }
`;

class Translation extends React.Component {
  constructor(props) {
    super(props);
    const { translation } = props;
    this.state = {
      id: translation.id,
      localeId: translation.localeId,
      content: translation.content,
    };
    this.onChangeContent = this.onChangeContent.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
  }

  onChangeContent(event, data) {
    const { onChange } = this.props;
    this.setState({ content: data.value }, () => onChange(this.state));
  }

  onChangeLocale(event, data) {
    const { locales } = this.props;
    const { onChange } = this.props;
    const locale = locales.find(l => l.shortcut === data.value);
    if (locale) {
      this.setState({ localeId: locale.id }, () => onChange(this.state));
    }
  }

  render() {
    const { locales, usedLocaleIds } = this.props;

    const options = locales
      .filter(locale => usedLocaleIds.indexOf(locale.id) < 0 || locale.id === this.state.localeId)
      .map(locale => ({ key: locale.shortcut, text: locale.intl_name, value: locale.shortcut }));

    const selectedLocale = locales.find(locale => locale.id === this.state.localeId);

    return (
      <Input placeholder="" value={this.state.content} onChange={this.onChangeContent} action>
        <input />
        <Select value={selectedLocale.shortcut} options={options} onChange={this.onChangeLocale} />
      </Input>
    );
  }
}

class Translations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      translations: [],
    };
    this.addTranslation = this.addTranslation.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(translation) {
    const updateState = this.state.translations.map((t) => {
      if (t.id === translation.id) {
        return {
          ...t,
          localeId: translation.localeId,
          content: translation.content,
        };
      }
      return t;
    });

    this.setState({
      translations: updateState,
    }, () => this.props.onChange(this.state.translations));
  }

  addTranslation() {
    const { data: { error, loading, all_locales: locales } } = this.props;
    if (!loading && !error) {
      const lastId = nth(this.state.translations.map(t => t.id), -1) + 1 || 1;
      // pick next free locale id
      const ids = locales.map(locale => locale.id);
      const usedIds = this.state.translations.map(t => t.localeId);
      const freeLocales = difference(ids, usedIds);
      if (!isEmpty(freeLocales)) {
        this.setState({
          translations: [...this.state.translations, { id: lastId, localeId: head(freeLocales), content: '' }],
        }, () => this.props.onChange(this.state.translations));
      } else {
        window.logger.err('No more locales!');
      }
    }
  }

  render() {
    const { data: { error, loading, all_locales: locales } } = this.props;
    if (loading || error) {
      return null;
    }
    const { translations } = this.state;
    const usedLocaleIds = translations.map(t => t.localeId);
    return (
      <div>
        <List>
          {translations.map(translation => (
            <List.Item>
              <Translation
                locales={locales}
                translation={translation}
                usedLocaleIds={usedLocaleIds}
                onChange={this.onChange}
              />
            </List.Item>
          ))}
        </List>
        <Button basic onClick={this.addTranslation} content="add" />
      </div>
    );
  }
}

const TranslationsWithData = compose(graphql(localesQuery))(Translations);

class CreateLanguageModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      translations: [],
    };
    this.saveLanguage = this.saveLanguage.bind(this);
  }

  saveLanguage() {
    const { createLanguage, parent } = this.props;
    const translationAtoms = this.state.translations.map(t => ({ locale_id: t.localeId, content: t.content }));
    createLanguage({
      variables: { parent_id: parent.id, translationAtoms: translationAtoms },
      refetchQueries: [{
        query: languagesQuery,
      }],
    });
  }

  render() {
    const { visible, actions } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <Modal dimmer open size="small">
        <Modal.Header>Create language</Modal.Header>
        <Modal.Content>
          <h4>Translations</h4>
          <TranslationsWithData onChange={(translations) => this.setState({ translations })}/>
        </Modal.Content>
        <Modal.Actions>
          <Button icon="minus" content="Save" onClick={this.saveLanguage} />
          <Button icon="minus" content="Cancel" onClick={actions.closeModal} />
        </Modal.Actions>
      </Modal>
    );
  }
}

CreateLanguageModal.propTypes = {
  actions: PropTypes.shape({
    closeModal: PropTypes.func,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  parent: PropTypes.object,
};

const mapStateToProps = state => ({ parent: state.language.parent, visible: state.language.createVisible });

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeModal }, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(
    gql`
      mutation createLanguage($parent_id: LingvodocID!, $translationAtoms: [ObjectVal]!) {
        create_language(parent_id: $parent_id, translation_atoms: $translationAtoms) {
          triumph
        }
      }
    `,
    { name: 'createLanguage' }
  )
)(CreateLanguageModal);
