import React, { useContext } from "react";
import { connect } from "react-redux";
import { Button, Icon, Sidebar } from "semantic-ui-react";
import PropTypes from "prop-types";
import styled from "styled-components";

import { getTasks } from "api";
import TaskList from "components/TaskList";
import config from "config";
import { err } from "ducks/snackbar";
import { removeTask, setTasks, toggleTasks } from "ducks/task";
import TranslationContext from "Layout/TranslationContext";

const Wrapper = styled.div`
  padding: 16px;
  padding-top: 106px;
  min-height: 100vh;
`;

const onClearTasks = (tasks, remove) => {
  tasks.forEach(task => {
    if (task.current_stage == task.total_stages && task.progress === 100) {
      remove(task.id);
    }
  });
};

const TasksSidebar = ({ visible, tasks, toggle, remove, set, err }) => {
  const getTranslation = useContext(TranslationContext);

  const refresh = async () => {
    const response = await getTasks();
    if (response.data) {
      set(response.data);
    } else {
      err("Could not get tasks");
    }
  };

  return (
    <Sidebar
      animation="overlay"
      direction="right"
      width="wide"
      visible={visible}
      as={Wrapper}
      className="lingvo-sidebar"
    >
      <div className="lingvo-sidebar__content">
        {config.dev && (
          <Button className="lingvo-button-refresh lingvo-sidebar__refresh" onClick={refresh} icon>
            <Icon name="refresh" />
          </Button>
        )}

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
};

TasksSidebar.propTypes = {
  visible: PropTypes.bool.isRequired,
  tasks: PropTypes.array.isRequired
};

function mapStateToProps(state) {
  return state.task;
}

export default connect(mapStateToProps, { toggle: toggleTasks, remove: removeTask, set: setTasks, err })(TasksSidebar);
