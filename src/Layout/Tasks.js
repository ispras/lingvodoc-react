import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import { Menu, Label, Icon } from 'semantic-ui-react';

import { toggleTasks } from 'ducks/task';
import { getTranslation } from 'api/i18n';

const Tasks = pure(({ count, loading, toggle }) =>
  <Menu.Item as="a" onClick={toggle}>
    {getTranslation('Tasks')} { loading ? <Icon loading name="spinner" /> : <Label color="blue">{count}</Label> }
  </Menu.Item>
);

Tasks.propTypes = {
  count: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

function mapStateToProps({ task }) {
  return {
    loading: task.loading,
    count: task.tasks.length,
  };
}

export default connect(
  mapStateToProps,
  { toggle: toggleTasks }
)(Tasks);
