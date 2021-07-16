import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { compositeIdToString } from 'utils/compositeId';
import { openModal } from 'ducks/modals';
import { openModal as openConfirmModal } from 'ducks/confirm';
import { getTranslation } from 'api/i18n';

import OdtMarkupModal from '../OdtMarkupModal';

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
      ],
    });
  }

  render() {
    const { data, entityId, mode, openModal, openConfirmModal } = this.props;
    if (data.loading || data.error) {
      return null;
    }

    const { parser_results, parsers } = data;

    return (
      <ul>
        {parser_results.map((res, index) =>
          <li key={compositeIdToString(res.id)} className={index === parser_results.length - 1 ? "last" : ""}>
            <Button.Group basic icon size="mini">
              <Button content={parsers.find(parser => parser.id.toString() === res.parser_id.toString()).name} />
              <Button icon="table" onClick={() => openModal(OdtMarkupModal, { entityId, resultId: res.id, mode })} />
              {mode === 'edit' && <Button icon="remove" onClick={() =>
                openConfirmModal(getTranslation('Delete parser results?'), () => this.remove(res))} />}
            </Button.Group>
          </li>
        )}
      </ul>
    );
  }
}

ParserResults.propTypes = {
  entityId: PropTypes.arrayOf(PropTypes.number).isRequired,
  mode: PropTypes.string.isRequired
};

export default compose(
  connect(null, dispatch => bindActionCreators({ openModal, openConfirmModal }, dispatch)),
  graphql(getParserResultsQuery, { options: props => ({ variables: { entity_id: props.entityId } })}),
  graphql(deleteParserResultMutation, { name: "deleteParserResult" })
)(ParserResults);
