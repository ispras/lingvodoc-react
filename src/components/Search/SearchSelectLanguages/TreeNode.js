import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'semantic-ui-react';

/* ----------- PROPS ----------- */
const classNames = {
  item: 'search-language-tree__item',
  group: 'search-language-tree__group',
  translationWrap: 'search-language-tree__translation-wrap',
  translation: 'search-language-tree__translation',
  checkbox: 'search-language-tree__checkbox',
  expandButton: 'search-language-tree__button search-language-tree__button_expand',
  collapseButton: 'search-language-tree__button search-language-tree__button_collapse',
  groupTitle: 'search-language-tree__group-title',
  groupItems: 'search-language-tree__group-items',
};

/**
 * Represents the tree node.
 */
class TreeNode extends PureComponent {
  static propTypes = {
    checked: PropTypes.number.isRequired,
    expanded: PropTypes.bool.isRequired,
    isLeaf: PropTypes.bool.isRequired,
    isParent: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onExpand: PropTypes.func,
    onCheck: PropTypes.func,
    children: PropTypes.node,
    optimisticToggle: PropTypes.bool,
  }

  static defaultProps = {
    onExpand: () => {},
    onCheck: () => {},
    children: null,
    optimisticToggle: true,
  }

  constructor() {
    super();

    this.onCheck = this.onCheck.bind(this);
    this.onExpand = this.onExpand.bind(this);
  }

  /**
   * On checking tree node event handler.
   */
  onCheck() {
    let isChecked = false;

    if (this.props.checked === 0) {
      isChecked = true;
    }

    if (this.props.checked === 2) {
      isChecked = this.props.optimisticToggle;
    }

    this.props.onCheck({
      value: this.props.value,
      checked: isChecked,
    });
  }

  /**
   * On expand tree node event handler.
   */
  onExpand() {
    const { expanded, value, onExpand } = this.props;
    onExpand({ value, expanded: !expanded });
  }

  /**
   * Renders block with the children tree nodes.
   */
  renderChildren() {
    if (!this.props.expanded) {
      return null;
    }

    return (
      <div className={classNames.groupItems}>
        {this.props.children}
      </div>
    );
  }

  /**
   * Renders button for expand/collapse children of the tree node.
   */
  renderCollapseButton() {
    const { isLeaf, expanded } = this.props;

    if (isLeaf) {
      return null;
    }

    return (
      <button
        className={expanded ? classNames.expandButton : classNames.collapseButton}
        onClick={this.onExpand}
      />
    );
  }

  /**
   * Renders tree node label.
   */
  renderLabel() {
    const { label } = this.props;

    return (
      <div className={classNames.translation}>
        {label}
      </div>
    );
  }

  /**
   * Renders tree node checkbox.
   */
  renderCheckbox() {
    const { checked } = this.props;

    if (checked === 2) {
      return (
        <Checkbox
          className={classNames.checkbox}
          indeterminate
          onChange={this.onCheck}
        />
      );
    }

    return (
      <Checkbox
        className={classNames.checkbox}
        checked={checked === 1}
        onChange={this.onCheck}
      />
    );
  }

  /**
   * Renders tree node title with checkbox, label and collapse/expand button.
   */
  renderTitle() {
    return (
      <div className={classNames.translationWrap}>
        {this.renderCheckbox()}
        {this.renderCollapseButton()}
        {this.renderLabel()}
      </div>
    );
  }

  /**
   * Renders title of the tree node that has no children.
   */
  renderItemTitle() {
    return this.renderTitle();
  }

  /**
   * Renders title of the tree node that has children.
   */
  renderGroupTitle() {
    return (
      <div className={classNames.groupTitle}>
        {this.renderTitle()}
      </div>
    );
  }

  render() {
    const { isLeaf, isParent } = this.props;
    const containerClassName = isLeaf ? classNames.item : classNames.group;
    const title = isLeaf ? this.renderItemTitle() : this.renderGroupTitle();
    const children = isParent ? this.renderChildren() : null;

    return (
      <div className={containerClassName}>
        {title}
        {children}
      </div>
    );
  }
}

export default TreeNode;
