import React, { PureComponent } from 'react';
import { Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import SearchAudioField from '../SearchAudioField';

class SearchAdvancedFilter extends PureComponent {
  static propTypes = {
    show: PropTypes.bool,
    hasAudio: PropTypes.oneOf([
      true, false, null,
    ]),
    onChange: PropTypes.func.isRequired,
  }

  static defaultProps = {
    show: true,
  }

  constructor() {
    super();

    this.onHasAudioChange = this.onHasAudioChange.bind(this);
  }

  /**
   * Event handler for hasAudio field selecting.
   * @param {boolean|null} value - hasAudio field value
   */
  onHasAudioChange(value) {
    this.props.onChange(value, 'hasAudio');
  }

  render() {
    return (
      <Segment.Group>
        <Segment>
          Selected:
        </Segment>
        {this.props.show ?
          <Segment.Group>
            <Segment>
              <SearchAudioField
                value={this.props.hasAudio}
                onChange={this.onHasAudioChange}
              />
            </Segment>
          </Segment.Group> :
          null
        }
      </Segment.Group>
    );
  }
}

export default SearchAdvancedFilter;
