import React, { PureComponent } from "react";
import { Accordion, Checkbox, Icon } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import { memoize } from "lodash";
import PropTypes from "prop-types";

import AreaGroup from "./Group";

class AreaGroupsSelect extends PureComponent {
  constructor() {
    super();
    this.state = {
      selected: [],
      selectedAll: false,
      activeIndex: -1
    };

    this.savedSelected = null;

    this.onSelectedChange = this.onSelectedChange.bind(this);
    this.onSelectAllChange = this.onSelectAllChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isActive && !this.props.isActive) {
      this.setState({
        activeIndex: -1
      });
    }

    if (prevProps.data !== this.props.data) {
      const { selected, selectedAll } = this.state;
      let newSelected = null;

      if (selectedAll) {
        newSelected = this.getAllGroupIds();
      } else {
        newSelected = selected.filter(id => this.getGroupById(id) !== null);
      }

      this.setState({
        selected: newSelected
      });

      this.sendDataToTop(this.getSelectedGroups(newSelected));
    }
  }

  onSelectedChange(ev, { label, checked }) {
    const selectedGoupId = this.getGroupIdByName(label);

    if (selectedGoupId === null) {
      return;
    }

    const { selected } = this.state;
    const newSelected = [...selected];

    if (checked) {
      newSelected.push(selectedGoupId);
    } else {
      newSelected.splice(newSelected.indexOf(selectedGoupId), 1);
    }

    this.setState({
      selected: newSelected,
      selectedAll: false
    });

    this.sendDataToTop(this.getSelectedGroups(newSelected));
  }

  onSelectAllChange(ev, { checked }) {
    if (checked) {
      this.selectAll();
    } else {
      this.unselectAll();
    }
  }

  getIterableData = memoize(data => Object.values(data));

  getGroupIdByName(groupName) {
    const group = this.props.data[groupName];

    if (!group) {
      return null;
    }

    return group.id;
  }

  getGroupById(groupId) {
    const data = this.getIterableData(this.props.data);
    let result = null;

    data.forEach(group => {
      if (group.id === groupId) {
        result = group;
      }
    });

    return result;
  }

  getSelectedGroups(groupIds) {
    const data = this.getIterableData(this.props.data);

    return data.filter(group => groupIds.indexOf(group.id) !== -1);
  }

  getAllGroupIds() {
    const data = this.getIterableData(this.props.data);
    const all = [];

    data.forEach(group => all.push(group.id));

    return all;
  }

  selectAll() {
    const newSelected = this.getAllGroupIds();

    this.savedSelected = this.state.selected;
    this.setState({
      selected: newSelected,
      selectedAll: true
    });

    this.sendDataToTop(this.getSelectedGroups(newSelected));
  }

  unselectAll() {
    if (!this.savedSelected) {
      return;
    }

    this.setState({
      selected: this.savedSelected,
      selectedAll: false
    });

    this.sendDataToTop(this.getSelectedGroups(this.savedSelected));
  }

  handleClick = (e, titleProps) => {
    if (!this.props.isActive) {
      return;
    }

    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({
      activeIndex: newIndex
    });
  };

  isGroupSelected(group) {
    return this.state.selected.indexOf(group.id) !== -1;
  }

  sendDataToTop(data) {
    const { onChange } = this.props;
    if (onChange) {
      onChange(data);
    }
  }

  render() {
    const { isActive } = this.props;
    const { activeIndex, selectedAll } = this.state;
    const data = this.getIterableData(this.props.data);

    return (
      <Accordion className={isActive ? "area-groups-select active" : "area-groups-select"}>
        <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
          <Icon name="dropdown" />
          {getTranslation("Choose groups for areas")}
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          {data.map(group => (
            <AreaGroup
              key={group.id}
              text={group.text}
              selected={this.isGroupSelected(group)}
              color={group.color}
              isActive={isActive}
              onChange={this.onSelectedChange}
            />
          ))}
          {data.length === 0 ? (
            <strong>{getTranslation("No groups to select")}</strong>
          ) : (
            <div className="area-groups-select__group area-groups-select__group_all">
              <Checkbox
                toggle
                checked={selectedAll}
                label={getTranslation("Select all")}
                onChange={this.onSelectAllChange}
                disabled={!isActive}
              />
            </div>
          )}
        </Accordion.Content>
      </Accordion>
    );
  }
}

AreaGroupsSelect.propTypes = {
  data: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

export default AreaGroupsSelect;
