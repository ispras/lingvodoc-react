import React from 'react';
import PropTypes from 'prop-types';
import SortableTree, { map, getFlatDataFromTree } from 'react-sortable-tree';
import Immutable from 'immutable';
import { isEqual, findIndex } from 'lodash';
import { Button } from 'semantic-ui-react';
import { languagesQuery } from 'graphql/language';

class LanguagesTree extends React.Component {
  static buildTree(languagesTree) {
    return map({
      treeData: languagesTree.toJS(),
      callback: ({ node }) => ({ ...node, expanded: true }),
      getNodeKey: ({ treeIndex }) => treeIndex,
      ignoreCollapsed: false,
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      treeData: LanguagesTree.buildTree(props.languagesTree),
      selected: props.selected
    };

    this.generateNodeProps = this.generateNodeProps.bind(this);
    this.onMoveNode = this.onMoveNode.bind(this);
    this.onLanguageSelected = this.onLanguageSelected.bind(this);
  }

  componentWillReceiveProps(props) {
    const { languagesTree: newTree } = props;
    const { languagesTree: oldTree } = this.props;
    if (!oldTree.equals(newTree)) {
      this.setState({ treeData: LanguagesTree.buildTree(newTree) });
    }
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

  generateNodeProps({ node }) {
    const {
      edit, editLanguage, createLanguage, onSelect,
    } = this.props;
    const selectActions = onSelect ? [<Button basic content="Select" onClick={() => this.onLanguageSelected(node)} />] : [];
    if (edit) {
      let nodeProps = {
        title: node.translation,
        buttons: [
          ...selectActions,
          <Button basic content="Edit" onClick={() => editLanguage(node)} />,
          <Button basic content="Create" onClick={() => createLanguage(node)} />,
        ],
      };
      const { selected } = this.state;
      if (selected && node.id.toString() == selected.id.toString()) {
        nodeProps.style = {
          boxShadow: `0 0 0 4px blue`
        }
      }
      return nodeProps;
    }

    return {
      title: node.translation,
    };
  }

  onLanguageSelected(node) {
    if (node == this.state.selected) {
      return;
    }
    
    this.setState({ selected: node });
    this.props.onSelect(node);
  }

  render() {
    const { edit } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <SortableTree
          treeData={this.state.treeData}
          onChange={treeData => this.setState({ treeData })}
          generateNodeProps={this.generateNodeProps}
          onMoveNode={this.onMoveNode}
          canDrag={edit}
        />
      </div>
    );
  }
}

LanguagesTree.propTypes = {
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  edit: PropTypes.bool,
  editLanguage: PropTypes.func.isRequired,
  createLanguage: PropTypes.func.isRequired,
  moveLanguage: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
};

LanguagesTree.defaultProps = {
  edit: false,
};

export default LanguagesTree;
