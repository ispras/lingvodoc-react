import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container } from 'semantic-ui-react';

import { requestPerspective } from 'ducks/data';

class Perspective extends React.Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.object.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.props.dispatch(requestPerspective(this.props.match.params));
  }

  render() {
    return (
      <Container fluid>
      </Container>
    );
  }
}

export default connect(
  state => state.data
)(Perspective);
