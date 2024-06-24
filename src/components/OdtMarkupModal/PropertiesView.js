import React from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Confirm, Divider, Header, List } from "semantic-ui-react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";

import { openModal } from "ducks/modals";
import TranslationContext from "Layout/TranslationContext";

import UserVariantModal from "./UserVariantModal";

/** Properties view of the corpus markup modal dialog */
class PropertiesView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      elemToDeleteId: null
    };

    this.onToggleVariant = this.onToggleVariant.bind(this);
    this.onVariantsChanged = this.onVariantsChanged.bind(this);
    this.deleteVariant = this.deleteVariant.bind(this);
  }

  onToggleVariant(result, checked) {
    const { selection, updateJson, setElemState } = this.props;

    if (checked) {
      setElemState(result.id, 'approved');
      setElemState(selection, 'verified');
    } else {
      setElemState(result.id, 'unapproved');
      setElemState(selection, 'toggle_verified');
    }
    updateJson();
  }

  onVariantsChanged() {
    this.props.updateJson();
    this.forceUpdate();
  }

  deleteVariant() {
    const { elemToDeleteId } = this.state;
    const { selection, updateJson, getById, setElemState } = this.props;
    const selectedElem = getById(selection);
    if (!selectedElem.results) return;
    const resultIndex = selectedElem.results.findIndex((res) => res.id === elemToDeleteId);
    if (resultIndex === -1) return;

    // remove our variant and update elements
    selectedElem.results.splice(resultIndex, 1);

    setElemState(selection, 'toggle_broken');
    setElemState(selection, 'toggle_verified');

    updateJson();
    this.setState({ elemToDeleteId: null });
  }

  render() {
    const { selection, openModal, getById, getAvailableId } = this.props;
    const { elemToDeleteId } = this.state;
    const isEdit = this.props.mode === "edit";
    const selectedElem = getById(selection);
    let results = [];
    if (selectedElem) {
      results = selectedElem.results;
      if (!isEdit && /\bverified\b/.test(selectedElem.state)) {
        results = results.filter(res => /\bapproved\b/.test(res.state));
      }
    }

    return (
      <div id="variants_section">
        <Header size="small">
          {selection !== null ? this.context("Proposed variants") : this.context("Please select an element")}
        </Header>
        {selection !== null && (
          <div>
            <Divider />
            <List divided relaxed style={{ maxHeight: "calc(100vh - 269px)", overflowX: "hidden", overflowY: "auto" }}>
              {results.map((result, index) => (
                <List.Item key={index}>
                  <List.Content>
                    <List.Header style={{ display: "flex", flexDirection: "row", color: "blue", fontWeight: "bold" }}>
                      {isEdit && (
                        <Checkbox
                          key={result.id}
                          defaultChecked={/\bapproved\b/.test(result.state)}
                          onChange={(_e, data) => this.onToggleVariant(result, data.checked)}
                          style={{ marginRight: "10px" }}
                        />
                      )}
                      <span>{result.lex}</span>
                      {isEdit && (
                        <div style={{ marginLeft: "auto" }}>
                          <Button
                            icon="edit"
                            size="mini"
                            color="violet"
                            onClick={() => openModal(UserVariantModal, { result, onSubmit: this.onVariantsChanged })}
                          />
                          <Button
                            icon="delete"
                            size="mini"
                            color="red"
                            onClick={() => this.setState({ elemToDeleteId: result.id })}
                          />
                        </div>
                      )}
                    </List.Header>
                    <List.Description
                      style={{ display: "flex", flexDirection: "column", marginTop: 5, color: "black" }}
                    >
                      <span style={{ fontStyle: "italic" }}>{result.parts}</span>
                      <div style={{ margin: "5px 0", wordWrap: "break-word" }}>
                        <span style={{ fontWeight: "bold" }}>gloss: </span>
                        {result.gloss}
                      </div>
                      <div style={{ wordWrap: "break-word" }}>
                        <span style={{ fontWeight: "bold" }}>gr: </span>
                        {result.gr}
                      </div>
                      <div style={{ marginTop: 5, wordWrap: "break-word" }}>
                        <span style={{ fontWeight: "bold" }}>trans_ru: </span>
                        {result.trans_ru}
                      </div>
                    </List.Description>
                  </List.Content>
                </List.Item>
              ))}
              {isEdit && (
                <List.Item key="add">
                  <Button
                    primary
                    fluid
                    icon="plus"
                    content={this.context("Add variant")}
                    onClick={() =>
                      openModal(UserVariantModal, { parent: results, onSubmit: this.onVariantsChanged, getAvailableId })
                    }
                  />
                </List.Item>
              )}
            </List>
          </div>
        )}
        <Confirm
          open={elemToDeleteId !== null}
          header={this.context("Confirmation")}
          content={this.context("Are you sure you want to delete this variant?")}
          onConfirm={this.deleteVariant}
          onCancel={() => this.setState({ elemToDeleteId: null })}
          className="lingvo-confirm"
        />
      </div>
    );
  }
}

PropertiesView.contextType = TranslationContext;

PropertiesView.propTypes = {
  selection: PropTypes.string,
  mode: PropTypes.string.isRequired,
  updateJson: PropTypes.func.isRequired,
  setElemState: PropTypes.func.isRequired,
  getAvailableId: PropTypes.func.isRequired
};

export default connect(null, dispatch => bindActionCreators({ openModal }, dispatch))(PropertiesView);
