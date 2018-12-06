import React from 'react';
import { Checkbox } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const AreaGroup = ({
  text, selected, onChange, isActive,
}) => {
  return (
    <div className="area-groups-select__group">
      <Checkbox
        toggle
        checked={selected}
        label={text}
        onChange={onChange}
        disabled={!isActive}
      />
    </div>
  );
};

AreaGroup.propTypes = {
  text: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  selected: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default AreaGroup;
