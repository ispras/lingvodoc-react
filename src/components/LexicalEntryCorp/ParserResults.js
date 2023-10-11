import React from "react";
import { connect } from "react-redux";
import { Button } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import { openModal as openConfirmModal } from "ducks/confirm";
import { openModal } from "ducks/modals";
import TranslationContext from "Layout/TranslationContext";
import { compositeIdToString } from "utils/compositeId";

import OdtMarkupModal from "../OdtMarkupModal";

const getParserResultsQuery = gql`
  query getParserResultsAndInfo($entity_id: LingvodocID!) {
    parser_results(entity_id: $entity_id) {
      id
      parser_id
      arguments
    }
    parsers {
      id
      name
    }
  }
`;

const deleteParserResultMutation = gql`
  mutation deleteParserResult($id: LingvodocID!) {
    delete_parser_result(id: $id) {
      triumph
    }
  }
`;

const reexecuteParserResultMutation = gql`
  mutation reexecuteParserResult($id: LingvodocID!) {
    update_parser_result(id: $id, reexecute: true) {
      triumph
    }
  }
`;

class ParserResults extends React.Component {
  constructor(props) {
    super(props);

    this.remove = this.remove.bind(this);
  }

  remove(result) {
    const { entityId, deleteParserResult } = this.props;

    deleteParserResult({
      variables: { id: result.id },
      refetchQueries: [
        {
          query: getParserResultsQuery,
          variables: { entity_id: entityId }
        }
      ]
    });
  }

  reexecute(result) {
    const { reexecuteParserResult } = this.props;
    reexecuteParserResult({ variables: { id: result.id } });
  }

  render() {
    const { data, entityId, mode, openModal, openConfirmModal } = this.props;
    if (data.loading || data.error) {
      return null;
    }

    const { parser_results, parsers } = data;

    return (
      <ul>
        {parser_results.map((res, index) => (
          <li key={compositeIdToString(res.id)} className={index === parser_results.length - 1 ? "last" : ""}>
            <Button.Group basic icon className="lingvo-buttons-group lingvo-parser-buttons-group">
              <Button
                className="lingvo-parser-buttons-group__parser"
                content={parsers.find(parser => parser.id.toString() === res.parser_id.toString()).name}
              />
              <Button 
                icon={<i className="lingvo-icon lingvo-icon_table2" />} 
                onClick={() => openModal(OdtMarkupModal, { entityId, resultId: res.id, mode })} 
              />
              {mode === "edit" && (
                <Button
                  icon={<i className="lingvo-icon lingvo-icon_refresh" />} 
                  onClick={() => openConfirmModal(this.context("Redo parser execution?"), () => this.reexecute(res))}
                />
              )}
              {mode === "edit" && (
                <Button
                  icon={<i className="lingvo-icon lingvo-icon_delete2" />}
                  onClick={() => openConfirmModal(this.context("Delete parser results?"), () => this.remove(res))}
                />
              )}
            </Button.Group>
          </li>
        ))}
      </ul>
    );
  }
}

ParserResults.contextType = TranslationContext;

ParserResults.propTypes = {
  entityId: PropTypes.arrayOf(PropTypes.number).isRequired,
  mode: PropTypes.string.isRequired
};

export default compose(
  connect(null, dispatch => bindActionCreators({ openModal, openConfirmModal }, dispatch)),
  graphql(getParserResultsQuery, { options: props => ({ variables: { entity_id: props.entityId } }) }),
  graphql(deleteParserResultMutation, { name: "deleteParserResult" }),
  graphql(reexecuteParserResultMutation, { name: "reexecuteParserResult" })
)(ParserResults);
