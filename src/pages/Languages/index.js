import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { Container } from 'semantic-ui-react';
import EditModal from 'components/EditLanguageModal';
import { languagesQuery } from 'graphql/language';
import { compositeIdToString } from 'utils/compositeId';
import * as actions from 'ducks/language';
import Language from './language';

import languageListToTree from './utils';

/**
 * The component represents the tree of languages
 */
@graphql(languagesQuery)
class Languages extends React.Component {
  render() {
    const { data, state } = this.props;
    // Actions wired in by Redux
    const { actions: { openModalEdit, closeModal } } = this.props;

    if (data.loading) {
      return null;
    }

    // convert languages from flat list to tree
    const tree = languageListToTree(data.languages);

    return (
      <Container>
        <ul>
          {tree.map(language => (
            <Language key={compositeIdToString(language.id)} language={language} edit={openModalEdit} />
          ))}
        </ul>
        <span>
          {state.language && (
            // show edit modal is user clicked edit button
            <EditModal language={state.language} close={closeModal} />
          )}
        </span>
      </Container>
    );
  }
}

Languages.propTypes = {
  /**
   * Object is create by ApolloClient
   */
  data: PropTypes.object,

  /**
   * Actions wired by Redux
   */
  actions: PropTypes.object.isRequired,

  /**
   * Redux state
   */
  state: PropTypes.object.isRequired,
};

Languages.defaultProps = {
  data: {},
};

const mapStateToProps = state => ({
  state: state.language,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Languages);
