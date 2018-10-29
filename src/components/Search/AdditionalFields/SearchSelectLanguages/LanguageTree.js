import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { Segment, Button } from 'semantic-ui-react';
import TreeNode from './TreeNode';

import './styles.scss';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-language-tree',
  wrap: 'search-language-tree__wrap',
  items: 'search-language-tree__items',
};

const propsNames = {
  languages: 'children',
  dictionaries: 'dictionaries',
};

/* ----------- COMPONENT ----------- */
/**
 * Represents tree of languages and dictionaries with selecting functionality.
 */
class SearchLanguageTree extends PureComponent {
  static propTypes = {
    nodes: PropTypes.array.isRequired,
    checked: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    checkAllButtonText: PropTypes.string,
    uncheckAllButtonText: PropTypes.string,
  }

  static defaultProps = {
    checkAllButtonText: 'Check all',
    uncheckAllButtonText: 'Uncheck all',
  }

  /**
   * Checks if a node has languages children.
   * @param {Object} node - node of the tree
   * @returns {boolean} - result of the checking
   */
  static nodeHasLanguagesChildren(node) {
    return Array.isArray(node[propsNames.languages]) && node[propsNames.languages].length > 0;
  }

  /**
   * Checks if a node has dictionaries children.
   * @param {Object} node - tree node
   * @returns {boolean} - result of checking
   */
  static nodeHasDictionariesChildren(node) {
    return Array.isArray(node[propsNames.dictionaries]) && node[propsNames.dictionaries].length > 0;
  }

  /**
   * Gets the value of a tree node as a string obtained from the node id.
   * @param {Object} node - tree node
   * @returns {string} - tree node value
   */
  static getNodeValue(node) {
    return `${node.id[0].toString()},${node.id[1].toString()}`;
  }

  /**
   * Checks if all nodes of the tree were checked.
   * @param {number} numOfNodes - number of tree nodes
   * @param {Array} checkedList - list of checked tree nodes
   */
  static isAllNodesChecked(numOfNodes, checkedList) {
    if (!numOfNodes || !checkedList) {
      return false;
    }

    if (Array.isArray(checkedList) && checkedList[0] === 'all') {
      return true;
    }

    if (numOfNodes === checkedList[0].checked.length + checkedList[1].checked.length) {
      return true;
    }

    return false;
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
    this.checkAll = this.checkAll.bind(this);
    this.uncheckAll = this.uncheckAll.bind(this);
  }

  /**
   * Updates the tree data if the props were changed.
   * @param {Object} - next component properties
   */
  componentWillReceiveProps({ nodes, checked }) {
    if (!isEqual(this.props.nodes, nodes)) {
      this.flattenNodes(nodes);
    }

    this.updateNodesWithChecked(checked);
  }

  /**
   * Handles the checking of a language or dictionary.
   * @param {Object} - info about checked tree node
   */
  onCheck(nodeInfo) {
    this.toggleChecked(nodeInfo.value, nodeInfo.checked);
    this.recountParentsCheck(nodeInfo.value);
    this.sendCheckedListToTop();
  }

  /**
   * Handles the expand or collapse of the tree node.
   * @param {Object} nodeInfo - info about expanded or collapsed node tree
   */
  onExpand(nodeInfo) {
    this.toggleNode(nodeInfo.value, 'expanded', nodeInfo.expanded);
    this.setState({
      expanded: this.getExpandedList(),
    });
  }

  /**
   * Gets state of the tree node for its visual presentation.
   * @param {Object} node - tree node
   * @returns {number} - state of the tree node.
   * 0 - unchecked, 1 - checked, 2 - unchecked, but has at least one checked child.
   */
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

  /**
   * Generates a list of ids of checked tree nodes.
   * @returns {Array} - list pf ids of checked tree nodes
   */
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

    return Object.keys(list).map(item => ({
      type: item,
      checked: list[item],
    }));
  }

  /**
   * Generates a list of ids of visually expanded tree nodes.
   * @returns {Array} - list pf ids of visually expanded tree nodes
   */
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

  /**
   * Gets list of checked tree nodes and sends it to the parent component.
   */
  sendCheckedListToTop() {
    const nextCheckedList = this.getCheckedList();

    // console.log({
    //   languages: nextCheckedList[0].checked
    //     .map(value => `${this.flatNodes[value].self.translation} - ${value}}`),
    //   dictionaries: nextCheckedList[1].checked
    //     .map(value => `${this.flatNodes[value].self.translation} - ${value}}`),
    // });

    if (this.constructor.isAllNodesChecked(Object.keys(this.flatNodes).length, nextCheckedList)) {
      this.props.onChange(['all']);
    } else {
      this.props.onChange(nextCheckedList);
    }
  }
  /**
   * Recounts the checked state of the parent of the tree node.
   * @param  {string} flatNodeValue - tree node value
   */
  recountParentsCheck(flatNodeValue) {
    const flatNode = this.flatNodes[flatNodeValue];
    let everyChildChecked = null;
    let someChildChecked = null;
    let parentValue = null;
    let parentFlatNode = null;
    let parentNode = null;

    if (flatNode.parent.id) {
      parentNode = flatNode.parent;
      everyChildChecked = this.isEveryChildChecked(parentNode);
      parentValue = this.constructor.getNodeValue(parentNode);
      parentFlatNode = this.flatNodes[parentValue];

      if (everyChildChecked) {
        parentFlatNode.checkState = 1;
        parentFlatNode.checked = true;
      } else {
        // doubtful option in which you can remove all children without removing the parent
        // someChildChecked = this.isSomeChildChecked(parentNode);
        // if (someChildChecked) {
        //   if (!parentFlatNode.checked) {
        //     parentFlatNode.checkState = 2;
        //     parentFlatNode.checked = false;
        //   } else {
        //     parentFlatNode.checkState = 1;
        //   }
        // } else if (parentFlatNode.checked) {
        //   parentFlatNode.checkedState = 1;
        // } else {
        //   parentFlatNode.checked = false;
        //   parentFlatNode.checkState = 0;
        // }

        parentFlatNode.checkState = someChildChecked ? 2 : 0;

        someChildChecked = this.isSomeChildChecked(parentNode);
        parentFlatNode.checked = false;

        parentFlatNode.checkState = someChildChecked ? 2 : 0;
      }

      this.recountParentsCheck(parentValue);
    }
  }
  /**
   * Toggles checked state of the tree node and its children.
   * @param  {string} value - tree node value
   * @param  {boolean} isChecked - is tree node checked
   */
  toggleChecked(value, isChecked) {
    const flatNode = this.flatNodes[value];

    if (flatNode.isLeaf) {
      if (flatNode.self.disabled) {
        return;
      }

      this.toggleNode(value, 'checked', isChecked);
      flatNode.checkState = this.getShallowCheckState(flatNode.self);
    } else {
      flatNode.self[propsNames.languages].forEach((language) => {
        this.toggleChecked(this.constructor.getNodeValue(language), isChecked);
      });

      flatNode.self[propsNames.dictionaries].forEach((dictionary) => {
        this.toggleChecked(this.constructor.getNodeValue(dictionary), isChecked);
      });

      this.toggleNode(value, 'checked', isChecked);
      flatNode.checkState = this.getShallowCheckState(flatNode.self);
    }
  }

  /**
   * Toggles checked state of all tree nodes.
   * @param {boolean} isChecked - needed checked state
   */
  toggleCheckedAll(isChecked) {
    Object.keys(this.flatNodes).forEach((value) => {
      this.toggleNode(value, 'checked', isChecked);
      this.flatNodes[value].checkState = isChecked ? 1 : 0;
    });
    this.sendCheckedListToTop();
  }

  /**
   * Toggles checked state of all tree nodes to true.
   */
  checkAll() {
    this.toggleCheckedAll(true);
  }

  /**
   * Toggles checked state of all tree nodes to false.
   */
  uncheckAll() {
    this.toggleCheckedAll(false);
  }

  /**
   * Toggles tree node property "key" with the value "toggleValue".
   * @param {string} nodeValue
   * @param {string} key
   * @param {boolean} toggleValue
   */
  toggleNode(nodeValue, key, toggleValue) {
    this.flatNodes[nodeValue][key] = toggleValue;
  }

  /**
   * Checks if all node childs is in the checked state.
   * @param {Object} node - tree node
   * @returns {boolean} - result of the checking
   */
  isEveryChildChecked(node) {
    const everyLanguagesChecked = node[propsNames.languages]
      .every(language => this.flatNodes[this.constructor.getNodeValue(language)].checkState === 1);

    return !this.constructor.nodeHasDictionariesChildren(node) ? everyLanguagesChecked :
      everyLanguagesChecked && node[propsNames.dictionaries]
        .every(dictionary => this.flatNodes[this.constructor.getNodeValue(dictionary)].checkState === 1);
  }

  /**
   * Checks if at least one of the children (at every level below) is in the checked state.
   * @param {Object} node - tree node
   * @returns {boolean} - result of the checking
   */
  isSomeChildChecked(node) {
    const someLanguagesChecked = node[propsNames.languages]
      .some(language => this.flatNodes[this.constructor.getNodeValue(language)].checkState > 0);

    return !this.constructor.nodeHasDictionariesChildren(node) ? someLanguagesChecked :
      someLanguagesChecked || node[propsNames.dictionaries]
        .some(dictionary => this.flatNodes[this.constructor.getNodeValue(dictionary)].checkState > 0);
  }

  /**
   * Adds checked state to the tree nodes depending on list of checked tree nodes.
   * @param {Array} checkedLists - list of checked tree nodes
   */
  updateNodesWithChecked(checkedLists) {
    const isAllChecked = checkedLists[0] === 'all' && checkedLists.length === 1;

    if (isAllChecked) {
      // Set all values to true
      Object.keys(this.flatNodes).forEach((value) => {
        this.flatNodes[value].checked = true;
      });
    } else {
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
  }

  /**
   * Adds expanded state to the tree nodes depending on list of expanded tree nodes.
   * @param {Array} checkedLists - list of expanded tree nodes
   */
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

  /**
   * Creates a flat object from the nested node tree where key is a tree node value
   * and value is a tree node object with the additional properties.
   * @param {Array} nodes - list of the tree nodes
   * @param {Object} parent - tree node-parent
   * @param {string} type - type of the tree node: language or dictionary, language by default
   */
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

  /**
   * Renders tree nodes.
   * @param {Array} nodes - list of the tree nodes
   * @param {Object} parent - tree node-parent
   * @return {TreeNode} - object represents all tree nodes for rendering
   */
  renderTreeNodes(nodes, parent = {}) {
    const treeNodes = nodes.map((node) => {
      const key = this.constructor.getNodeValue(node);
      const flatNode = this.flatNodes[key];
      const childrenLanguages = flatNode.isParentWithLanguages ?
        this.renderTreeNodes(node[propsNames.languages], node) :
        null;
      const childrenDictionaries = flatNode.isParentWithDictionaries ?
        this.renderTreeNodes(node[propsNames.dictionaries], node) :
        null;

      // Get the checked state after all children checked states are determined
      flatNode.checkState = flatNode.checkState === 0 || flatNode.checkState === 1 || flatNode.checkState === 2 ?
        flatNode.checkState : 1;

      const parentExpanded = parent.value ? this.flatNodes[this.constructor.getNodeValue(parent)].expanded : true;

      if (!parentExpanded) {
        return null;
      }

      return (
        <TreeNode
          key={key}
          checked={flatNode.checkState}
          expanded={flatNode.expanded}
          label={node.translation}
          isLeaf={flatNode.isLeaf}
          isParent={flatNode.isParent}
          type={flatNode.type}
          value={flatNode.value}
          onCheck={this.onCheck}
          onExpand={this.onExpand}
        >
          {childrenLanguages}
          {childrenDictionaries}
        </TreeNode>
      );
    });

    return treeNodes;
  }

  render() {
    const { nodes } = this.props;
    const treeNodes = this.renderTreeNodes(nodes);

    return (
      <div className={classNames.container}>
        <div className={classNames.wrap}>
          <div className={classNames.items}>
            {treeNodes}
          </div>
        </div>
        <Segment>
          <Button primary basic onClick={this.uncheckAll}>
            {this.props.uncheckAllButtonText}
          </Button>
          <Button primary basic onClick={this.checkAll}>
            {this.props.checkAllButtonText}
          </Button>
        </Segment>
      </div>
    );
  }
}

export default SearchLanguageTree;
