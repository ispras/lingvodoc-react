import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button, Sidebar } from 'semantic-ui-react';

import TaskList from 'components/TaskList';
import { toggleTasks } from 'ducks/task';
import { getTranslation } from 'api/i18n';

const Wrapper = styled.div`
  padding: 16px;
  padding-top: 106px;
  min-height: 100vh;
`;

const TasksSidebar = ({ visible, tasks, toggle }) =>
  <Sidebar
    animation="overlay"
    direction="right"
    width="wide"
    visible={visible}
    as={Wrapper}
    className="lingvo-sidebar"
  >
    <div className="lingvo-sidebar__content">
      <Button
        className="lingvo-button-close lingvo-sidebar__close"
        onClick={toggle}
        icon
      >
        <i className="lingvo-icon-close" />
      </Button>
      
      <TaskList tasks={tasks} />
    </div>

    <div className="lingvo-sidebar__footer">
      <Button
        className="lingvo-button-basic-black lingvo-sidebar__bottom-close"
        onClick={toggle}
      >
        {getTranslation('Close')}
      </Button>
    </div>

  </Sidebar>;

TasksSidebar.propTypes = {
  visible: PropTypes.bool.isRequired,
  tasks: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return state.task;
}

export default connect(mapStateToProps, { toggle: toggleTasks } )(TasksSidebar);
