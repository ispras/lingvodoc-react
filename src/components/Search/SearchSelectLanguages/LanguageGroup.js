import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import LanguageItem from './LanguageItem';
import DictionaryItem from './DictionaryItem';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-language-tree__group',
  translationWrap: 'search-language-tree__translation-wrap',
  translation: 'search-language-tree__translation',
  expandButton: 'search-language-tree__button search-language-tree__button_expand',
  collapseButton: 'search-language-tree__button search-language-tree__button_collapse',
  groupItems: 'search-language-tree__group-items',
  groupItemsShow: 'search-language-tree__group-items search-language-tree__group-items_show',
  noGroupsInGroup: 'search-language-tree__group-items_no-groups',
  groupTitle: 'search-language-tree__group-title',
  checkbox: 'search-language-tree__checkbox',
};

const isGroupsInGroup = (group) => {
  for (let i = 0; i < group.length; i++) {
    if (group[i].children.length > 0) {
      return true;
    }
  }
  return false;
};

/* ----------- COMPONENT ----------- */
class LanguageGroup extends PureComponent {
  constructor(props) {
    super();

    const { data } = props;

    if (data && (data.checked === undefined || data.checked)) {
      this.state = {
        checked: true,
        collapse: true,
      };
    } else {
      this.state = {
        checked: false,
        collapse: true,
      };
    }

    this.onButtonClick = this.onButtonClick.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
  }

  onButtonClick() {
    this.setState({
      collapse: !this.state.collapse,
    });
  }

  onCheckboxChange(ev) {
    this.props.onChange(this.props.data.id, 'language', ev.target.checked);

    this.setState({
      checked: ev.target.checked,
    });
  }

  render() {
    const { data } = this.props;
    const { children } = data;
    const { dictionaries } = data;
    const { collapse } = this.state;
    let childrenClassName = '';

    if (collapse) {
      childrenClassName = classNames.groupItems;
    } else {
      childrenClassName = classNames.groupItemsShow;
    }

    if (!isGroupsInGroup(children)) {
      childrenClassName = `${childrenClassName} ${classNames.noGroupsInGroup}`;
    }

    return (
      <div className={classNames.container}>
        <div className={classNames.groupTitle}>
          <input
            className={classNames.checkbox}
            type="checkbox"
            checked={this.state.checked}
            onChange={this.onCheckboxChange}
          />
          <button
            className={collapse ? classNames.collapseButton : classNames.expandButton}
            onClick={this.onButtonClick}
          />
          <div className={classNames.translationWrap}>
            <div className={classNames.translation}>
              {data.translation}
            </div>
          </div>
        </div>
        <div className={childrenClassName}>
          {children.map(item => <LanguageItem key={item.id} data={item} onChange={this.props.onChange} />)}
          {dictionaries.map(item => <DictionaryItem key={item.id} data={item} onChange={this.props.onChange} />)}
        </div>
      </div>
    );
  }
}

/* ----------- PROPS VALIDATION ----------- */
LanguageGroup.propTypes = {
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default LanguageGroup;
