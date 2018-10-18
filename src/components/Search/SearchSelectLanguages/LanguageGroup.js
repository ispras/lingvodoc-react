import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import LanguageItem from './LanguageItem';

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
  constructor() {
    super();

    this.state = {
      collapse: true,
    };

    this.onButtonClick = this.onButtonClick.bind(this);
  }

  onButtonClick() {
    this.setState({
      collapse: !this.state.collapse,
    });
  }

  render() {
    const { data } = this.props;
    const { children } = data;
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
          {children.map(item => <LanguageItem key={item.id} data={item} />)}
        </div>
      </div>
    );
  }
}

/* ----------- PROPS VALIDATION ----------- */
LanguageGroup.propTypes = {
  data: PropTypes.object.isRequired,
};

export default LanguageGroup;
