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
      elemToDelete: null
    };

    this.onToggleVariant = this.onToggleVariant.bind(this);
    this.onVariantsChanged = this.onVariantsChanged.bind(this);
    this.deleteVariant = this.deleteVariant.bind(this);
  }

  onToggleVariant(variant, checked) {
    const { selection, setDirty } = this.props;
    const { result } = variant;
    const selectedElem = document.getElementById(selection);

    document.getElementById(result.id).classList.toggle("approved");
    if (checked) {
      selectedElem.classList.remove("unverified");
      selectedElem.classList.add("verified");
    } else {
      if (!selectedElem.getElementsByClassName("result approved").length) {
        selectedElem.classList.remove("verified");
        selectedElem.classList.add("unverified");
      }
    }
    setDirty();
  }

  onVariantsChanged() {
    const { setDirty } = this.props;
    setDirty();
    this.forceUpdate();
  }

  deleteVariant() {
    const { elemToDelete } = this.state;
    const { selection, setDirty } = this.props;
    const selectedElem = document.getElementById(selection);

    document.getElementById(elemToDelete).remove();
    if (!selectedElem.getElementsByClassName("result approved").length) {
      selectedElem.classList.remove("verified");
      selectedElem.classList.add("unverified");
    }
    this.setState({ elemToDelete: null });
    setDirty();
  }

  render() {
    const { selection, openModal } = this.props;
    const { elemToDelete } = this.state;
    const isEdit = this.props.mode === "edit";
    const selectedElem = selection !== null ? document.getElementById(selection) : null;
    let results = selection !== null ? Array.from(selectedElem.getElementsByClassName("result")) : [];
    if (selection && !isEdit && selectedElem.classList.contains("verified")) {
      results = results.filter(result => result.classList.contains("approved"));
    }
    const variants = results.map(result => Object.assign({ result }, JSON.parse(result.innerText)));

    return (
      <div id="variants_section">
        <Header size="small">
          {selection !== null ? this.context("Proposed variants") : this.context("Please select an element")}
        </Header>
        {selection !== null && (
          <div>
            <Divider />
            <List divided relaxed style={{ maxHeight: "calc(100vh - 269px)", overflowX: "hidden", overflowY: "auto" }}>
              {variants.map((variant, index) => (
                <List.Item key={index}>
                  <List.Content>
                    <List.Header style={{ display: "flex", flexDirection: "row", color: "blue", fontWeight: "bold" }}>
                      <Checkbox
                        key={variant.result.id}
                        defaultChecked={variant.result.classList.contains("approved")}
                        disabled={!isEdit}
                        onChange={(_e, data) => this.onToggleVariant(variant, data.checked)}
                        style={{ marginRight: "10px" }}
                      />
                      <span>{variant.lex}</span>
                      {isEdit && (
                        <div style={{ marginLeft: "auto" }}>
                          <Button
                            icon="edit"
                            size="mini"
                            color="violet"
                            onClick={() => openModal(UserVariantModal, { variant, onSubmit: this.onVariantsChanged })}
                          />
                          <Button
                            icon="delete"
                            size="mini"
                            color="red"
                            onClick={() => this.setState({ elemToDelete: variant.result.id })}
                          />
                        </div>
                      )}
                    </List.Header>
                    <List.Description
                      style={{ display: "flex", flexDirection: "column", marginTop: 5, color: "black" }}
                    >
                      <span style={{ fontStyle: "italic" }}>{variant.parts}</span>
                      <div style={{ margin: "5px 0", wordWrap: "break-word" }}>
                        <span style={{ fontWeight: "bold" }}>gloss: </span>
                        {variant.gloss}
                      </div>
                      <div style={{ wordWrap: "break-word" }}>
                        <span style={{ fontWeight: "bold" }}>gr: </span>
                        {variant.gr}
                      </div>
                      <div style={{ marginTop: 5, wordWrap: "break-word" }}>
                        <span style={{ fontWeight: "bold" }}>trans_ru: </span>
                        {variant.trans_ru}
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
                      openModal(UserVariantModal, { parent: selectedElem, onSubmit: this.onVariantsChanged })
                    }
                  />
                </List.Item>
              )}
            </List>
          </div>
        )}
        <Confirm
          open={elemToDelete !== null}
          header={this.context("Confirmation")}
          content={this.context("Are you sure you want to delete this variant?")}
          onConfirm={this.deleteVariant}
          onCancel={() => this.setState({ elemToDelete: null })}
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
  setDirty: PropTypes.func.isRequired
};

export default connect(null, dispatch => bindActionCreators({ openModal }, dispatch))(PropertiesView);
