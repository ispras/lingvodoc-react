import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button, Sidebar } from 'semantic-ui-react';

import TaskList from 'components/TaskList';
import { toggleTasks } from 'ducks/task';

const Wrapper = styled.div`
  padding: 16px;
  padding-top: 96px;
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

    <Button
      className="lingvo-button-lite-violet"
      onClick={toggle}
      icon
      style={{ marginBottom: '4px' }}
    >
      <i className="lingvo-icon-close" />
    </Button>
    
    <TaskList tasks={tasks} />
  </Sidebar>;

TasksSidebar.propTypes = {
  visible: PropTypes.bool.isRequired,
  tasks: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return state.task;
}

export default connect(mapStateToProps, { toggle: toggleTasks } )(TasksSidebar);
