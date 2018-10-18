import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Segment, Button } from 'semantic-ui-react';
import LanguageTree from './LanguageTree';

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
    const { data: langsTree } = this.props;
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
                <LanguageTree data={langsTree} onChange={this.props.onChange} />
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
  onChange: PropTypes.func.isRequired,
};

export default SearchSelectLanguages;
