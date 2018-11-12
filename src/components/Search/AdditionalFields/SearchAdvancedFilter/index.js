import React, { PureComponent } from 'react';
import { Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import SearchAudioField from '../SearchAudioField';
import './index.scss';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-advanced-filter',
  field: 'search-advanced-filter__field',
  header: 'search-advanced-filter__header',
};

/* ----------- COMPONENT ----------- */
/**
 * Advanced filter.
 */
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
      <Segment.Group className={classNames.container}>
        <Segment>
          Selected:
        </Segment>
        {this.props.show ?
          <Segment.Group>
            <Segment>
              <SearchAudioField
                classNames={classNames}
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
