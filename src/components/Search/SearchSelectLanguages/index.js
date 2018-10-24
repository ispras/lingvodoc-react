import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Segment, Button } from 'semantic-ui-react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose } from 'recompose';
import { fromJS } from 'immutable';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import LanguageTree from './LanguageTree';

/* ----------- COMPONENT ----------- */
class SearchSelectLanguages extends PureComponent {
  static propTypes = {
    data: PropTypes.array.isRequired,
    translations: PropTypes.array.isRequired,
  }

  constructor() {
    super();

    this.state = {
      showLangs: false,
      selectedLangs: [],
      // checked: [
      //   {
      //     type: 'language',
      //     checked: [
      //       '1,203',
      //     ]
      //   },
      //   {
      //     type: 'dictionary',
      //     checked: [
      //       '269,4',
      //     ],
      //   },
      // ],
      checked: [
        'all',
      ],
    };

    this.onShowLangsButtonClick = this.onShowLangsButtonClick.bind(this);
    this.onFilterLangsChange = this.onFilterLangsChange.bind(this);
  }

  onShowLangsButtonClick() {
    this.setState({
      showLangs: !this.state.showLangs,
    });
  }

  onFilterLangsChange(checkedList) {
    this.setState({
      checked: checkedList,
    });
  }

  render() {
    const { data } = this.props;
    const { selectedLangs } = this.state;
    const selectedLangsCount = selectedLangs.length;
    const buttonTranslation = this.props.translations[0].translation;

    return (
      <Segment.Group>
        <Segment>
          <Button primary basic fluid onClick={this.onShowLangsButtonClick}>
            {buttonTranslation}
            <strong> {selectedLangsCount > 0 ? `(selected ${selectedLangsCount} languages)` : null}</strong>
          </Button>
        </Segment>
        {
          this.state.showLangs ?
            <Segment.Group>
              <Segment>
                <LanguageTree checked={this.state.checked} nodes={data} onChange={this.onFilterLangsChange} />
              </Segment>
            </Segment.Group> :
            null
        }
      </Segment.Group>
    );
  }
}

const SearchSelectLanguagesWrap = (props) => {
  const { languagesQuery, translationsQuery } = props;
  const { error: languagesQueryError, loading: languagesQueryLoading } = languagesQuery;
  const { error: translationsQueryError, loading: translationsQueryLoading } = translationsQuery;
  let translations = null;

  if (languagesQueryError || languagesQueryLoading) {
    return null;
  }

  if (translationsQueryError || translationsQueryLoading) {
    translations = [{
      translation: 'Search languages',
    }];
  } else {
    translations = translationsQuery.advanced_translation_search;
  }

  const newProps = {
    ...props,
    data: buildLanguageTree(fromJS(props.languagesQuery.language_tree)).toJS(),
    translations,
  };

  return <SearchSelectLanguages {...newProps} />;
};

SearchSelectLanguagesWrap.propTypes = {
  languagesQuery: PropTypes.object.isRequired,
  translationsQuery: PropTypes.object.isRequired,
  // onChange: PropTypes.func.isRequired,
};

/* ----------- QUERIES ----------- */
const LanguagesWithDictionariesQuery = gql`
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

const i18nQuery = gql`
  query {
    advanced_translation_search(
      searchstrings: [
        "Select languages"
      ]
    ) {
      translation
    }
  }
`;

export default compose(
  graphql(LanguagesWithDictionariesQuery, {
    name: 'languagesQuery',
  }),
  graphql(i18nQuery, {
    name: 'translationsQuery',
  })
)(SearchSelectLanguagesWrap);
