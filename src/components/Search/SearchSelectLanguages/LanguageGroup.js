import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import LanguageItem from './LanguageItem';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-language-tree__group',
  translation: 'search-language-tree__translation',
  expandButton: 'search-language-tree__button search-language-tree__button_expand',
  collapseButton: 'search-language-tree__button search-language-tree__button_collapse',
  groupItems: 'search-language-tree__group-items',
  groupItemsShow: 'search-language-tree__group-items search-language-tree__group-items_show',
  groupTitle: 'search-language-tree__group-title',
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
    return (
      <div className={classNames.container}>
        <div className={classNames.groupTitle}>
          <button
            className={collapse ? classNames.collapseButton : classNames.expandButton}
            onClick={this.onButtonClick}
          />
          <div className={classNames.translation}>{data.translation}</div>
        </div>
        <div className={collapse ? classNames.groupItems : classNames.groupItemsShow}>
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
