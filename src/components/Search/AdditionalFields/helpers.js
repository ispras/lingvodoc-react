const propsNames = {
  languages: 'children',
  dictionaries: 'dictionaries',
};

/**
 * Checks if a node has languages children.
 * @param {Object} node - node of the tree
 * @returns {boolean} - result of the checking
 */
const nodeHasLanguagesChildren = (node) => {
  return Array.isArray(node[propsNames.languages]) && node[propsNames.languages].length > 0;
};

/**
 * Checks if a node has dictionaries children.
 * @param {Object} node - tree node
 * @returns {boolean} - result of checking
 */
const nodeHasDictionariesChildren = (node) => {
  return Array.isArray(node[propsNames.dictionaries]) && node[propsNames.dictionaries].length > 0;
};

/**
 * Gets the value of a tree node as a string obtained from the node id.
 * @param {Object} node - tree node
 * @returns {string} - tree node value
 */
const getNodeValue = node => `${node.id[0].toString()},${node.id[1].toString()}`;

/**
 * Creates a flat object from the nested node tree where key is a tree node value
 * and value is a tree node object with the additional properties.
 * @param {Array} nodes - list of the tree nodes
 * @param {Object} flatNodes - object to fill with data
 * @param {Object} parent - tree node-parent
 * @param {string} type - type of the tree node: language or dictionary, language by default
 */
const flattenNodes = (nodes, flatNodes, parent = {}, type = 'language') => {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return;
  }

  nodes.forEach((node) => {
    const isParentWithLanguages = nodeHasLanguagesChildren(node);
    const isParentWithDictionaries = nodeHasDictionariesChildren(node);
    const nodeValue = getNodeValue(node);

    flatNodes[nodeValue] = {
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
    flattenNodes(node.children, flatNodes, node, 'language', flatNodes);
    flattenNodes(node.dictionaries, flatNodes, node, 'dictionary', flatNodes);
  });
};

export {
  nodeHasLanguagesChildren,
  nodeHasDictionariesChildren,
  getNodeValue,
  flattenNodes,
  propsNames,
};
