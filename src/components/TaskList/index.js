import React from 'react';
import PropTypes from 'prop-types';
import { branch, renderComponent } from 'recompose';
import { List } from 'semantic-ui-react';

const Empty = () =>
  <h3>No background tasks</h3>;

const enhance = branch(
  ({ tasks }) => tasks.length === 0,
  renderComponent(Empty)
);

const TaskList = enhance(({ tasks }) =>
  <List divided relaxed>
    {
      tasks.map(task =>
        <List.Item key={task.id}>
          <List.Icon name="github" size="large" verticalAlign="middle" />
          <List.Content>
            <List.Header as="a">Semantic-Org/Semantic-UI</List.Header>
            <List.Description as="a">Updated 10 mins ago</List.Description>
          </List.Content>
        </List.Item>
      )
    }
  </List>
);

TaskList.propTypes = {
  tasks: PropTypes.array.isRequired,
};

export default TaskList;
