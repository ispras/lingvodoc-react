import React from "react";
import { connect } from "react-redux";
import { Button, Sidebar } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";
import styled from "styled-components";

import TaskList from "components/TaskList";
import { removeTask, toggleTasks } from "ducks/task";

const Wrapper = styled.div`
  padding: 16px;
  padding-top: 106px;
  min-height: 100vh;
`;

const onClearTasks = (tasks, remove) => {
  tasks.forEach(task => {
    if (task.current_stage == task.total_stages && task.progress === 100) {remove(task.id);}
  });
};

const TasksSidebar = ({ visible, tasks, toggle, remove }) => (
  <Sidebar animation="overlay" direction="right" width="wide" visible={visible} as={Wrapper} className="lingvo-sidebar">
    <div className="lingvo-sidebar__content">
      <Button className="lingvo-button-close lingvo-sidebar__close" onClick={toggle} icon>
        <i className="lingvo-icon-close" />
      </Button>

      {(tasks && tasks.length && (
        <Button
          onClick={() => onClearTasks(tasks, remove)}
          disabled={!tasks.some(task => task.current_stage == task.total_stages && task.progress === 100)}
          className="lingvo-button-violet-dashed"
        >
          {getTranslation("Clear completed")}
        </Button>
      )) ||
        null}

      <TaskList tasks={tasks} />
    </div>

    <div className="lingvo-sidebar__footer">
      <Button className="lingvo-button-basic-black lingvo-sidebar__bottom-close" onClick={toggle}>
        {getTranslation("Close")}
      </Button>
    </div>
  </Sidebar>
);

TasksSidebar.propTypes = {
  visible: PropTypes.bool.isRequired,
  tasks: PropTypes.array.isRequired
};

function mapStateToProps(state) {
  return state.task;
}

export default connect(mapStateToProps, { toggle: toggleTasks, remove: removeTask })(TasksSidebar);
