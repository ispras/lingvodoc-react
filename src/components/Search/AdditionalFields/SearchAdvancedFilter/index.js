import React, { PureComponent } from 'react';
import { Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import SearchAudioField from '../SearchAudioField';
import SearchKindField from '../SearchKindField';
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
    kind: PropTypes.oneOf([
      'Expedition', 'Archive', null,
    ]),
    onChange: PropTypes.func.isRequired,
  }

  static defaultProps = {
    show: true,
  }

  constructor() {
    super();

    this.onHasAudioChange = this.onHasAudioChange.bind(this);
    this.onKindChange = this.onKindChange.bind(this);
  }

  /**
   * Event handler for "hasAudio" field selecting.
   * @param {boolean|null} value - hasAudio field value
   */
  onHasAudioChange(value) {
    this.props.onChange(value, 'hasAudio');
  }

  /**
   * Event handler for "kind" field selecting.
   * @param {boolean|null} value - hasAudio field value
   */
  onKindChange(value) {
    this.props.onChange(value, 'kind');
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
            <Segment>
              <SearchKindField
                classNames={classNames}
                value={this.props.kind}
                onChange={this.onKindChange}
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
