import React, { PureComponent } from "react";
import { Checkbox } from "semantic-ui-react";
/*import { memoize } from "lodash";*/
import PropTypes from "prop-types";

import TranslationContext from "Layout/TranslationContext";

import AreaGroupsSelect from "./AreaGroupsSelect";

class AreasMode extends PureComponent {
  /*getAreaGroups = memoize(rawAreaGroups =>
    Object.values(rawAreaGroups.toJS()).reduce((acc, current) => {
      acc[current.text] = current;
      return acc;
    }, {})
  );*/

  getAreaGroups = (rawAreaGroups =>
    Object.values(rawAreaGroups.toJS()).reduce((acc, current) => {
      acc[current.text] = current;
      return acc;
    }, {})
  );

  render() {
    const { isAreasModeOn, onAreasModeChange, areasGroups: rawAreaGroups, onSelectedAreaGroupsChange } = this.props;
    const areasGroups = this.getAreaGroups(rawAreaGroups);

    return (
      <div className="areas-mode">
        <AreaGroupsSelect data={areasGroups} isActive={isAreasModeOn} onChange={onSelectedAreaGroupsChange} />
        <div className="areas-mode__toggle-mode">
          <Checkbox toggle label={this.context("Areas mode")} checked={isAreasModeOn} onChange={onAreasModeChange} />
        </div>
      </div>
    );
  }
}

AreasMode.contextType = TranslationContext;

AreasMode.propTypes = {
  isAreasModeOn: PropTypes.bool.isRequired,
  areasGroups: PropTypes.object.isRequired,
  onAreasModeChange: PropTypes.func.isRequired,
  onSelectedAreaGroupsChange: PropTypes.func.isRequired
};

export default AreasMode;
