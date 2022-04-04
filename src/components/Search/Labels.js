import React from "react";
import { Label } from "semantic-ui-react";
import PropTypes from "prop-types";
import { pure } from "recompose";

const Labels = ({ data, onClick, isActive }) => (
  <div className={isActive ? "searches-lables active" : "searches-labels"}>
    {data.map(label => (
      <Label
        key={label.text}
        as="a"
        style={{
          backgroundColor: label.isActive ? label.color : "grey",
          color: "#fff"
        }}
        onClick={() => {
          if (isActive) {
            onClick(label.id);
          }
        }}
      >
        {label.text}
      </Label>
    ))}
  </div>
);

Labels.propTypes = {
  data: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired
};

export default pure(Labels);
