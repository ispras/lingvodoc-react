import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import LanguageItem from './LanguageItem';

import './styles.scss';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-language-tree',
};

/* ----------- COMPONENT ----------- */
class SearchLanguageTree extends PureComponent {
  static nodeHasChildren(node) {
    return Array.isArray(node.children) && (node.children.length > 0 || node.dictionaries.length > 0);
  }

  static getNodeValue(node) {
    return `${node.id[0].toString()},${node.id[1].toString()}`;
  }

  static isEveryChildChecked(node) {
    return node.children.every(child => this.flatNodes[this.getNodeValue(child)].checkState === 1);
  }

  static isSomeChildChecked(node) {
    return node.children.some(child => this.flatNodes[this.getNodeValue(child)].checkState > 0);
  }

  static getShallowCheckState(node) {
    const flatNode = this.flatNodes[node.value];

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

  constructor(props) {
    super(props);

    this.flatNodes = {};
    this.flattenNodes(props.nodes);

    this.onCheck = this.onCheck.bind(this);
  }

  onCheck(nodeInfo) {
    console.log(this, nodeInfo);
  }

  flattenNodes(nodes, parent = {}, type = 'language') {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return;
    }

    nodes.forEach((node) => {
      const isParent = this.constructor.nodeHasChildren(node);
      const nodeValue = this.constructor.getNodeValue(node);
      this.flatNodes[nodeValue] = {
        value: nodeValue,
        self: node,
        parent,
        isParent,
        isLeaf: !isParent,
        type,
        showCheckbox: node.showCheckbox !== undefined ? node.showCheckbox : true,
      };
      this.flattenNodes(node.children, node, 'language');
      this.flattenNodes(node.dictionaries, node, 'dictionary');
    });
  }

  // renderTreeNodes(nodes, parent = {}) {
  //   const treeNodes = nodes.map(node => {
  //     const key = this.constructor.getNodeValue(node);
  //     const flatNode = this.flatNodes[key];

  //     flatNode.checkState = this.constructor.getShallowCheckState(node);
  //   });
  // }

  render() {
    const { nodes } = this.props;

    console.log(this.flatNodes);
    return (
      <div className={classNames.container}>
        {nodes.map(item => <LanguageItem key={item.id} data={item} onChange={this.props.onChange} onCheck={this.onCheck} />)}
      </div>
    );
  }
}

/* ----------- PROPS VALIDATION ----------- */
SearchLanguageTree.propTypes = {
  nodes: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SearchLanguageTree;
