import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

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
  groupItemsShow: 'search-language-tree__group-items search-language-tree__group-items_show',
  noGroupsInGroup: 'search-language-tree__group-items_no-groups',
};

class TreeNode extends PureComponent {
  static propTypes = {
    checked: PropTypes.bool.isRequired,
    expanded: PropTypes.bool.isRequired,
    isLeaf: PropTypes.bool.isRequired,
    isParent: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    groupHasGroups: PropTypes.bool,
    onExpand: PropTypes.func,
    children: PropTypes.node,
  }

  static defaultProps = {
    onExpand: () => {},
    children: null,
    groupHasGroups: false,
  }

  constructor() {
    super();

    this.onCheck = this.onCheck.bind(this);
    this.onExpand = this.onExpand.bind(this);
  }

  onCheck() {
    console.log(this, 'checked');
  }

  onExpand() {
    const { expanded, value, onExpand } = this.props;
    onExpand({ value, expanded: !expanded });
  }

  renderChildren() {
    if (!this.props.expanded) {
      return null;
    }

    let childrenClassName = classNames.groupItems;

    childrenClassName = !this.props.groupHasGroups ?
      `${childrenClassName} ${classNames.noGroupsInGroup}` : childrenClassName;

    return (
      <div className={childrenClassName}>
        {this.props.children}
      </div>
    );
  }

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

  renderLabel() {
    const { label } = this.props;

    return (
      <div className={classNames.translation}>
        {label}
      </div>
    );
  }

  renderCheckbox() {
    const { checked } = this.props;

    return (
      <input
        className={classNames.checkbox}
        type="checkbox"
        checked={checked}
        onChange={this.onCheck}
      />
    );
  }

  renderTitle() {
    return (
      <div className={classNames.translationWrap}>
        {this.renderCheckbox()}
        {this.renderCollapseButton()}
        {this.renderLabel()}
      </div>
    );
  }

  renderItemTitle() {
    return this.renderTitle();
  }

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
