import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { compose, onlyUpdateForKeys, withProps, branch, renderNothing } from 'recompose';
import { graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { Button, Checkbox, Modal, Header, Dropdown } from 'semantic-ui-react';
import Languages from 'components/Languages';
import Translations from 'components/Translation';
import { closeConvert } from 'ducks/markup';

import { compositeIdToString } from 'utils/compositeId';
import { dictionariesQuery, convertToNewDictionaryMutation, convertToExistingDictionaryMutation } from './graphql';

class ConverEafModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'new',
      parentLanguage: null,
      translations: [],
      dictionary: null,
    };
    this.convert = this.convert.bind(this);
    this.handleModeChange = this.handleModeChange.bind(this);
    this.conversionEnabled = this.conversionEnabled.bind(this);
  }

  handleModeChange(e, { value: mode }) {
    this.setState({ mode });
  }

  convert() {
    const {
      convertToNewDictionary, convertToExistingDictionary, markup, actions,
    } = this.props;
    const {
      mode, parentLanguage, dictionary, translations,
    } = this.state;

    if (mode === 'new') {
      convertToNewDictionary({
        variables: {
          markupId: markup.id,
          languageId: parentLanguage.id,
          atoms: translations.map(a => ({ locale_id: a.localeId, content: a.content })),
        },
      }).then(() => {
        actions.closeConvert();
      });
    } else if (mode === 'update') {
      convertToExistingDictionary({
        variables: {
          markupId: markup.id,
          dictionaryId: dictionary.id,
        },
      }).then(() => {
        actions.closeConvert();
      });
    }
  }

  conversionEnabled() {
    const {
      mode, parentLanguage, dictionary, translations,
    } = this.state;
    switch (mode) {
      case 'new':
        return !!parentLanguage && translations.length > 0;
      case 'update':
        return !!dictionary;
      default:
        return false;
    }
  }

  render() {
    const { visible, actions, data: { dictionaries } } = this.props;
    const { mode, parentLanguage, translations } = this.state;
    const dictOtions = dictionaries.map((d) => {
      const id = compositeIdToString(d.id);
      return { key: id, value: d, text: d.translation };
    });
    return (
      <Modal open={visible} dimmer size="large">
        <Modal.Header>
          <Checkbox
            radio
            label="Create dictionary"
            name="vowelsRadioGroup"
            value="new"
            checked={mode === 'new'}
            onChange={this.handleModeChange}
          />
          <Checkbox
            radio
            label="Update dictionary"
            name="vowelsRadioGroup"
            value="update"
            checked={mode === 'update'}
            onChange={this.handleModeChange}
          />
        </Modal.Header>

        <Modal.Content>
          {mode === 'new' && (
            <div style={{ minHeight: '500px' }}>
              <div>
                <Header>Add one or more translations</Header>
                <Translations translations={translations} onChange={t => this.setState({ translations: t })} />
              </div>

              {!parentLanguage && <Header>Please, select the parent language</Header>}
              {parentLanguage && (
                <Header>
                  You have selected: <b>{parentLanguage.translation}</b>
                </Header>
              )}
              <div style={{ height: '400px' }}>
                <Languages onSelect={p => this.setState({ parentLanguage: p })} />
              </div>
            </div>
          )}
          {mode === 'update' && (
            <div>
              <Dropdown
                placeholder="Select dictionary"
                fluid
                search
                selection
                options={dictOtions}
                onChange={(e, { value }) => this.setState({ dictionary: value })}
              />
            </div>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button positive icon="plus" content="Convert" onClick={this.convert} disabled={!this.conversionEnabled()} />
          <Button negative icon="minus" content="Cancel" onClick={actions.closeConvert} />
        </Modal.Actions>
      </Modal>
    );
  }
}

ConverEafModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  audio: PropTypes.object,
  markup: PropTypes.object,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    closeConvert: PropTypes.func.isRequired,
  }).isRequired,
  convertToNewDictionary: PropTypes.func.isRequired,
  convertToExistingDictionary: PropTypes.func.isRequired,
};

const mapStateToProps = state => state.markup;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeConvert }, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  branch(({ convertVisible }) => !convertVisible, renderNothing),
  withProps(props => ({ visible: props.convertVisible, audio: props.data.audio, markup: props.data.markup })),
  graphql(dictionariesQuery),
  graphql(convertToNewDictionaryMutation, { name: 'convertToNewDictionary' }),
  graphql(convertToExistingDictionaryMutation, { name: 'convertToExistingDictionary' }),
  branch(({ data }) => data.loading, renderNothing)
)(ConverEafModal);
