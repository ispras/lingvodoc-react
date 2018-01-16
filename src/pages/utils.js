import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { lifecycle, shouldUpdate, compose } from 'recompose';

import { run, stop } from 'ducks/saga';

function generateId() {
  return Math.random()
    .toString(36)
    .substr(2, 12);
}

const mountUnmountCycle = lifecycle({
  componentDidMount() {
    this.props.onMount(this.props);
  },

  componentWillUnmount() {
    this.props.onUnmount(this.props);
  },
});

const mapActionsToProps = ({
  actions = {}, init, teardown, saga,
}) => (dispatch) => {
  const sagaId = generateId();
  return {
    ...bindActionCreators(actions, dispatch),
    onMount(props) {
      dispatch(run({ saga, sagaId }));
      if (init) dispatch(init(props));
    },
    onUnmount(props) {
      if (teardown) dispatch(teardown(props));
      dispatch(stop(sagaId));
    },
  };
};

export default ({
  props, actions, saga, updateWhen, init, teardown,
}) =>
  compose(
    connect(props, mapActionsToProps({
      actions, init, teardown, saga,
    })),
    mountUnmountCycle,
    shouldUpdate(updateWhen)
  );
