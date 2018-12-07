import React from 'react';
import { Checkbox } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const AreaGroup = ({
  text, selected, color, onChange, isActive,
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
      <div className="area-groups-select__color" style={{ backgroundColor: color }} />
    </div>
  );
};

AreaGroup.propTypes = {
  text: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  selected: PropTypes.bool.isRequired,
  color: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

AreaGroup.defaultProps = {
  color: 'transparent',
};

export default AreaGroup;
