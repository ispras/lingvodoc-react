import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Modal, Dimmer, Header, Icon, Button, Confirm } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { getTranslation } from 'api/i18n';
import PropertiesView from './PropertiesView';

import './style.scss';

const getParserResultContentQuery = gql`
  query getParserResultContentQuery($id: LingvodocID!) {
    parser_result(id: $id) {
      id
      content
    }
  }
`;

const updateParserResultMutation = gql`
  mutation updateParserResultMutation($id: LingvodocID!, $content: String!) {
    update_parser_result(id: $id, content: $content) {
      triumph
    }
  }
`;

/** Modal dialog for corpus markup */
class OdtMarkupModal extends React.Component {

  constructor(props) {
    super(props);

    this.initialized = false;
    this.content = null;

    this.state = {
      selection: null,
      dirty: false,
      saving: false,
      confirmClose: false
    };

    this.addClickHandlers = this.addClickHandlers.bind(this);
    this.save = this.save.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  addClickHandlers(elems) {
    Array.from(elems).forEach(elem => {
      elem.onclick = () => {
        const { selection, saving } = this.state;
        if (saving) {
          return;
        }

        if (selection !== null) {
          document.getElementById(selection).classList.remove('selected');
        }
        if (this.state.selection === elem.id) {
          this.setState({ selection: null });
        }
        else {
          elem.classList.add('selected');
          this.setState({ selection: elem.id });
        }
      }
    });
  }

  componentDidUpdate() {
    if (this.initialized) {
      return;
    }

    const root = document.getElementById("markup-content");
    if (!root) {
      return;
    }

    this.addClickHandlers(root.getElementsByClassName('unverified'));
    this.addClickHandlers(root.getElementsByClassName('verified'));

    this.initialized = true;
  }

  save() {
    const { resultId, updateParserResult } = this.props;
    const { selection } = this.state;

    if (selection) {
      document.getElementById(selection).classList.remove('selected');
    }
    const content = document.getElementById("markup-content").innerHTML;
    this.setState({ saving: true });
    updateParserResult({ variables: { id: resultId, content } }).then(() => {
      if (selection) {
        document.getElementById(selection).classList.add('selected');
      }
      this.setState({ dirty: false, saving: false });
    }).catch(() => {
      if (selection) {
        document.getElementById(selection).classList.add('selected');
      }
      this.setState({ saving: false });
    });
  }

  onClose() {
    if (this.state.dirty) {
      this.setState({ confirmClose: true });
    }
    else {
      this.props.onClose();
    }
  }

  render() {
    const { data, mode, onClose } = this.props;
    const { loading, error } = this.props.data;
    if (error) {
      return null;
    }
    if (loading) {
      return (
        <Dimmer active style={{ minHeight: '600px', background: 'none' }}>
          <Header as="h2" icon>
            <Icon name="spinner" color="yellow" loading />
          </Header>
        </Dimmer>
      );
    }

    if (!this.content) {
      const doc = new DOMParser().parseFromString(data.parser_result.content, "text/html");
      const bodies = doc.getElementsByTagName('body');
      if (!bodies.length) {
        return null;
      }
      this.content = bodies[0].innerHTML;
    }

    const { selection, dirty, saving, confirmClose } = this.state;

    return (
      <Modal open dimmer size="fullscreen" closeIcon onClose={this.onClose} closeOnDimmerClick={false}>
        <Modal.Header>{getTranslation('Text markup')}</Modal.Header>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <PropertiesView selection={selection} mode={saving ? 'view' : mode} setDirty={() => this.setState({ dirty: true })}/>
          <Modal.Content id="markup-content" scrolling dangerouslySetInnerHTML={{ __html: this.content }} style={{ padding: '10px' }}/>
        </div>
        <Modal.Actions>
          { mode === 'edit' &&
            <Button
              positive
              icon="save"
              disabled={saving || !dirty}
              loading={saving}
              content={getTranslation('Save')}
              onClick={this.save}
            />
          }
          <Button
            positive={mode !== 'edit'}
            negative={mode === 'edit'}
            icon="close"
            content={getTranslation('Close')}
            onClick={this.onClose}
          />
        </Modal.Actions>
        <Confirm
          open={confirmClose}
          header={getTranslation('Confirmation')}
          content={getTranslation('There are unsaved changes present. Are you sure you want to discard it?' )}
          onConfirm={onClose}
          onCancel={() => this.setState({ confirmClose: false })}
        />
      </Modal>
    );
  }
}

OdtMarkupModal.propTypes = {
  entityId: PropTypes.arrayOf(PropTypes.number).isRequired,
  resultId: PropTypes.arrayOf(PropTypes.number).isRequired,
  mode: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default compose(
  graphql(getParserResultContentQuery, { options: props => ({ variables: { id: props.resultId }, fetchPolicy: "network-only" })}),
  graphql(updateParserResultMutation, { name: "updateParserResult" })
)(OdtMarkupModal);
