import React, { PureComponent } from "react";
import { Checkbox } from "semantic-ui-react";
import PropTypes from "prop-types";

/* ----------- PROPS ----------- */
const classNames = {
  leaf: "search-language-tree__leaf",
  group: "search-language-tree__group",
  node: "search-language-tree__node",
  translationWrap: "search-language-tree__translation-wrap",
  translation: "search-language-tree__translation",
  checkbox: "search-language-tree__checkbox lingvo-checkbox",
  expandButton: "search-language-tree__button search-language-tree__button_expand",
  collapseButton: "search-language-tree__button search-language-tree__button_collapse",
  title: "search-language-tree__title",
  items: "search-language-tree__items"
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
    type: PropTypes.string.isRequired
  };

  static defaultProps = {
    onExpand: () => {},
    onCheck: () => {},
    children: null,
    optimisticToggle: true
  };

  constructor() {
    super();

    this.onCheck = this.onCheck.bind(this);
    this.onExpand = this.onExpand.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onLabelClick = this.onLabelClick.bind(this);
    this.onCheckboxKeyPress = this.onCheckboxKeyPress.bind(this);
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
      checked: isChecked
    });
  }

  /**
   * On expand tree node event handler.
   */
  onExpand() {
    const { expanded, value, onExpand, isLeaf } = this.props;
    if (isLeaf) {
      return;
    }
    onExpand({ value, expanded: !expanded });
  }

  /**
   * Event handler for pressing a key.
   * @param {Object} ev - keyboard event object
   */
  onKeyPress(ev) {
    const { isLeaf } = this.props;
    if (ev.key === "Enter") {
      if (isLeaf) {
        this.onCheck();
      } else {
        this.onExpand();
      }
    }
  }

  /**
   * Event handler for clicking on tree node label.
   */
  onLabelClick() {
    const { isLeaf } = this.props;

    if (isLeaf) {
      this.onCheck();
    } else {
      this.onExpand();
    }
  }

  /**
   * Event handler for pressing key on checkbox.
   * @param {Object} ev - keyboard event object
   */
  onCheckboxKeyPress(ev) {
    if (ev.key === "Enter") {
      this.onCheck();
    }
  }

  /**
   * Renders block with the children tree nodes.
   */
  renderChildren() {
    if (!this.props.expanded) {
      return null;
    }

    return <div className={classNames.items}>{this.props.children}</div>;
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
        aria-label={expanded ? "Collapse" : "Expand"}
      />
    );
  }

  /**
   * Renders tree node label.
   */
  renderLabel() {
    const { label, type } = this.props;
    return (
      <div
        className={classNames.translation}
        onClick={this.onLabelClick}
        onKeyPress={this.onKeyPress}
        role="button"
        tabIndex="0"
        aria-label={label}
      >
        {type === "dictionary" ? (
          <strong>
            <em>{label}</em>
          </strong>
        ) : (
          label
        )}
      </div>
    );
  }

  /**
   * Renders tree node checkbox.
   */
  renderCheckbox() {
    const { checked } = this.props;
    
    return (
      <Checkbox
        className={classNames.checkbox}
        indeterminate={checked === 2}
        checked={checked === 1}
        onChange={this.onCheck}
        onKeyPress={this.onCheckboxKeyPress}
        aria-label={checked === 1 ? "Uncheck" : "Check"}
      />
    );
  }

  /**
   * Renders tree node title with checkbox, label and collapse/expand button.
   */
  renderTitle() {
    return (
      <div className={classNames.title}>
        <div className={classNames.translationWrap}>
          {this.renderCheckbox()}
          {this.renderCollapseButton()}
          {this.renderLabel()}
        </div>
      </div>
    );
  }

  render() {
    const { isLeaf, isParent } = this.props;
    const containerClassName = isLeaf
      ? `${classNames.node} ${classNames.leaf}`
      : `${classNames.node} ${classNames.group}`;
    const title = this.renderTitle();
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
