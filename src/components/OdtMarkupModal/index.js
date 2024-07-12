import React, {useState} from "react";
import { Button, Confirm, Dimmer, Header, Icon, Modal } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { compose } from "recompose";
import _isEqual from "lodash-es/isEqual";

import TranslationContext from "Layout/TranslationContext";
import scrollParent from "utils/scrollParent";

import PropertiesView from "./PropertiesView";

import "./style.scss";

const scrollIntoViewIfNeeded = elem => {
  const rectElem = elem.getBoundingClientRect(),
    rectContainer = scrollParent(elem).getBoundingClientRect();
  const container = scrollParent(elem);
  if (rectElem.bottom > rectContainer.bottom) {
    elem.scrollIntoView(false);
  }
  if (rectElem.top < rectContainer.top) {
    elem.scrollIntoView();
  }
};

const getParserResultContentQuery = gql`
  query getParserResultContentQuery($id: LingvodocID!) {
    parser_result(id: $id, exact_fmt: "json") {
      id
      content
    }
  }
`;

const updateParserResultMutation = gql`
  mutation updateParserResultMutation($id: LingvodocID!, $content: String!) {
    update_parser_result(id: $id, content: $content, content_fmt: "json") {
      triumph
    }
  }
`;

const updateParserResultForElementMutation = gql`
  mutation updateParserResultForElementMutation($id: LingvodocID!, $content: String!, $element_id: String!) {
    update_parser_result(id: $id, content: $content, element_id: $element_id, content_fmt: "json") {
      triumph
    }
  }
`;

const Word = ({children, prefix}) => {
  if (prefix && prefix.length) {
    // recursively use all the prefixes
    // e.g. <b><i>text</i></b>
    const PrefixTag = prefix[0];
    return (
      <PrefixTag>
        <Word
          prefix={prefix.slice(1)}
        >
          {children}
        </Word>
      </PrefixTag>
    );
  } else {
    return children;
  }
}

const Annotation = ({id, text, state, results, prefix, saving, selection, setSelection}) => {

  const onClick = () => {
    if (saving || !document.getSelection().isCollapsed) {
      return;
    }
    setSelection(selection === id ? null : id);
  }

  return (
    <Word prefix={prefix}>
      <span
        id={id}
        className={state + (selection === id ? ' selected' : '') }
        onClick={onClick}
      >

        {results.map(({id, state, ...data}, index) => (
          <span
            key={index}
            id={id}
            className={state}
          >
            {JSON.stringify(data)}
          </span>
        ))}

        {text}
      </span>
    </Word>
  );
}

const Sentence = ({json_sentence, saving, selection, setSelection}) => {
  return json_sentence.map((json_word, index) => {
    if (typeof json_word === 'object' && json_word.id) {
      return (
        <Annotation
          key={index}
          id={json_word.id}
          text={json_word.text}
          state={json_word.state}
          results={json_word.results ?? []}
          prefix={json_word.prefix ?? []}
          saving={saving}
          selection={selection}
          setSelection={setSelection}
        />
      );
    } else {
      return (
        <Word
          key={index}
          prefix={typeof json_word === 'object' ? json_word.prefix : []}
        >
          {typeof json_word === 'object' ? json_word.text : json_word}
        </Word>
      );
    }
  });
}

/** Modal dialog for corpus markup */
class OdtMarkupModal extends React.Component {
  constructor(props) {
    super(props);

    this.initialized = false;
    this.availableId = 0;
    this.content = null;
    this.index = null;
    this.reselection = null;

    this.state = {
      json: null,
      selection: null,
      browserSelection: null,
      dirty: false,
      saving: false,
      confirmation: null,
      movingElem: false,
      copiedElem: null,
      updating: false
    };

    this.onBrowserSelection = this.onBrowserSelection.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.addToMarkup = this.addToMarkup.bind(this);
    this.removeFromMarkup = this.removeFromMarkup.bind(this);
    this.addCopiedMarkup = this.addCopiedMarkup.bind(this);
    this.moveMarkup = this.moveMarkup.bind(this);
    this.parseElement = this.parseElement.bind(this);
    this.save = this.save.bind(this);
    this.onClose = this.onClose.bind(this);
    this.getById = this.getById.bind(this);
    this.updateJson = this.updateJson.bind(this);
    this.setElemState = this.setElemState.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.joinNeighbours = this.joinNeighbours.bind(this);
  }

  updateJson() {
    this.setState({ json: this.content, dirty: true });
  }

  getById(id) {
    if (!this.content || !id) {
      return null;
    }
    for (const prg of this.content) {
      for (const wrd of prg) {
        if (wrd.id == id) {
          return wrd;
        }
        if (typeof wrd !== 'object') {
          continue;
        }
        for (const res of wrd.results ?? []) {
          if (res.id == id) {
            return res;
          }
        }
      }
    }
    return null;
  }

  setElemState = (id, state) => {
    const elem = this.getById(id);
    if (!elem) {
      return;
    }
    //changing this.content
    switch (state) {
      case 'approved':
        if (/\bapproved\b/.test(elem.state)) {
          return;
        }
        elem.state = elem.state.trim() + " approved";
        break;
      case 'unapproved':
        elem.state = elem.state.replace(/\bapproved\b/, "");
        break;
      case 'verified':
        elem.state = elem.state.replace(/\bunverified\b/, "verified");
        break;
      case 'unverified':
        elem.state = elem.state.replace(/\bverified\b/, "unverified");
        break;
      case 'toggle_approved':
        if (elem.state.includes("approved")) {
          this.setElemState(id, 'unapproved');
        } else {
          this.setElemState(id, 'approved');
        }
        return;
      case 'toggle_verified':
        if (elem.results &&
           !elem.results.some((res) => /\bapproved\b/.test(res.state))) {
          this.setElemState(id, 'unverified');
        }
        return;
      case 'toggle_broken':
        if (elem.results &&
           !elem.results.some((res) => /\bbroken\b/.test(res.state))) {
          elem.state = elem.state.replace(/\bbroken\b/, "");
          break;
        }
        return;
    }
  }

  setSelection(id, reselect=null) {
    if (this.state.selection === id) {
      this.setState({ selection: null });
    } else {
      this.setState({ selection: id });
    }
    if (reselect) {
      this.reselection = reselect;
    }
    //console.log(id);
  }

  onKeyDown = event => {
    const { selection, saving } = this.state;

    for (const header of window.document.getElementsByClassName("header")) {
      if (header.innerText == "User defined variant") {
        return;
      }
    }

    if (saving || !document.getSelection().isCollapsed) {
      return;
    }

    const edit = this.props.mode === "edit";

    let number = parseInt(event.key, 10) - 1;

    const elem = document.getElementsByClassName("selected")[0];
    const elems = Array.from(document.querySelectorAll(".verified, .unverified"));

    if (!elem) {
      if (event.key === "ArrowRight" && elems.length > 0) {
        this.setSelection(elems[0].id);
      }
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
      if (edit && children.length === 2) {
        number = 0;
      } else {
        return;
      }
    }

    if (edit && number >= 0 && number < 10 && number < children.length) {
      let iter = -1;
      let success = false;
      for (const child of children) {
        if (child.classList !== undefined && child.classList.contains("result")) {
          iter++;
        }
        if (iter === number) {
          if (child.classList.contains("result")) {
            this.setElemState(child.id, 'approved');
            success = true;
            break;
          }
        }
      }
      if (success) {
        this.setElemState(elem.id, 'verified');
        this.updateJson();
        if (i + 1 < elems.length) {
          scrollIntoViewIfNeeded(elems[i + 1]);
          this.setSelection(elems[i + 1].id);
        } else {
          this.setSelection(null, elem.id);
        }
      }
      return;
    }

    if (event.key === "ArrowRight") {
      if (i + 1 < elems.length) {
        scrollIntoViewIfNeeded(elems[i + 1]);
        this.setSelection(elems[i + 1].id);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      if (i - 1 >= 0) {
        scrollIntoViewIfNeeded(elems[i - 1]);
        this.setSelection(elems[i - 1].id);
      }
      return;
    }

    if (edit && event.key === "Delete" && elem.classList.contains("verified")) {
      let success = false;
      for (const child of children) {
        if (child.classList !== undefined && child.classList.contains("approved")) {
          this.setElemState(child.id, 'unapproved');
          success = true;
        }
      }
      this.setElemState(elem.id, 'unverified');
      if (success) {
        this.updateJson();
      }
      this.setSelection(null, elem.id);
      return;
    }
  };

  componentDidUpdate() {

    // to select element by order in text
    if (this.index && !this.state.selection) {
      const {prgNum, wrdNum} = this.index;
      this.setState({ selection: this.content[prgNum][wrdNum].id });
      this.index = null;
    }

    // to re-render PropertiesView
    if (this.reselection) {
      this.setState({ selection: this.reselection });
      this.reselection = null;
    }

    if (this.initialized) {
      return;
    }

    const root = document.getElementById("markup-content");
    if (!root) {
      return;
    }

    Array.from(root.getElementsByTagName("span")).forEach(elem => {
      if (elem.id !== undefined) {
        const numId = Number.parseInt(elem.id);
        if (numId !== NaN && this.availableId <= numId) {
          this.availableId = numId + 1;
        }
      }
    });
    if (this.props.mode === "edit") {
      document.addEventListener("selectionchange", this.onBrowserSelection);
    }

    this.initialized = true;
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("selectionchange", this.onBrowserSelection);
    document.removeEventListener("keydown", this.onKeyDown);
  }

  onBrowserSelection() {
    const sel = document.getSelection();
    if (sel.rangeCount !== 1 || sel.anchorNode !== sel.focusNode) {
      this.setState({ browserSelection: null });
      return;
    }

    const range = sel.getRangeAt(0);
    const text = range.toString().trim();
    if (text.length === 0 || text.indexOf(" ") !== -1 || text !== range.toString()) {
      this.setState({ browserSelection: null });
      return;
    }

    const elem = sel.anchorNode.parentElement;
    if (
      !document.getElementById("markup-content").contains(elem) ||
      elem.classList.contains("verified") ||
      elem.classList.contains("unverified")
    ) {
      this.setState({ browserSelection: null });
      return;
    }

    this.setState({ selection: null, browserSelection: range });
  }

  getNodeIndex(textNode) {
    let parentNode = textNode.parentElement;

    // going out from prefix tags
    while (parentNode && parentNode.tagName !== 'P') {
      if (parentNode.id === "markup-content") {
        return null;
      }
      textNode = parentNode;
      parentNode = parentNode.parentElement;
    }
    if (!parentNode || !parentNode.parentElement) {
      return null;
    }

    // getting paragraph number and word number
    const prgNum = [...parentNode.parentElement.children].indexOf(parentNode);
    const wrdNum = [...parentNode.childNodes].indexOf(textNode);
    console.log(prgNum + ':' + wrdNum);

    return {prgNum, wrdNum};
  }

  addToMarkup(markup) {
    const { browserSelection } = this.state;
    const textNode = browserSelection.startContainer;
    const text = textNode.textContent;
    const index = this.getNodeIndex(textNode);
    if (!index) return;
    const {prgNum, wrdNum} = index;
    const prefix = this.content[prgNum][wrdNum].prefix;
    const newElements = [];

    function addNewElement({id, state, results, prefix, text}) {
      if (text !== "") {
        let elem = {};
        if (id && state) {
          elem = {...elem, id, state, text};
          if (results) {
            elem = {...elem, results};
          }
        }
        if (prefix && prefix.length) {
          elem = {...elem, prefix, text};
        }
        if (!Object.keys(elem).length) {
          elem = text;
        }
        newElements.push(elem);
      }
    }

    addNewElement({
      prefix,
      text: text.substring(0, browserSelection.startOffset)
    });

    addNewElement(markup ? {...markup, prefix} : {
      id: this.availableId,
      state: "unverified user",
      results: [],
      prefix,
      text: browserSelection.toString()
    });

    addNewElement({
      prefix,
      text: text.substring(browserSelection.endOffset)
    });

    // add new elements instead of old one into this.content
    this.content[prgNum].splice(wrdNum, 1, ...newElements);

    this.setState({
      json: this.content,
      browserSelection: null,
      dirty: true,
      selection: markup ? markup.id : this.availableId
    });

    if (!markup) this.availableId++;
  }

  joinNeighbours() {
    function isSuitable(elem, prefix) {
      // if element has annotation
      if (elem.id !== undefined) {
        return false;
      }
      return _isEqual(new Set(elem.prefix), new Set(prefix));
    }

    const elem = document.getElementById(this.state.selection);
    const index = this.getNodeIndex(elem);
    if (!index) return;
    const {prgNum, wrdNum} = index;
    const prg = this.content[prgNum];
    const wrd = prg[wrdNum];
    const prefix = wrd.prefix;
    let [toStart, toDelete, text] = [wrdNum, 1, ""];

    // get text from previous element
    if (wrdNum > 0 && isSuitable(prg[wrdNum - 1], prefix)) {
      text += prg[wrdNum - 1].text ?? prg[wrdNum - 1];
      [toStart, toDelete] = [toStart - 1, toDelete + 1];
    }

    // get text from selected element
    text += wrd.text;

    // get text from next element
    if (wrdNum < prg.length - 1 && isSuitable(prg[wrdNum + 1], prefix)) {
      text += prg[wrdNum + 1].text ?? prg[wrdNum + 1];
      [toStart, toDelete] = [toStart, toDelete + 1];
    }

    // if prefix is not empty then newElement is object
    let newElement = text;
    if (prefix && prefix.length) {
      newElement = {prefix, text};
    }

    // changing this.content
    prg.splice(toStart, toDelete, newElement);

    return wrd;
  }

  removeFromMarkup() {
    this.setState({
      confirmation: {
        content: this.context("Are you sure you want to remove selected element from markup?"),
        func: () => {
          this.joinNeighbours();
          this.setState({ json: this.content, selection: null, dirty: true, confirmation: null });
        }
      }
    });
  }

  moveMarkup() {
    this.setState({
      confirmation: {
        content: this.context("Are you sure you want to move selected element?"),
        func: () => {
          const copiedElem = this.joinNeighbours();
          this.setState({ json: this.content, selection: null, dirty: true, confirmation: null,
            copiedElem: copiedElem, movingElem: true });
        }
      }
    });
  }

  addCopiedMarkup() {
    const copiedElem = this.state.copiedElem;
    copiedElem.text = this.state.browserSelection.toString();
    this.addToMarkup(copiedElem);
    this.setState({
      copiedElem: null,
      movingElem: false,
      selection: copiedElem.id
    });
  }

  save() {
    const { resultId, updateParserResult } = this.props;
    const { json, selection } = this.state;

    this.setState({ saving: true, selection: null });

    updateParserResult({ variables: {
      id: resultId, content: JSON.stringify(json) } })

    .then(() => {
      this.setState({ dirty: false, saving: false, selection: selection });
    })

    .catch(() => {
      this.setState({ saving: false, selection: selection });
    });
  }

  parseElement() {
    const { resultId, updateParserResultForElement } = this.props;
    const { json, selection, dirty } = this.state;
    const elem = document.getElementsByClassName("selected")[0];
    this.index = this.getNodeIndex(elem);
    let content = "";

    if (dirty) {
      content = JSON.stringify(json);
    }

    this.setState({ updating: true, selection: null });

    updateParserResultForElement({ variables:
      { id: resultId, content: content, element_id: selection } })

    .then(() => {
      this.content = null;
      this.initialized = false;
      this.setState({ updating: false, dirty: false });
    })

    .catch(() => {
      this.initialized = false;
      this.setState({ updating: false, selection: selection });
    });
  }

  onClose() {
    if (this.state.dirty) {
      this.setState({
        confirmation: {
          content: this.context("There are unsaved changes present. Are you sure you want to discard it?"),
          func: this.props.onClose
        }
      });
    } else {
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
        <Dimmer active style={{ minHeight: "600px", background: "none" }}>
          <Header as="h2" icon>
            <Icon name="spinner" loading className="lingvo-spinner" />
          </Header>
        </Dimmer>
      );
    }

    const { selection, browserSelection, dirty, saving, confirmation, movingElem, copiedElem } = this.state;
    const selectedElem = this.getById(selection);

    if (!this.content) {
      this.content = JSON.parse(data.parser_result.content);
    }

    return (
      <Modal
        open
        dimmer
        size="fullscreen"
        closeIcon
        onClose={this.onClose}
        closeOnDimmerClick={false}
        className="lingvo-modal2"
      >
        <Modal.Header>{this.context("Text markup")}</Modal.Header>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <PropertiesView
            selection={selection ? selection.toString() : null}
            mode={saving ? "view" : mode}
            updateJson={this.updateJson}
            setElemState={this.setElemState}
            getById={this.getById}
            getAvailableId={() => this.availableId++}
          />
          <Modal.Content
            id="markup-content"
            scrolling
            style={{ padding: "10px" }}
          >
            { this.content.map((json_sentence, index) => {
                return (
                  <p key={index}>
                    <Sentence
                      key={index}
                      json_sentence={json_sentence}
                      saving={saving}
                      selection={selection}
                      setSelection={this.setSelection}
                    />
                  </p>
                );
              })
            }
          </Modal.Content>
        </div>
        <Modal.Actions>
          {!saving && !movingElem && browserSelection !== null && (
            <Button
              color="violet"
              icon="plus"
              content={`${this.context("Add to markup")} '${browserSelection.toString()}'`}
              onClick={() => this.addToMarkup(null)}
              style={{ float: "left" }}
            />
          )}
          {!saving && !movingElem && selectedElem && mode === "edit" && (
            <div style={{ display: "flex", flexDirection: "row", float: "left" }}>
              <Button
                color="orange"
                icon="minus"
                content={`${this.context("Remove from markup")} '${selectedElem.text}'`}
                onClick={this.removeFromMarkup}
              />
              <Button
                color="blue"
                icon="minus"
                content={`${this.context("Move markup element")} '${selectedElem.text}'`}
                onClick={this.moveMarkup}
              />
              <Button
                color="green"
                icon="plus"
                content={`${this.context("Parse element")} '${selectedElem.text}'`}
                onClick={this.parseElement}
              />
            </div>
          )}
          {!saving && movingElem && copiedElem !== null && browserSelection !== null && (
            <Button
              color="violet"
              icon="plus"
              content={`${this.context("Move copied markup element")} '${copiedElem.text}'`}
              onClick={this.addCopiedMarkup}
              style={{ float: "left" }}
            />
          )}
          {movingElem && browserSelection == null && (
            <div style={{ float: "left" }}>
              {this.context("Select a new position for a markup element")} {copiedElem.text}
            </div>
          )}
          {mode === "edit" && (
            <Button
              disabled={saving || !dirty}
              loading={saving}
              content={this.context("Save")}
              onClick={this.save}
              className="lingvo-button-violet"
            />
          )}
          <Button content={this.context("Close")} onClick={this.onClose} className="lingvo-button-basic-black" />
        </Modal.Actions>
        <Confirm
          open={confirmation !== null}
          header={this.context("Confirmation")}
          content={confirmation ? confirmation.content : null}
          onConfirm={confirmation ? confirmation.func : null}
          onCancel={() => this.setState({ confirmation: null })}
          className="lingvo-confirm"
        />
      </Modal>
    );
  }
}

OdtMarkupModal.contextType = TranslationContext;

OdtMarkupModal.propTypes = {
  entityId: PropTypes.arrayOf(PropTypes.number).isRequired,
  resultId: PropTypes.arrayOf(PropTypes.number).isRequired,
  mode: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default compose(
  graphql(getParserResultContentQuery, {
    options: props => ({ variables: { id: props.resultId }, fetchPolicy: "network-only" })
  }),
  graphql(updateParserResultMutation, { name: "updateParserResult" }),
  graphql(updateParserResultForElementMutation, {
    options: props => ({
      refetchQueries: [
        {
          query: getParserResultContentQuery,
          variables: { id: props.resultId }
        }
      ],
      awaitRefetchQueries: true
    }),
    name: "updateParserResultForElement"
  })
)(OdtMarkupModal);
