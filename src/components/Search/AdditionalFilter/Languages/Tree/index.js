import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Button, Segment } from "semantic-ui-react";
import isEqual from "lodash/isEqual";
import PropTypes from "prop-types";
import { compose } from "recompose";

import { flattenNodes, getNodeValue, nodeHasDictionariesChildren, propsNames } from "../helpers";
import TreeNode from "../TreeNode";

import "./index.scss";

/* ----------- PROPS ----------- */
const classNames = {
  container: "search-language-tree",
  wrap: "search-language-tree__wrap",
  items: "search-language-tree__items",
  buttons: "search-language-tree__buttons",
  group: "search-language-tree__group",
  groupHidden: "search-language-tree__group_hidden"
};

/* ----------- COMPONENT ----------- */
/**
 * Represents tree of languages and dictionaries with selecting functionality.
 */
class Tree extends PureComponent {
  static propTypes = {
    nodes: PropTypes.array.isRequired,
    checked: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    checkAllButtonText: PropTypes.string,
    uncheckAllButtonText: PropTypes.string,
    showTree: PropTypes.bool.isRequired,
    filterMode: PropTypes.bool.isRequired
  };

  static defaultProps = {
    checkAllButtonText: "Check all",
    uncheckAllButtonText: "Uncheck all"
  };

  /**
   * Checks if all nodes of the tree were checked.
   * @param {number} numOfNodes - number of tree nodes
   * @param {Array} checkedList - list of checked tree nodes
   */
  static isAllNodesChecked(numOfNodes, checkedList) {
    if (!numOfNodes || !checkedList) {
      return false;
    }

    if (numOfNodes === checkedList[0].checked.length + checkedList[1].checked.length) {
      return true;
    }

    return false;
  }

  /**
   * Checks if flat node has defined checkState
   * @param {Object} flatNode - flat node
   */
  static isCheckStateSet(flatNode) {
    const { checkState } = flatNode;
    if (checkState === null || checkState === undefined) {
      return false;
    }

    return checkState === 0 || checkState === 1 || checkState === 2;
  }

  constructor(props) {
    super(props);
    const { checkStateTreeFlat } = props;
    this.flatNodes = {};

    if (checkStateTreeFlat.selectedLanguagesChecken) {
      this.flatNodes = checkStateTreeFlat.selectedLanguagesChecken;
    } else {
      flattenNodes(props.nodes, this.flatNodes);
    }

    this.updateNodesWithChecked(props.checked, props.filterMode);

    this.state = {
      expanded:
        Object.values(this.flatNodes)
          .filter(item => item.expanded)
          .map(item => item.value) || []
    };

    this.updateNodesWithExpanded(this.state.expanded);

    if (props.filterMode) {
      this.recountTree();
    }

    this.onCheck = this.onCheck.bind(this);
    this.onExpand = this.onExpand.bind(this);
    this.checkAll = this.checkAll.bind(this);
    this.uncheckAll = this.uncheckAll.bind(this);
  }

  /**
   * Updates the tree data if the props were changed.
   * @param {Object} - next component properties
   */

  componentWillReceiveProps({ nodes: netxtNodes, checked: nextChecked, filterMode: nextFilterMode }) {
    const { nodes: currentNodes, checked: currentChecked, filterMode: currentFilterMode } = this.props;
    if (!isEqual(currentNodes, netxtNodes)) {
      flattenNodes(netxtNodes, this.getFlatNodes());
    }

    const needToRecount =
      (nextFilterMode && !currentFilterMode) ||
      (currentFilterMode && !nextFilterMode) ||
      (currentFilterMode && nextFilterMode);

    if (!isEqual(currentChecked, nextChecked)) {
      this.updateNodesWithChecked(nextChecked, needToRecount);
      if (needToRecount) {
        this.recountTree();
      }
    }
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
    this.toggleNode(nodeInfo.value, "expanded", nodeInfo.expanded);
    this.setState({
      expanded: this.getExpandedList()
    });
  }

  /**
   * Gets all nodes from wich recounting will go to the top
   * @param {Object} node - root node
   * @param {Array} container - array with all nodes from which recounting will go to the top
   */
  getAllNodesToRecount(node, container = []) {
    if (node.children.length === 0) {
      if (node.dictionaries.length > 0) {
        container.push(node.dictionaries[0]);
      } else {
        container.push(node);
      }
    } else {
      node.children.forEach(child => {
        this.getAllNodesToRecount(child, container);
      });
    }
    return container;
  }

  /**
   * Gets state of the tree node for its visual presentation.
   * @param {Object} node - tree node
   * @returns {number} - state of the tree node.
   * 0 - unchecked, 1 - checked, 2 - unchecked, but has at least one checked child.
   */
  getShallowCheckState(node) {
    const flatNode = this.getFlatNodeByNode(node);

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
      dictionary: []
    };
    const flatNodes = this.getFlatNodes();

    Object.keys(flatNodes).forEach(value => {
      const flatNode = this.getFlatNodeByValue(value);
      if (flatNode.checked) {
        list[flatNode.type].push(value);
      }
    });

    return Object.keys(list).map(item => ({
      type: item,
      checked: list[item]
    }));
  }

  /**
   * Generates a list of ids of visually expanded tree nodes.
   * @returns {Array} - list pf ids of visually expanded tree nodes
   */
  getExpandedList() {
    const list = [];
    const flatNodes = this.getFlatNodes();

    Object.keys(flatNodes).forEach(value => {
      const flatNode = this.getFlatNodeByValue(value);
      if (flatNode.expanded) {
        list.push(value);
      }
    });

    return list;
  }

  getFlatNodes() {
    return this.flatNodes;
  }

  getFlatNodeByValue(value) {
    const flatNodes = this.getFlatNodes();
    return flatNodes[value];
  }

  getFlatNodeByNode(node) {
    const value = getNodeValue(node);

    return this.getFlatNodeByValue(value);
  }

  /**
   * Full recounting of the tree
   */
  recountTree() {
    const flatNodes = this.getFlatNodes();
    const rootNodeValues = Object.keys(flatNodes).filter(value => {
      return !this.getFlatNodeByValue(value).parent.id;
    });

    rootNodeValues.forEach(value => {
      const flatNode = this.getFlatNodeByValue(value).self;
      const allNodesToRecount = this.getAllNodesToRecount(flatNode);

      allNodesToRecount.forEach(item => this.recountParentsCheck(getNodeValue(item)));
    });
  }

  /**
   * Gets list of checked tree nodes and sends it to the parent component.
   */
  sendCheckedListToTop() {
    const nextCheckedList = this.getCheckedList();
    this.props.onChange(nextCheckedList);
  }

  /**
   * Recounts the checked state of the parent of the tree node.
   * @param  {string} flatNodeValue - tree node value
   */
  recountParentsCheck(flatNodeValue) {
    const flatNode = this.getFlatNodeByValue(flatNodeValue);
    let everyChildChecked = null;
    let someChildChecked = null;
    let parentValue = null;
    let parentFlatNode = null;
    let parentNode = null;

    if (flatNode.parent.id) {
      parentNode = flatNode.parent;
      everyChildChecked = this.isEveryChildChecked(parentNode);
      parentValue = getNodeValue(parentNode);
      parentFlatNode = this.getFlatNodeByValue(parentValue);

      if (everyChildChecked) {
        parentFlatNode.checkState = 1;
        parentFlatNode.checked = true;
      } else {
        someChildChecked = this.isSomeChildChecked(parentNode);
        parentFlatNode.checkState = someChildChecked ? 2 : 0;
        parentFlatNode.checked = false;
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
    const flatNode = this.getFlatNodeByValue(value);

    if (flatNode.isLeaf) {
      if (flatNode.self.disabled) {
        return;
      }

      this.toggleNode(value, "checked", isChecked);
      flatNode.checkState = this.getShallowCheckState(flatNode.self);
    } else {
      flatNode.self[propsNames.languages].forEach(language => {
        this.toggleChecked(getNodeValue(language), isChecked);
      });

      flatNode.self[propsNames.dictionaries].forEach(dictionary => {
        this.toggleChecked(getNodeValue(dictionary), isChecked);
      });

      this.toggleNode(value, "checked", isChecked);
      flatNode.checkState = this.getShallowCheckState(flatNode.self);
    }
  }

  /**
   * Toggles checked state of all tree nodes.
   * @param {boolean} isChecked - needed checked state
   */
  toggleCheckedAll(isChecked) {
    const flatNodes = this.getFlatNodes();

    Object.keys(flatNodes).forEach(value => {
      const flatNode = this.getFlatNodeByValue(value);
      this.toggleNode(value, "checked", isChecked);
      flatNode.checkState = isChecked ? 1 : 0;
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
    const flatNode = this.getFlatNodeByValue(nodeValue);
    flatNode[key] = toggleValue;
  }

  /**
   * Checks if all node childs is in the checked state.
   * @param {Object} node - tree node
   * @returns {boolean} - result of the checking
   */
  isEveryChildChecked(node) {
    const everyLanguagesChecked = node[propsNames.languages].every(
      language => this.getFlatNodeByNode(language).checkState === 1
    );

    return !nodeHasDictionariesChildren(node)
      ? everyLanguagesChecked
      : everyLanguagesChecked &&
          node[propsNames.dictionaries].every(dictionary => this.getFlatNodeByNode(dictionary).checkState === 1);
  }

  /**
   * Checks if at least one of the children (at every level below) is in the checked state.
   * @param {Object} node - tree node
   * @returns {boolean} - result of the checking
   */
  isSomeChildChecked(node) {
    const someLanguagesChecked = node[propsNames.languages].some(
      language => this.getFlatNodeByNode(language).checkState > 0
    );

    return !nodeHasDictionariesChildren(node)
      ? someLanguagesChecked
      : someLanguagesChecked ||
          node[propsNames.dictionaries].some(dictionary => this.getFlatNodeByNode(dictionary).checkState > 0);
  }

  /**
   * Checks if node is checked.
   * @param {object} node - node
   */
  isNodeChecked(node) {
    const { checked: checkedList } = this.props;

    const languageInChecked = checkedList[0].checked.find(value => {
      return getNodeValue(node) === value;
    });

    if (languageInChecked !== undefined) {
      return true;
    }

    const dictionaryInChecked = checkedList[1].checked.find(value => {
      return getNodeValue(node) === value;
    });

    if (dictionaryInChecked !== undefined) {
      return true;
    }

    return false;
  }

  /**
   * Adds checked state to the tree nodes depending on list of checked tree nodes.
   * @param {Array} checkedLists - list of checked tree nodes
   */
  updateNodesWithChecked(checkedLists, filterMode) {
    const flatNodes = this.getFlatNodes();
    const isAllChecked = this.constructor.isAllNodesChecked(Object.keys(flatNodes).length, checkedLists);

    if (isAllChecked) {
      // Set all values to true
      Object.keys(flatNodes).forEach(value => {
        const flatNode = this.getFlatNodeByValue(value);
        flatNode.checked = true;
        if (filterMode) {
          flatNode.checkState = 1;
        }
      });
    } else {
      // Reset values to false
      Object.keys(flatNodes).forEach(value => {
        const flatNode = this.getFlatNodeByValue(value);
        flatNode.checked = false;
        if (filterMode) {
          flatNode.checkState = 0;
        }
      });

      checkedLists.forEach(item => {
        item.checked.forEach(value => {
          const flatNode = this.getFlatNodeByValue(value);

          if (flatNode !== undefined && flatNode.type === item.type) {
            flatNode.checked = true;
            if (filterMode) {
              flatNode.checkState = 1;
            }
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
    const flatNodes = this.getFlatNodes();

    Object.keys(flatNodes).forEach(value => {
      const flatNode = this.getFlatNodeByValue(value);
      flatNode.expanded = false;
    });

    expandedList.forEach(value => {
      const flatNode = this.getFlatNodeByValue(value);
      if (flatNode !== undefined) {
        flatNode.expanded = true;
      }
    });
  }

  /**
   * Renders tree nodes.
   * @param {Array} nodes - list of the tree nodes
   * @param {Object} parent - tree node-parent
   * @return {TreeNode} - object represents all tree nodes for rendering
   */
  renderTreeNodes(nodes, parent = {}) {
    const { checkStateTreeFlat } = this.props;

    let flatNode = null;
    const treeNodes = nodes.map(node => {
      const nodeValue = getNodeValue(node);

      if (!checkStateTreeFlat.selectedLanguagesChecken || (event && event.type === "click")) {
        flatNode = this.getFlatNodeByValue(nodeValue);
      } else {
        flatNode = checkStateTreeFlat.selectedLanguagesChecken[nodeValue] || this.getFlatNodeByValue(nodeValue);
      }

      const childrenLanguages = flatNode.isParentWithLanguages
        ? this.renderTreeNodes(node[propsNames.languages], node)
        : null;
      const childrenDictionaries = flatNode.isParentWithDictionaries
        ? this.renderTreeNodes(node[propsNames.dictionaries], node)
        : null;

      // Get the checked state after all children checked states are determined
      if (!this.constructor.isCheckStateSet(flatNode)) {
        flatNode.checkState = this.isNodeChecked(node) ? 1 : 0;
      }

      let parentExpanded = true;

      if (parent.value) {
        const parentFlatNode = this.getFlatNodeByNode(parent);
        parentExpanded = parentFlatNode.expanded;
      }

      if (!parentExpanded) {
        return null;
      }

      return (
        <TreeNode
          key={nodeValue}
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
    const { nodes, showTree, selectedLanguages } = this.props;
    const groupClassName = showTree ? `${classNames.group}` : `${classNames.group} ${classNames.groupHidden}`;

    if (selectedLanguages) {
      selectedLanguages(this.flatNodes);
    }

    return (
      <Segment.Group className={groupClassName}>
        {showTree ? (
          <Segment>
            <div className={classNames.container}>
              <div className={classNames.wrap}>
                <div className={classNames.items}>{this.renderTreeNodes(nodes)}</div>
              </div>
              <div className={classNames.buttons}>
                <Button primary basic onClick={this.uncheckAll}>
                  {this.props.uncheckAllButtonText}
                </Button>
                <Button primary basic onClick={this.checkAll}>
                  {this.props.checkAllButtonText}
                </Button>
              </div>
            </div>
          </Segment>
        ) : null}
      </Segment.Group>
    );
  }
}
Tree.propTypes = {
  selectedLanguages: PropTypes.func
};
Tree.defaultProps = {
  selectedLanguages: null
};
export default compose(connect(state => state.distanceMap))(Tree);
