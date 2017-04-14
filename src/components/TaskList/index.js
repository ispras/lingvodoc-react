import React from 'react';
import PropTypes from 'prop-types';
import { branch, renderComponent } from 'recompose';
import { List, Progress } from 'semantic-ui-react';

const Empty = () =>
  <h3>No background tasks</h3>;

const enhance = branch(
  ({ tasks }) => tasks.length === 0,
  renderComponent(Empty)
);

function Task(props) {
  const {
    progress,
    result_link,
    status,
    task_details,
    task_family,
    current_stage,
    total_stages,
    user_id,
  } = props;

  return (
    <List.Content>
      <List.Header>{task_family}</List.Header>
      <List.Description>
        {task_details}
        <Progress value={current_stage} total={total_stages} autoSuccess progress="ratio" />
      </List.Description>
    </List.Content>
  );
}

const TaskList = enhance(({ tasks }) =>
  <List divided relaxed>
    {
      tasks.map(task =>
        <List.Item key={task.id}>
          <Task {...task} />
        </List.Item>
      )
    }
  </List>
);

TaskList.propTypes = {
  tasks: PropTypes.array.isRequired,
};

export default TaskList;
