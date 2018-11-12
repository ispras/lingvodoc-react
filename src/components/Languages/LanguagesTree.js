import React from 'react';
import PropTypes from 'prop-types';
import SortableTree, { map, getFlatDataFromTree } from 'react-sortable-tree';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { isEqual, findIndex } from 'lodash';
import { Button } from 'semantic-ui-react';
import { languagesQuery } from 'graphql/language';
import { getTranslation } from 'api/i18n';

class LanguagesTree extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      treeData: this.buildTree(props.languagesTree),
      selected: props.selected
    };

    this.langContent = new Map();
    props.dictionaries.forEach( dictionary => {
      const key = dictionary.parent_id.toString();
      const isDictionary = dictionary.category != 1;
      let content = this.langContent[key];
      if (!content) {
        content = { dictionariesCount: 0, corporaCount: 0 };
        this.langContent[key] = content;
      }
      if (isDictionary) {
        content.dictionariesCount++;
      }
      else {
        content.corporaCount++;
      }
    });

    this.generateNodeProps = this.generateNodeProps.bind(this);
    this.onMoveNode = this.onMoveNode.bind(this);
    this.onLanguageSelected = this.onLanguageSelected.bind(this);
    this.onDeleteLanguage = this.onDeleteLanguage.bind(this);
  }

  buildTree(languagesTree) {
    const { expanded } = this.props;

    return map({
      treeData: languagesTree.toJS(),
      callback: ({ node }) => ({ ...node, expanded: expanded == undefined ? true : expanded }),
      getNodeKey: ({ treeIndex }) => treeIndex,
      ignoreCollapsed: false,
    });
  }

  componentWillReceiveProps(props) {
    const { languagesTree: newTree } = props;
    const { languagesTree: oldTree } = this.props;
    if (!oldTree.equals(newTree)) {
      this.setState({ treeData: this.buildTree(newTree) });
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
      user, edit, editLanguage, createLanguage, onSelect
    } = this.props;
    const selectActions = onSelect ? [<Button color="blue" content={getTranslation("Select")} onClick={() => this.onLanguageSelected(node)} />] : [];
    if (edit) {
      const content = this.langContent[node.id.toString()];
      let nodeProps = {
        buttons: [
          ...selectActions,
          <Button color="orange" content={getTranslation("Edit")} onClick={() => editLanguage(node)} />,
          <Button color="green" content={getTranslation("Create")} onClick={() => createLanguage(node)} />,
        ],
      };
      const { selected } = this.state;
      if (!onSelect && user.id == 1) {
        const dictionariesCount = content ? content.dictionariesCount : 0;
        const corporaCount = content ? content.corporaCount : 0;
        nodeProps.title = (
          <div title={getTranslation('Dictionaries') + ': ' + dictionariesCount + ', ' + getTranslation('Corpora') + ': ' + corporaCount}>
            {node.translation}
          </div>
        );
        if (!content) {
          nodeProps.buttons.push(<Button color="red" content={getTranslation("Delete")} onClick={() => this.onDeleteLanguage(node)} />);
        }
      }
      else {
        nodeProps.title = node.translation;
      }
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

  onDeleteLanguage(node) {
    this.props.deleteLanguage({
      variables: { id: node.id },
      refetchQueries: [{ query: languagesQuery }]
    });
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
  dictionaries: PropTypes.array.isRequired,
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  edit: PropTypes.bool,
  editLanguage: PropTypes.func.isRequired,
  createLanguage: PropTypes.func.isRequired,
  moveLanguage: PropTypes.func.isRequired,
  deleteLanguage: PropTypes.func,
  selected: PropTypes.object,
  onSelect: PropTypes.func,
  expanded: PropTypes.bool
};

LanguagesTree.defaultProps = {
  edit: false,
};

export default connect(state => state.user)(LanguagesTree);
