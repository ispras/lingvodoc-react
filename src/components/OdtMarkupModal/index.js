import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Modal, Dimmer, Header, Icon, Button, Confirm } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { getTranslation } from 'api/i18n';
import PropertiesView from './PropertiesView';
import scrollParent from 'utils/scrollParent';

import './style.scss';

const scrollIntoViewIfNeeded = elem => {
  const rectElem = elem.getBoundingClientRect(), rectContainer = scrollParent(elem).getBoundingClientRect();
  const container = scrollParent(elem);
  if (rectElem.bottom > rectContainer.bottom) {
    elem.scrollIntoView(false);
  }
  if (rectElem.top < rectContainer.top) {
    elem.scrollIntoView();
  }
}

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

const updateParserResultForElementMutation = gql`
  mutation updateParserResultForElementMutation($id: LingvodocID!, $content: String!, $element_id: String!) {
    update_parser_result(id: $id, content: $content, element_id: $element_id) {
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
      confirmation: null,
      movingElem: false,
      copiedElem: null,
      updating: false
    };

    this.addClickHandlers = this.addClickHandlers.bind(this);
    this.onBrowserSelection = this.onBrowserSelection.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.addToMarkup = this.addToMarkup.bind(this);
    this.removeFromMarkup = this.removeFromMarkup.bind(this);
    this.addCopiedMarkup = this.addCopiedMarkup.bind(this);
    this.moveMarkup = this.moveMarkup.bind(this);
    this.parseElement = this.parseElement.bind(this);
    this.save = this.save.bind(this);
    this.onClose = this.onClose.bind(this);
  }

    onKeyDown = (event) => {

    const { selection, saving } = this.state;

    for (let header of window.document.getElementsByClassName("header")) {
        if (header.innerText == "User defined variant") return;}

    if (saving || !document.getSelection().isCollapsed) {
      return;
    }

    const edit = this.props.mode === 'edit';

    let number = parseInt(event.key, 10) - 1;

    const elem = document.getElementsByClassName("selected")[0];
    const elems = Array.from(document.querySelectorAll(".verified, .unverified"));

    if (!elem) {
      if (event.key === "ArrowRight" && elems.length > 0) elems[0].click();
      return;
    }

    const children = elem.childNodes;
    let i = 0;
    for (; i < elems.length; i++) {
      if (elems[i].id === elem.id) {
        break;
      }
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (edit && children.length === 2) number = 0;
      else return;
    }

    if (edit && number >= 0 && number < 10 && number < children.length) {
      let iter = -1;
      let success = false;
      for (let child of children) {
        if (child.classList !== undefined && child.classList.contains("result")) iter++;
        if (iter === number) {
          if (child.classList.contains("result")) {
            child.classList.add("approved");
            success = true;
            break;
          }
        }
      }
      if (success) {
        elem.classList.replace("unverified", "verified");
        this.setState({ dirty: true });
        if (i + 1 < elems.length) {
          scrollIntoViewIfNeeded(elems[i+1]);
          elems[i+1].click();
        }
      }
      return;
    }

    if (event.key === "ArrowRight") {
      if (i + 1 < elems.length) {
        scrollIntoViewIfNeeded(elems[i+1]);
        elems[i+1].click();
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      if (i - 1 >= 0) {
        scrollIntoViewIfNeeded(elems[i-1]);
        elems[i-1].click();
      }
      return;
    }

    if (edit && event.key === "Delete" && elem.classList.contains("verified")) {
      let success = false;
      for (let child of children) {
        if (child.classList !== undefined && child.classList.contains("approved")) {
          child.classList.remove("approved");
          success = true;
        }
      }
      this.state.selection = null;
      elem.classList.replace("verified", "unverified");
      if (success) this.setState({ dirty: true });
      elem.click();
      return;
    }

  };

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

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('selectionchange', this.onBrowserSelection);
    document.removeEventListener('keydown', this.onKeyDown);
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

  moveMarkup() {
    const elem = document.getElementById(this.state.selection);

    this.setState({
      confirmation: {
        content: getTranslation('Are you sure you want to move selected element?'),
        func: () => {
          const prev = elem.previousSibling;
          let copiedElem = elem;
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
          this.setState({ selection: null, dirty: true, confirmation: null, copiedElem: copiedElem, movingElem: true });
        }
      }
    });
  }

  addCopiedMarkup() {
    const { browserSelection } = this.state;
    const textNode = browserSelection.startContainer;
    const parentNode = textNode.parentElement;
    const text = textNode.textContent;

    let str = text.substring(0, browserSelection.startOffset);
    if (str !== '') {
      parentNode.insertBefore(document.createTextNode(str), textNode);
    }
    let copiedElem = this.state.copiedElem;
    copiedElem.lastChild.nodeValue = browserSelection.toString();
    this.addClickHandlers([copiedElem]);
    parentNode.insertBefore(copiedElem, textNode);
    str = text.substring(browserSelection.endOffset);
    if (str !== '') {
      parentNode.insertBefore(document.createTextNode(str), textNode);
    }
    parentNode.removeChild(textNode);
    this.setState({
      browserSelection: null,
      dirty: true,
      copiedElem: null,
      movingElem: false
    });
    this.availableId++;
    copiedElem.click();
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

  parseElement() {
    const { resultId, updateParserResultForElement } = this.props;
    const { selection, dirty } = this.state;
    let content = "";
    document.getElementById(selection).classList.remove('selected');
    if (dirty) {
      this.docToSave.getElementsByTagName('body')[0].innerHTML = document.getElementById("markup-content").innerHTML;
      content = new XMLSerializer().serializeToString(this.docToSave);
    }
    this.setState({ updating: true, selection: null });
    updateParserResultForElement({ variables: { id: resultId, content: content, element_id: selection } }).then(() => {
      this.content = null;
      this.initialized = false;
      this.setState({ updating: false, dirty: false });
      if (document.getElementById(selection)) {
        this.setState({ selection: selection });
        document.getElementById(selection).classList.add('selected');
      }
    }).catch(() => {
      this.initialized = false;
      this.setState({ updating: false });
      if (document.getElementById(selection)) {
        this.setState({ selection: selection });
        document.getElementById(selection).classList.add('selected');
      }
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
    const { updating } = this.state;
    if (error) {
      return null;
    }
    if (loading || updating) {
      return (
        <Dimmer active style={{ minHeight: '600px', background: 'none' }}>
          <Header as="h2" icon>
            <Icon name="spinner" loading className="lingvo-spinner" />
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

    const { selection, browserSelection, dirty, saving, confirmation, movingElem, copiedElem } = this.state;
    const selectedElem = selection === null ? null : document.getElementById(selection);

    return (
      <Modal open dimmer size="fullscreen" closeIcon onClose={this.onClose} closeOnDimmerClick={false} className="lingvo-modal2">
        <Modal.Header>{getTranslation('Text markup')}</Modal.Header>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <PropertiesView selection={selection} mode={saving ? 'view' : mode} setDirty={() => this.setState({ dirty: true })} />
          <Modal.Content id="markup-content" scrolling dangerouslySetInnerHTML={{ __html: this.content }} style={{ padding: '10px' }} />
        </div>
        <Modal.Actions>
          { !saving && !movingElem && browserSelection !== null &&
            <Button
              color="violet"
              icon="plus"
              content={`${getTranslation('Add to markup')} '${browserSelection.toString()}'`}
              onClick={this.addToMarkup}
              style={{ float: 'left' }}
            />
          }
          { !saving && !movingElem && selectedElem && mode === 'edit' &&
            <div style={{ display: 'flex', flexDirection: 'row' , float: 'left'}}>
              <Button
                color="orange"
                icon="minus"
                content={`${getTranslation('Remove from markup')} '${selectedElem.innerText}'`}
                onClick={this.removeFromMarkup}
              />
              <Button
                color="blue"
                icon="minus"
                content={`${getTranslation('Move markup element')} '${selectedElem.innerText}'`}
                onClick={this.moveMarkup}
              />
              <Button
                color="green"
                icon="plus"
                content={`${getTranslation('Parse element')} '${selectedElem.innerText}'`}
                onClick={this.parseElement}
              />
            </div>
          }
          { !saving && movingElem && copiedElem !== null && browserSelection !== null &&
            <Button
              color="violet"
              icon="plus"
              content={`${getTranslation('Move copied markup element')} '${copiedElem.lastChild.nodeValue}'`}
              onClick={this.addCopiedMarkup}
              style={{ float: 'left' }}
            />
          }
          { movingElem && browserSelection == null &&
            <div style={{ float: 'left'}}>
              {getTranslation('Select a new position for a markup element')} {copiedElem.lastChild.nodeValue}
            </div>
          }
          { mode === 'edit' &&
            <Button
              disabled={saving || !dirty}
              loading={saving}
              content={getTranslation('Save')}
              onClick={this.save}
              className="lingvo-button-violet"
            />
          }
          <Button
            content={getTranslation('Close')}
            onClick={this.onClose}
            className="lingvo-button-basic-black"
          />
        </Modal.Actions>
        <Confirm
          open={confirmation !== null}
          header={getTranslation('Confirmation')}
          content={confirmation ? confirmation.content : null}
          onConfirm={confirmation ? confirmation.func : null}
          onCancel={() => this.setState({ confirmation: null })}
          className="lingvo-confirm"
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
  graphql(updateParserResultMutation, { name: "updateParserResult" }),
  graphql(updateParserResultForElementMutation, {
    options: (props) => ({
      refetchQueries: [
        {
          query: getParserResultContentQuery,
          variables: ({ id: props.resultId })
        }
      ],
      awaitRefetchQueries: true
    }),
    name: "updateParserResultForElement" })
  )(OdtMarkupModal);
