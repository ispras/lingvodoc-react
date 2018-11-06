import React, { PureComponent } from 'react';
import { Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';

class SearchTagsFilter extends PureComponent {
  static propTypes = {
    showTags: PropTypes.bool,
  }

  static defaultProps = {
    showTags: true,
  }

  render() {
    return (
      <Segment.Group>
        <Segment>
          Информация о выборе
        </Segment>
        {this.props.showTags ?
          <Segment.Group>
            <Segment>Теги</Segment>
          </Segment.Group> :
          null
        }
      </Segment.Group>
    );
  }
}

export default SearchTagsFilter;
