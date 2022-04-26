import React, { useContext } from "react";
import { connect } from "react-redux";
import { Icon, Label, Menu } from "semantic-ui-react";
import PropTypes from "prop-types";
import { pure } from "recompose";

import { toggleTasks } from "ducks/task";
import TranslationContext from "Layout/TranslationContext";

import imageTasks from "../images/tasks.svg";

const Tasks = pure(({ count, loading, toggle }) => {
  const getTranslation = useContext(TranslationContext);
  const tasks_str = getTranslation("Tasks");

  return loading ? (
    <Menu.Item as="a" onClick={toggle} className="top_menu top_menu__item_tasks">
      <span className="tasks-elem" title={tasks_str}>
        <img src={imageTasks} alt={tasks_str} className="icon-tasks" /> <Icon loading name="spinner" />
      </span>
    </Menu.Item>
  ) : (
    <Menu.Item as="a" onClick={toggle} className="top_menu top_menu__item_tasks">
      <span className="tasks-elem" title={tasks_str}>
        <img src={imageTasks} alt={tasks_str} className="icon-tasks" />
        <Label circular floating className="tasks-label">
          {count}
        </Label>
      </span>
    </Menu.Item>
  );
});

Tasks.propTypes = {
  count: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired
};

function mapStateToProps({ task }) {
  return {
    loading: task.loading,
    count: task.tasks.length
  };
}

export default connect(mapStateToProps, { toggle: toggleTasks })(Tasks);
