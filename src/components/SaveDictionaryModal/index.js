import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { branch, compose, onlyUpdateForKeys, renderNothing } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { Button, Modal, Segment,  Header } from 'semantic-ui-react';
import { closeSaveDictionaryModal } from 'ducks/saveDictionary';
import { getTranslation } from 'api/i18n';

const query = gql`
query Dictionary($id: LingvodocID!){
  dictionary(id: $id){
    translation
  }
}
`;

const saveDictionaryMutation = gql`
  mutation SaveDictionary($id: LingvodocID!, $mode: String!) {
    save_dictionary(id: $id, mode: $mode) {
      triumph
    }
  }
`;

class Properties extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'all',
    };

    this.onChangeMode = this.onChangeMode.bind(this);
      this.saveData = this.saveData.bind(this);
      this.onSaveData = this.onSaveData.bind(this);
  }

  componentWillReceiveProps(props) {
    const { data: { error, loading, dictionary } } = props;
    if (!(loading && error)) {
    }
  }

  onChangeMode(e, { value }) {
    this.setState({
      mode: value,
    });
  }

  onSaveData(e, { value }) {
        this.saveData(value);
    }

  saveData(mode) {
    const { id, save } = this.props;
    save({
      variables: {
        id,
        mode,
      },
      refetchQueries: [
        {
          query,
          variables: {
            id,
          },
        },
      ],
    });
  }

  render() {
    const { data: { dictionary }, actions } = this.props;

    const { translation } = dictionary;

    return (
      <Modal open dimmer size="fullscreen">
        <Modal.Content>
          <Segment>
            <Header size="large">{getTranslation('Save')} {translation}?</Header>
          </Segment>
            <Segment>
                <body>{getTranslation('URL with results of saving data should appear soon after clicking save button in the tasks')}</body>
            </Segment>
        </Modal.Content>
        <Modal.Actions>
            <Button icon="save" content={getTranslation("Save all")} value="all" onClick={this.onSaveData} />
            <Button icon="save" content={getTranslation("Save only published")} value="published" onClick={this.onSaveData} />
          <Button icon="minus" content={getTranslation("Close")} onClick={actions.closeSaveDictionaryModal} />
        </Modal.Actions>
      </Modal>
    );
  }
}

Properties.propTypes = {
  id: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  save: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    closeSaveDictionaryModal: PropTypes.func.isRequired,
  }).isRequired,
};

export default compose(
  connect(
    state => state.saveDictionary,
    dispatch => ({ actions: bindActionCreators({ closeSaveDictionaryModal }, dispatch) })
  ),
  branch(({ id }) => !id, renderNothing),
  graphql(query),
  graphql(saveDictionaryMutation, { name: 'save' }),
  branch(({ data: { loading, error } }) => loading || !!error, renderNothing),
  onlyUpdateForKeys(['id', 'data'])
)(Properties);
