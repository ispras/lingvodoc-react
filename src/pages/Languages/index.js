import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { pure, compose } from 'recompose';
import SortableTree, { map, getFlatDataFromTree } from 'react-sortable-tree';
import Immutable from 'immutable';
import { isEqual, findIndex } from 'lodash';
import { Button } from 'semantic-ui-react';
import EditModal from 'components/EditLanguageModal';
import { openModalEdit } from 'ducks/language';
import { languagesQuery, createLanguageMutation, moveLanguageMutation } from 'graphql/language';
import { buildLanguageTree } from 'pages/Search/treeBuilder';

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
    this.createChildLanguage = this.createChildLanguage.bind(this);
    this.onMoveNode = this.onMoveNode.bind(this);
  }

  onMoveNode({ treeData, node }) {
    const { moveLanguage } = this.props;
    // create flat representation of the language tree to make traversals easier
    const langs = getFlatDataFromTree({
      treeData,
      getNodeKey: ({ node: n }) => n.id,
      callback: ({ node: n }) => ({ ...n, expanded: false }),
      ignoreCollapsed: false,
    }).map(({ node: n, path, treeIndex }) => ({
      id: n.id,
      translation: n.translation,
      parent: path.length > 1 ? path[path.length - 2] : null,
      treeIndex,
    }));

    // calculate new parent id
    const updNode = langs.find(n => isEqual(n.id, node.id));
    const newParentId = updNode.parent;
    // calculate previous sibling id
    const newSiblings = langs.filter(lang => isEqual(lang.parent, newParentId));
    const nodePosition = findIndex(newSiblings, n => isEqual(n.id, updNode.id));
    const prevLanguageId = nodePosition === 0 ? null : newSiblings[nodePosition - 1].id;

    moveLanguage({
      variables: { id: updNode.id, parent_id: newParentId, previous_sibling_id: prevLanguageId },
      refetchQueries: [{ query: languagesQuery }],
    });
  }

  generateNodeProps({ node, path }) {
    const { editLanguage } = this.props;
    return {
      title: node.translation,
      buttons: [
        <Button basic content="Edit" onClick={() => editLanguage(node)} />,
        <Button basic content="Create" onClick={() => this.createChildLanguage(node)} />,
      ],
    };
  }

  createChildLanguage(parent) {
    const { createLanguage } = this.props;
    createLanguage({
      variables: { parent_id: parent.id, translation_atoms: [] },
      refetchQueries: [{ query: languagesQuery }],
    });
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        <SortableTree
          treeData={this.state.treeData}
          onChange={treeData => this.setState({ treeData })}
          generateNodeProps={this.generateNodeProps}
          onMoveNode={this.onMoveNode}
        />
        <EditModal />
      </div>
    );
  }
}

const Languages = (props) => {
  const {
    data, createLanguage, moveLanguage, actions,
  } = props;
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
      createLanguage={createLanguage}
      editLanguage={actions.openModalEdit}
      moveLanguage={moveLanguage}
    />
  );
};

Languages.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    language_tree: PropTypes.array,
  }).isRequired,
  actions: PropTypes.shape({
    openModalEdit: PropTypes.func,
  }).isRequired,
  createLanguage: PropTypes.func.isRequired,
  moveLanguage: PropTypes.func.isRequired,
};

export default compose(
  graphql(languagesQuery),
  graphql(createLanguageMutation, { name: 'createLanguage' }),
  graphql(moveLanguageMutation, { name: 'moveLanguage' }),
  connect(
    state => state.language,
    dispatch => ({
      actions: bindActionCreators({ openModalEdit }, dispatch),
    })
  ),
  pure
)(Languages);
