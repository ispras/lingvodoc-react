import React from 'react';
import { Dropdown, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const SearchFieldSelect = props => (
  <div>
    <Dropdown
      multiple
      search
      selection
      value={props.value}
      options={props.options}
      onChange={props.onChange}
      placeholder={props.placeholder}
      noResultsMessage={props.noResultsMessage}
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
  value: PropTypes.array.isRequired,
  options: PropTypes.array,
  onChange: PropTypes.func,
  onSelectAllButtonClick: PropTypes.func,
  onClearAllButtonClick: PropTypes.func,
  placeholder: PropTypes.string,
  selectAllText: PropTypes.string.isRequired,
  clearAllText: PropTypes.string.isRequired,
  noResultsMessage: PropTypes.string,
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
