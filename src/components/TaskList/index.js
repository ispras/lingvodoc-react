import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { branch, renderComponent, lifecycle, compose } from 'recompose';
import { List, Progress, Button, Segment, Header } from 'semantic-ui-react';

import styled from 'styled-components';

import { removeTask } from 'ducks/task';
import { run, stop } from 'ducks/saga';
import saga from './saga';
import { getTranslation } from 'api/i18n';

import imageEmpty from '../../images/no_data.svg';

const OrWrapper = styled(Segment)`
  .delete-task-button {
    box-shadow: none !important;
    position: absolute !important;
    padding: 10px !important;
    margin: 0;
    right: 0;
    top: 0;
  }
`;
const Empty = () => (
  <div className="lingvo-sidebar__empty">
    <h3>{getTranslation('No background tasks')}</h3>
    <img src={imageEmpty} className="lingvo-sidebar__empty-img" />
  </div>
);

const enhance = branch(({ tasks }) => tasks.length === 0, renderComponent(Empty));

function Task(props) {
  const {
    id,
    progress,
    status,
    task_details,
    task_family,
    current_stage,
    total_stages,
    result_link_list,
    removeTask: remove,
  } = props;

  const links = result_link_list.map(link => (
    <div key={link} className="lingvo-tasks-link">
      <a href={link} key={link}>
        {link}
      </a>
    </div>
  ));

  return (
    <List.Content>
      <OrWrapper>
        <Header size="small">{task_family}</Header>
        <Button compact basic icon="delete" className="delete-task-button" onClick={() => remove(id)} />

        {task_details}
        <Progress label={`(${current_stage}/${total_stages}) ${status}`} percent={progress} progress="percent" />
        {links}
      </OrWrapper>

      <List.Description />
    </List.Content>
  );
}

const Task1 = connect(null, dispatch => bindActionCreators({ removeTask }, dispatch))(Task);

const TaskList = enhance(({ tasks }) => (
  <List divided relaxed>
    {tasks.map(task => (
      <List.Item key={task.id}>
        <Task1 {...task} />
      </List.Item>
    ))}
  </List>
));

TaskList.propTypes = {
  tasks: PropTypes.array.isRequired,
};

function generateId() {
  return Math.random()
    .toString(36)
    .substr(2, 12);
}

const mapActionsToProps = () => (dispatch) => {
  const sagaId = generateId();
  return {
    onMount() {
      dispatch(run({ saga, sagaId }));
    },
    onUnmount() {
      dispatch(stop(sagaId));
    },
  };
};

export default compose(
  connect(null, mapActionsToProps),
  lifecycle({
    componentDidMount() {
      this.props.onMount();
    },

    componentWillUnmount() {
      this.props.onUnmount();
    },
  })
)(TaskList);
