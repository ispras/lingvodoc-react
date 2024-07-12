import React from "react";
import { Button, Form, Input, Modal } from "semantic-ui-react";
import PropTypes from "prop-types";

import TranslationContext from "Layout/TranslationContext";

/** Modal dialog for creating/editing of user defined variant */
class UserVariantModal extends React.Component {
  constructor(props) {
    super(props);

    const { result } = props;
    this.state = {
      id: result ? result.id : null,
      state: result ? result.state : "result user",
      lex: result ? result.lex : "",
      parts: result ? result.parts : "",
      gloss: result ? result.gloss : "",
      gr: result ? result.gr : "",
      trans_ru: result ? result.trans_ru : ""
    };

    this.save = this.save.bind(this);
  }

  save() {
    const { parent, result, onSubmit, onClose, getAvailableId } = this.props;
    if (result) {
      Object.assign(result, this.state);
    } else {
      parent.push({...this.state, id: getAvailableId()});
    }
    onSubmit();
    onClose();
  }

  render() {
    const { result, onClose } = this.props;
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
            content={this.context(result ? "Save" : "Create")}
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
  parent: PropTypes.array,
  result: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default UserVariantModal;
