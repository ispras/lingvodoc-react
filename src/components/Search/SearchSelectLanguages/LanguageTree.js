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
  constructor() {
    super();
  }

  render() {
    const { data: langsTree } = this.props;

    return (
      <div className={classNames.container}>
        {langsTree.map(item => <LanguageItem key={item.id} data={item} onChange={this.props.onChange} />)}
      </div>
    );
  }
}

/* ----------- PROPS VALIDATION ----------- */
SearchLanguageTree.propTypes = {
  data: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SearchLanguageTree;
