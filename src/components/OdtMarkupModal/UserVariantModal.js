import React from "react";
import { Button, Form, Input, Modal } from "semantic-ui-react";
import PropTypes from "prop-types";

import TranslationContext from "Layout/TranslationContext";

/** Modal dialog for creating/editing of user defined variant */
class UserVariantModal extends React.Component {
  constructor(props) {
    super(props);

    const { variant } = props;
    this.state = {
      lex: variant ? variant.lex : "",
      parts: variant ? variant.parts : "",
      gloss: variant ? variant.gloss : "",
      gr: variant ? variant.gr : "",
      trans_ru: variant ? variant.trans_ru : ""
    };

    this.save = this.save.bind(this);
  }

  save() {
    const { parent, variant, onSubmit, onClose } = this.props;
    if (variant) {
      variant.result.innerHTML = JSON.stringify(this.state);
    } else {
      const elem = document.createElement("span");
      elem.classList.add("result");
      elem.classList.add("user");
      elem.innerHTML = JSON.stringify(this.state);
      parent.append(elem);
      elem.id = `${elem.previousElementSibling ? elem.previousElementSibling.id : parent.id}!`;
    }
    onSubmit();
    onClose();
  }

  render() {
    const { variant, onClose } = this.props;
    const { lex, parts, gloss, gr, trans_ru } = this.state;
    const isValid =
      lex.trim() !== "" && parts.trim() !== "" && gloss.trim() !== "" && gr.trim() !== "" && trans_ru.trim() !== "";

    return (
      <Modal open dimmer size="small" closeIcon onClose={onClose} closeOnDimmerClick={false} className="lingvo-modal2">
        <Modal.Header>{this.context("User defined variant")}</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field required>
              <label>Lex</label>
              <Input value={lex} onChange={(_e, data) => this.setState({ lex: data.value })} />
            </Form.Field>
            <Form.Field required>
              <label>Parts</label>
              <Input value={parts} onChange={(_e, data) => this.setState({ parts: data.value })} />
            </Form.Field>
            <Form.Field required>
              <label>Gloss</label>
              <Input value={gloss} onChange={(_e, data) => this.setState({ gloss: data.value })} />
            </Form.Field>
            <Form.Field required>
              <label>Gr</label>
              <Input value={gr} onChange={(_e, data) => this.setState({ gr: data.value })} />
            </Form.Field>
            <Form.Field required>
              <label>Trans_ru</label>
              <Input value={trans_ru} onChange={(_e, data) => this.setState({ trans_ru: data.value })} />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            disabled={!isValid}
            content={this.context(variant ? "Save" : "Create")}
            onClick={this.save}
            className="lingvo-button-violet"
          />
          <Button content={this.context("Cancel")} onClick={onClose} className="lingvo-button-basic-black" />
        </Modal.Actions>
      </Modal>
    );
  }
}

UserVariantModal.contextType = TranslationContext;

UserVariantModal.propTypes = {
  parent: PropTypes.object,
  variant: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default UserVariantModal;
