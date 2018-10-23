import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import TreeNode from './TreeNode';

import './styles.scss';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-language-tree',
};

const propsNames = {
  languages: 'children',
  dictionaries: 'dictionaries',
};


/* ----------- HELPERS ----------- */
const isGroupsInGroup = (group) => {
  if (!group) {
    return false;
  }

  for (let i = 0; i < group.length; i++) {
    if (group[i].children.length > 0) {
      return true;
    }
  }

  return false;
};

/* ----------- COMPONENT ----------- */
class SearchLanguageTree extends PureComponent {
  static propTypes = {
    nodes: PropTypes.array.isRequired,
    checked: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  static nodeHasLanguagesChildren(node) {
    return Array.isArray(node[propsNames.languages]) && node[propsNames.languages].length > 0;
  }

  static nodeHasDictionariesChildren(node) {
    return Array.isArray(node[propsNames.dictionaries]) && node[propsNames.dictionaries].length > 0;
  }

  static getNodeValue(node) {
    return `${node.id[0].toString()},${node.id[1].toString()}`;
  }

  constructor(props) {
    super(props);

    this.flatNodes = {};
    this.flattenNodes(props.nodes);
    this.updateNodesWithChecked(props.checked);

    this.state = {
      expanded: [],
    };

    this.updateNodesWithExpanded(this.state.expanded);

    this.onCheck = this.onCheck.bind(this);
    this.onExpand = this.onExpand.bind(this);
  }

  onCheck() {
    this.props.onChange(this.getCheckedList());
  }

  onExpand(nodeInfo) {
    this.toggleNode(nodeInfo.value, 'expanded', nodeInfo.expanded);
    this.setState({
      expanded: this.getExpandedList(),
    });
  }

  getShallowCheckState(node) {
    const flatNode = this.flatNodes[this.constructor.getNodeValue(node)];

    if (flatNode.isLeaf) {
      return flatNode.checked ? 1 : 0;
    }

    if (this.isEveryChildChecked(node)) {
      return 1;
    }

    if (this.isSomeChildChecked(node)) {
      return 2;
    }

    return 0;
  }

  getCheckedList() {
    const list = {
      language: [],
      dictionary: [],
    };

    Object.keys(this.flatNodes).forEach((value) => {
      const node = this.flatNodes[value];
      if (node.checked) {
        list[node.type].push(value);
      }
    });

    return list;
  }

  getExpandedList() {
    const list = [];

    Object.keys(this.flatNodes).forEach((value) => {
      const node = this.flatNodes[value];
      if (node.expanded) {
        list.push(value);
      }
    });

    return list;
  }

  toggleNode(nodeValue, key, toggleValue) {
    this.flatNodes[nodeValue][key] = toggleValue;
  }

  isEveryChildChecked(node) {
    const everyLanguagesChecked = node[propsNames.languages]
      .every(language => this.flatNodes[this.constructor.getNodeValue(language)].checkState === 1);

    return !this.constructor.nodeHasDictionariesChildren(node) ? everyLanguagesChecked :
      everyLanguagesChecked && node[propsNames.dictionaries]
        .every(dictionary => this.flatNodes[this.constructor.getNodeValue(dictionary)].checkState === 1);
  }

  isSomeChildChecked(node) {
    const someLanguagesChecked = node[propsNames.languages].some(language => this.flatNodes[this.constructor.getNodeValue(language)].checkState > 1);

    return !this.constructor.nodeHasDictionariesChildren(node) ? someLanguagesChecked :
      someLanguagesChecked || node[propsNames.dictionaries].some(dictionary => this.flatNodes[this.constructor.getNodeValue(dictionary)].checkState > 1);
  }

  updateNodesWithChecked(checkedLists) {
    const isAllChecked = checkedLists[0] === 'all' && checkedLists.length === 1;

    if (isAllChecked) {
      // Set values to true
      Object.keys(this.flatNodes).forEach((value) => {
        this.flatNodes[value].checked = true;
      });

      return;
    }

    // Reset values to false
    Object.keys(this.flatNodes).forEach((value) => {
      this.flatNodes[value].checked = false;
    });

    checkedLists.forEach((item) => {
      item.checked.forEach((value) => {
        const node = this.flatNodes[value];
        if (node !== undefined && node.type === item.type) {
          this.flatNodes[value].checked = true;
        }
      });
    });
  }

  updateNodesWithExpanded(expandedList) {
    Object.keys(this.flatNodes).forEach((value) => {
      this.flatNodes[value].expanded = false;
    });

    expandedList.forEach((value) => {
      const node = this.flatNodes[value];
      if (node !== undefined) {
        this.flatNodes[value].expanded = true;
      }
    });
  }

  flattenNodes(nodes, parent = {}, type = 'language') {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return;
    }

    nodes.forEach((node) => {
      const isParentWithLanguages = this.constructor.nodeHasLanguagesChildren(node);
      const isParentWithDictionaries = this.constructor.nodeHasDictionariesChildren(node);
      const nodeValue = this.constructor.getNodeValue(node);

      this.flatNodes[nodeValue] = {
        value: nodeValue,
        self: node,
        parent,
        isParentWithLanguages,
        isParentWithDictionaries,
        isParent: isParentWithDictionaries || isParentWithLanguages,
        isLeaf: !isParentWithLanguages && !isParentWithDictionaries,
        type,
        expanded: false,
      };
      this.flattenNodes(node.children, node, 'language');
      this.flattenNodes(node.dictionaries, node, 'dictionary');
    });
  }

  renderTreeNodes(nodes, parent = {}) {
    const treeNodes = nodes.map((node) => {
      const key = this.constructor.getNodeValue(node);
      const flatNode = this.flatNodes[key];
      const childrenLanguages = flatNode.isParentWithLanguages ? this.renderTreeNodes(node[propsNames.languages], node) : null;
      const childrenDictionaries = flatNode.isParentWithDictionaries ? this.renderTreeNodes(node[propsNames.dictionaries], node) : null;
      const groupHasGroups = isGroupsInGroup(node[propsNames.languages]);

      // Get the check state after all children check states are determined
      flatNode.checkState = this.getShallowCheckState(node);

      const parentExpanded = parent.value ? this.flatNodes[this.constructor.getNodeValue(parent)].expanded : true;

      if (!parentExpanded) {
        return null;
      }

      return (
        <TreeNode
          key={key}
          checked={flatNode.checked}
          expanded={flatNode.expanded}
          label={node.translation}
          isLeaf={flatNode.isLeaf}
          isParent={flatNode.isParent}
          type={flatNode.type}
          value={flatNode.value}
          groupHasGroups={groupHasGroups}
          onCheck={this.onCheck}
          onExpand={this.onExpand}
        >
          {childrenLanguages}
          {childrenDictionaries}
        </TreeNode>
      );
    });

    return (
      <div className="tree-nodes">
        {treeNodes}
      </div>
    );
  }

  render() {
    const { nodes } = this.props;
    const treeNodes = this.renderTreeNodes(nodes);

    return (
      <div className={classNames.container}>
        {treeNodes}
      </div>
    );
  }
}

export default SearchLanguageTree;
