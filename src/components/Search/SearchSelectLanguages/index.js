import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Segment, Button } from 'semantic-ui-react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose } from 'recompose';
import { fromJS } from 'immutable';
import LanguageTree from './LanguageTree';
import { buildLanguageTree } from 'pages/Search/treeBuilder';

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

/* ----------- COMPONENT ----------- */
class SearchSelectLanguages extends PureComponent {
  constructor(props) {
    super();

    this.state = {
      showLangs: false,
      selectedLangs: [],
    };

    this.nodes = props.data;

    this.onShowLangsButtonClick = this.onShowLangsButtonClick.bind(this);
  }

  onShowLangsButtonClick() {
    this.setState({
      showLangs: !this.state.showLangs,
    });
  }

  onFilterLangsChange(id, type, checked) {
    console.log(this, id, type, checked);
  }

  render() {
    const { nodes: langsTree } = this;
    const { selectedLangs } = this.state;
    const selectedLangsCount = selectedLangs.length;

    return (
      <Segment.Group>
        <Segment>
          <Button primary basic fluid onClick={this.onShowLangsButtonClick}>
            Select languages
            <strong> {selectedLangsCount > 0 ? `(selected ${selectedLangsCount} languages)` : null}</strong>
          </Button>
        </Segment>
        {
          this.state.showLangs ?
            <Segment.Group>
              <Segment>
                <LanguageTree data={langsTree} onChange={this.onFilterLangsChange} />
              </Segment>
              <Segment>
                <Button primary basic>
                  Снять выделенное
                </Button>
                <Button primary basic>
                  Выделить всё
                </Button>
              </Segment>
            </Segment.Group> :
            null
        }
      </Segment.Group>
    );
  }
}

/* ----------- PROPS VALIDATION ----------- */
SearchSelectLanguages.propTypes = {
  data: PropTypes.array.isRequired,
};

const SearchSelectLanguagesWrap = (props) => {
  const { data } = props;
  const { error, loading } = data;

  if (error || loading) {
    return null;
  }

  const newProps = {
    ...props,
    data: buildLanguageTree(fromJS(props.data.language_tree)).toJS(),
  };

  return <SearchSelectLanguages {...newProps} />;
};

SearchSelectLanguagesWrap.propTypes = {
  data: PropTypes.object.isRequired,
  // onChange: PropTypes.func.isRequired,
};

export default compose(graphql(LanguagesWithDictionariesQuery))(SearchSelectLanguagesWrap);
