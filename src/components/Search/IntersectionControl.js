import React, { useContext } from "react";
import PropTypes from "prop-types";
import { pure } from "recompose";
import styled from "styled-components";

import TranslationContext from "Layout/TranslationContext";

const Range = styled.div`
  display: flex;
  padding: 5px 0;

  span {
    padding: 0 5px;
  }
`;

const IntersectionControl = ({ value, max, onChange, isActive }) => {
  const getTranslation = useContext(TranslationContext);

  return (
    <Range className={isActive ? "intersection-control active" : "intersection-control"}>
      <span>0</span>
      <input type="range" min={0} max={max} step={1} value={value} disabled={!isActive} onChange={onChange} />
      <span>{max}</span>
      <span className="intersection-control__text">
        {getTranslation("More than")} {value} {getTranslation("intersections")}
      </span>
    </Range>
  );
};

IntersectionControl.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

export default pure(IntersectionControl);
