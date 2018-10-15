import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Segment, Button } from 'semantic-ui-react';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import { languagesQuery } from 'graphql/language';
import LanguageTree from './LanguageTree';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-language-tree',
};

/* ----------- COMPONENT ----------- */
class SearchSelectLanguages extends PureComponent {
  constructor() {
    super();

    this.state = {
      showLangs: false,
      selectedLangs: [],
    };

    this.onShowLangsButtonClick = this.onShowLangsButtonClick.bind(this);
  }

  onShowLangsButtonClick() {
    this.setState({
      showLangs: !this.state.showLangs,
    });
  }

  render() {
    const { data } = this.props;
    const { error, loading } = data;

    if (error || loading) {
      return null;
    }

    const { language_tree: langs } = data;

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
              <Segment className={classNames.container}>
                <LanguageTree data={langs} />
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
  data: PropTypes.object.isRequired,
};

export default compose(graphql(languagesQuery))(SearchSelectLanguages);
