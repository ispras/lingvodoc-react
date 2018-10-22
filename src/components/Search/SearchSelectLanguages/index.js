import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Segment, Button } from 'semantic-ui-react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose } from 'recompose';
import { fromJS } from 'immutable';
import { buildLanguageTree } from 'pages/Search/treeBuilder';
import LanguageTree from './LanguageTree';

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
  constructor() {
    super();

    this.state = {
      showLangs: false,
      selectedLangs: [],
      checked: [
        {
          type: 'language',
          checked: [
            '1,203',
          ]
        },
        {
          type: 'dictionary',
          checked: [
            '269,4',
          ],
        },
      ],
    };

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
    const { data } = this.props;
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
                <LanguageTree checked={this.state.checked} nodes={data} onChange={this.onFilterLangsChange} />
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
