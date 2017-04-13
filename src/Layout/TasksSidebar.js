import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Sidebar } from 'semantic-ui-react';

import TaskList from 'components/TaskList';

const Wrapper = styled.div`
  padding: 20px;
  padding-top: 5em;
  min-height: 100vh;
  background: #ccc;
  opacity: 0.9;
`;

const TasksSidebar = ({ visible, tasks }) =>
  <Sidebar
    animation="overlay"
    direction="right"
    width="wide"
    visible={visible}
  >
    <Wrapper>
      <TaskList tasks={tasks} />
    </Wrapper>
  </Sidebar>;

TasksSidebar.propTypes = {
  visible: PropTypes.bool.isRequired,
  tasks: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return state.task;
}

export default connect(mapStateToProps)(TasksSidebar);
