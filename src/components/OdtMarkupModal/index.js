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
    this.availableId = 0;
    this.content = null;
    this.docToSave = null;

    this.state = {
      selection: null,
      browserSelection: null,
      dirty: false,
      saving: false,
      confirmation: null
    };

    this.addClickHandlers = this.addClickHandlers.bind(this);
    this.onBrowserSelection = this.onBrowserSelection.bind(this);
    this.addToMarkup = this.addToMarkup.bind(this);
    this.removeFromMarkup = this.removeFromMarkup.bind(this);
    this.save = this.save.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  componentDidUpdate() {
    if (this.initialized) {
      return;
    }

    const root = document.getElementById("markup-content");
    if (!root) {
      return;
    }

    Array.from(root.getElementsByTagName('span')).forEach(elem => {
      if (elem.id !== undefined) {
        const numId = Number.parseInt(elem.id);
        if (numId !== NaN && this.availableId <= numId) {
          this.availableId = numId + 1;
        }
      }
    });
    this.addClickHandlers(root.getElementsByClassName('unverified'));
    this.addClickHandlers(root.getElementsByClassName('verified'));
    if (this.props.mode === 'edit') {
      document.addEventListener('selectionchange', this.onBrowserSelection);
    }

    this.initialized = true;
  }

  componentWillUnmount() {
    document.removeEventListener('selectionchange', this.onBrowserSelection);
  }

  addClickHandlers(elems) {
    Array.from(elems).forEach(elem => {
      elem.onclick = () => {
        const { selection, saving } = this.state;
        if (saving || !document.getSelection().isCollapsed) {
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

  onBrowserSelection() {
    const sel = document.getSelection();
    if (sel.rangeCount !== 1 || sel.anchorNode !== sel.focusNode) {
      this.setState({ browserSelection: null });
      return;
    }

    const range = sel.getRangeAt(0);
    const text = range.toString().trim();
    if (text.length === 0 || text.indexOf(' ') !== -1 || text !== range.toString()) {
      this.setState({ browserSelection: null });
      return;
    }

    const elem = sel.anchorNode.parentElement;
    if (!document.getElementById("markup-content").contains(elem) ||
      elem.classList.contains('verified') ||
      elem.classList.contains('unverified')) {
      this.setState({ browserSelection: null });
      return;
    }

    const { selection } = this.state;
    if (selection !== null) {
      document.getElementById(selection).classList.remove('selected');
    }
    this.setState({ selection: null, browserSelection: range });
  }

  addToMarkup() {
    const { browserSelection } = this.state;
    const textNode = browserSelection.startContainer;
    const parentNode = textNode.parentElement;
    const text = textNode.textContent;

    let str = text.substring(0, browserSelection.startOffset);
    if (str !== '') {
      parentNode.insertBefore(document.createTextNode(str), textNode);
    }
    const span = document.createElement('span');
    span.id = this.availableId;
    span.classList.add('unverified', 'user');
    span.innerText = browserSelection.toString();
    this.addClickHandlers([span]);
    parentNode.insertBefore(span, textNode);
    str = text.substring(browserSelection.endOffset);
    if (str !== '') {
      parentNode.insertBefore(document.createTextNode(str), textNode);
    }
    parentNode.removeChild(textNode);
    this.setState({
      browserSelection: null,
      dirty: true
    });
    this.availableId++;
    span.click();
  }

  removeFromMarkup() {
    const elem = document.getElementById(this.state.selection);

    this.setState({
      confirmation: {
        content: getTranslation('Are you sure you want to remove selected element from markup?'),
        func: () => {
          const prev = elem.previousSibling;
          let content = '';
          if (prev && prev.nodeType === Node.TEXT_NODE) {
            content += prev.textContent;
            prev.remove();
          }
          content += elem.innerText;
          const next = elem.nextSibling;
          if (next && next.nodeType === Node.TEXT_NODE) {
            content += next.textContent;
            next.remove();
          }
          elem.parentElement.replaceChild(document.createTextNode(content), elem);
          this.setState({ selection: null, dirty: true, confirmation: null });
        }
      }
    });
  }

  save() {
    const { resultId, updateParserResult } = this.props;
    const { selection } = this.state;

    if (selection) {
      document.getElementById(selection).classList.remove('selected');
    }
    this.setState({ saving: true });
    this.docToSave.getElementsByTagName('body')[0].innerHTML = document.getElementById("markup-content").innerHTML;
    updateParserResult({ variables: { id: resultId, content: new XMLSerializer().serializeToString(this.docToSave) } }).then(() => {
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
      this.setState({
        confirmation: {
          content: getTranslation('There are unsaved changes present. Are you sure you want to discard it?'),
          func: this.props.onClose
        }
      });
    }
    else {
      this.props.onClose();
    }
  }

  render() {
    const { data, mode } = this.props;
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
      this.docToSave = doc;
      this.content = bodies[0].innerHTML;
    }

    const { selection, browserSelection, dirty, saving, confirmation } = this.state;
    const selectedElem = selection === null ? null : document.getElementById(selection);

    return (
      <Modal open dimmer size="fullscreen" closeIcon onClose={this.onClose} closeOnDimmerClick={false}>
        <Modal.Header>{getTranslation('Text markup')}</Modal.Header>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <PropertiesView selection={selection} mode={saving ? 'view' : mode} setDirty={() => this.setState({ dirty: true })} />
          <Modal.Content id="markup-content" scrolling dangerouslySetInnerHTML={{ __html: this.content }} style={{ padding: '10px' }} />
        </div>
        <Modal.Actions>
          { !saving && browserSelection !== null &&
            <Button
              color="violet"
              icon="plus"
              content={`${getTranslation('Add to markup')} '${browserSelection.toString()}'`}
              onClick={this.addToMarkup}
              style={{ float: 'left' }}
            />
          }
          { !saving && selectedElem && mode === 'edit' && selectedElem.classList.contains('user') &&
            <Button
              color="orange"
              icon="minus"
              content={`${getTranslation('Remove from markup')} '${selectedElem.innerText}'`}
              onClick={this.removeFromMarkup}
              style={{ float: 'left' }}
            />
          }
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
          open={confirmation !== null}
          header={getTranslation('Confirmation')}
          content={confirmation ? confirmation.content : null}
          onConfirm={confirmation ? confirmation.func : null}
          onCancel={() => this.setState({ confirmation: null })}
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
  graphql(getParserResultContentQuery, { options: props => ({ variables: { id: props.resultId }, fetchPolicy: "network-only" }) }),
  graphql(updateParserResultMutation, { name: "updateParserResult" })
)(OdtMarkupModal);
