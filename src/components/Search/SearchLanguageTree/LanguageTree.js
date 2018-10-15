import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import LanguageItem from './LanguageItem';

/* ----------- COMPONENT ----------- */
class SearchLanguageTree extends PureComponent {
  constructor() {
    super();
  }

  render() {
    const { data } = this.props;
    const langsTree = buildLanguageTree(Immutable.fromJS(data));

    return (
      <div>
        {langsTree.toJS().map(item => <LanguageItem key={item.id} data={item} />)}
      </div>
    );
  }
}

/* ----------- PROPS VALIDATION ----------- */
SearchLanguageTree.propTypes = {
  data: PropTypes.array.isRequired,
};

export default SearchLanguageTree;
