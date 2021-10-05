import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Sidebar, Icon } from 'semantic-ui-react';

import TaskList from 'components/TaskList';
import { toggleTasks } from 'ducks/task';

const Wrapper = styled.div`
  padding: 20px;
  padding-top: 85px;
  min-height: 100vh;
  background: #ccc;
  opacity: 0.9;
`;

const TasksSidebar = ({ visible, tasks, toggle }) =>
  <Sidebar
    animation="overlay"
    direction="right"
    width="wide"
    visible={visible}
    as={Wrapper}
  >
    <Icon name="angle double right" size="big" onClick={toggle} style={{ marginLeft: '-8px', marginBottom: '10px', cursor: 'pointer' }}/>
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
