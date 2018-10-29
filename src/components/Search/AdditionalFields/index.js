import React, { PureComponent } from 'react';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { fromJS } from 'immutable';
import gql from 'graphql-tag';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import SearchSelectLanguages from './SearchSelectLanguages';

/* ----------- COMPONENT ----------- */
/**
 * Additional fields for the search form.
 */
class AdditionalFields extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    defaultDataChecked: PropTypes.object.isRequired,
    languagesTree: PropTypes.array.isRequired,
  }

  constructor(props) {
    super();

    this.languagesTree = props.languagesTree;

    this.onLangsDictsChange = this.onLangsDictsChange.bind(this);
  }

  /**
   * Event handler for languages or dictionaries selecting.
   * @param {Object} list - checked languages and/or dictionaries
   */
  onLangsDictsChange(list) {
    const result = {
      ...list,
    };

    this.props.onChange(result);
  }

  render() {
    const { languages, dictionaries } = this.props.defaultDataChecked;
    const { languagesTree } = this.props;
    return (
      <SearchSelectLanguages
        onChange={this.onLangsDictsChange}
        languagesTree={languagesTree}
        defaultLangsChecked={languages}
        defaultDictsChecked={dictionaries}
      />
    );
  }
}

/**
 * Component for receiving, transmitting and handling data from the API to the main component.
 * @param {Object} props - component properties
 * @returns {AdditionalFields} - component with added properties (data from API)
 */
const AdditionalFieldsWrap = (props) => {
  const { languagesQuery } = props;
  const { error: languagesQueryError, loading: languagesQueryLoading } = languagesQuery;

  if (languagesQueryError || languagesQueryLoading) {
    return null;
  }

  // TODO: need to fix it, too many extra calculates
  const newProps = {
    ...props,
    languagesTree: buildLanguageTree(fromJS(props.languagesQuery.language_tree)).toJS(),
  };

  return <AdditionalFields {...newProps} />;
};

AdditionalFieldsWrap.propTypes = {
  languagesQuery: PropTypes.object.isRequired,
};

/* ----------- QUERIES ----------- */
const languagesWithDictionariesQuery = gql`
  query Languages {
    language_tree {
      id
      parent_id
      translation
      dictionaries {
        id
        parent_id
        translation
        category
      }
    }
  }
`;

export default compose(graphql(languagesWithDictionariesQuery, {
  name: 'languagesQuery',
}))(AdditionalFieldsWrap);
