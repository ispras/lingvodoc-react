import React from "react";
import { Button, Form, Modal } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { compose } from "recompose";

import TranslationContext from "Layout/TranslationContext";
import { compositeIdToString as id2str } from "utils/compositeId";

const parsersQuery = gql`
  query getParsers {
    parsers {
      id
      name
      parameters {
        is_mandatory
        name
        type
      }
    }
  }
`;

const executeParserMutation = gql`
  mutation execute_parser($entity_id: LingvodocID!, $parser_id: LingvodocID!) {
    execute_parser(entity_id: $entity_id, parser_id: $parser_id) {
      triumph
    }
  }
`;

/** Modal dialog for execution of a parser for some corpus */
class RunParserModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      parserId: undefined,
      success: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.executeParser = this.executeParser.bind(this);
  }

  handleChange(name, value) {
    this.setState({ [name]: value });
  }

  executeParser() {
    const { executeParser, entityId } = this.props;
    const { parserId } = this.state;

    executeParser({ variables: { entity_id: entityId, parser_id: parserId } }).then(response => {
      if (response.data.execute_parser.triumph) {
        this.setState({ success: true });
      }
    });
  }

  render() {
    const { loading, error, parsers } = this.props.data;
    if (error) {
      return null;
    }
    const { onClose } = this.props;
    const { parserId, success } = this.state;

    const option_list = [];
    const parser_id_map = {};

    if (parsers) {
      for (const parser of parsers) {
        const id_str = id2str(parser.id);

        option_list.push({ text: parser.name, value: id_str });
        parser_id_map[id_str] = parser.id;
      }
    }

    return (
      <Modal open dimmer size="small" closeIcon onClose={onClose} className="lingvo-modal2">
        <Modal.Header>{this.context("Parser execution")}</Modal.Header>
        <Modal.Content>
          {success && this.context("Parser task has been started")}
          {!success && (
            <Form loading={loading}>
              <Form.Select
                name="parserId"
                fluid
                placeholder={this.context("Select parser")}
                options={option_list}
                onChange={(_e, { name, value }) => this.handleChange(name, parser_id_map[value])}
              />
            </Form>
          )}
        </Modal.Content>
        <Modal.Actions>
          {!success && (
            <Button
              disabled={!parserId}
              content={this.context("Execute")}
              onClick={this.executeParser}
              className="lingvo-button-violet"
            />
          )}
          <Button
            content={this.context(success ? "Close" : "Cancel")}
            onClick={onClose}
            className="lingvo-button-basic-black"
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

RunParserModal.contextType = TranslationContext;

RunParserModal.propTypes = {
  entityId: PropTypes.arrayOf(PropTypes.number).isRequired,
  onClose: PropTypes.func.isRequired
};

export default compose(
  graphql(parsersQuery),
  graphql(executeParserMutation, { name: "executeParser" })
)(RunParserModal);
