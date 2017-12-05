import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { pure, compose } from 'recompose';
import { Container } from 'semantic-ui-react';
import EditModal from 'components/EditLanguageModal';
import { languagesQuery } from 'graphql/language';
import { compositeIdToString } from 'utils/compositeId';
import { openModalCreate, openModalEdit } from 'ducks/language';
import Language from './language';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import SortableTree, { map } from 'react-sortable-tree';
import Immutable from 'immutable';
import { Button } from 'semantic-ui-react';

import languageListToTree from './utils';

class LanguagesTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: map({
        treeData: props.languagesTree.toJS(),
        callback: ({ node }) => ({ ...node, expanded: false }),
        getNodeKey: ({ treeIndex }) => treeIndex,
        ignoreCollapsed: false,
      }),
    };

    this.generateNodeProps = this.generateNodeProps.bind(this);
  }

  generateNodeProps({ node, path }) {
    const { editLanguage, createLanguage } = this.props;
    return {
      title: node.translation,
      buttons: [
        <Button basic content="Edit" onClick={() => editLanguage(node)} />,
        <Button basic content="Create" onClick={() => createLanguage(node)} />,
      ],
    };
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        <SortableTree
          treeData={this.state.treeData}
          onChange={treeData => this.setState({ treeData })}
          generateNodeProps={this.generateNodeProps}
        />
        <EditModal />
      </div>
    );
  }
}

const Languages = (props) => {
  const { data, actions } = props;
  const { error, loading } = data;
  if (error) {
    return null;
  }

  if (loading) {
    return null;
  }

  const { language_tree: languages } = data;
  const languagesTree = buildLanguageTree(Immutable.fromJS(languages));

  return (
    <LanguagesTree
      languagesTree={languagesTree}
      createLanguage={actions.openModalCreate}
      editLanguage={actions.openModalEdit}
    />
  );
};

Languages.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    language_tree: PropTypes.array,
  }).isRequired,
  actions: PropTypes.shape({
    openModalCreate: PropTypes.func,
    openModalEdit: PropTypes.func,
  }).isRequired,
};

export default compose(
  graphql(languagesQuery),
  connect(
    state => state.language,
    dispatch => ({
      actions: bindActionCreators({ openModalCreate, openModalEdit }, dispatch),
    })
  ),
  pure
)(Languages);
