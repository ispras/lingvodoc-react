import React from 'react';
import { Dropdown, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const SearchFieldSelect = props => (
  <div>
    <Dropdown
      multiple
      search
      selection
      options={props.options}
      placeholder={props.placeholder}
      noResultsMessage={props.noResultsMessage}
      value={props.value}
      onChange={props.onChange}
    />
    <div>
      <Button primary basic onClick={props.onSelectAllButtonClick}>
        {props.selectAllText}
      </Button>
      <Button primary basic onClick={props.onClearAllButtonClick}>
        {props.clearAllText}
      </Button>
    </div>
  </div>
);

SearchFieldSelect.propTypes = {
  options: PropTypes.array,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  onSelectAllButtonClick: PropTypes.func,
  onClearAllButtonClick: PropTypes.func,
  placeholder: PropTypes.string,
  noResultsMessage: PropTypes.string,
  selectAllText: PropTypes.string.isRequired,
  clearAllText: PropTypes.string.isRequired,
};

SearchFieldSelect.defaultProps = {
  options: [],
  onChange: () => {},
  onSelectAllButtonClick: () => {},
  onClearAllButtonClick: () => {},
  placeholder: 'Select option',
  noResultsMessage: 'No results found.',
};

export default SearchFieldSelect;
