import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, branch, renderComponent, renderNothing, withProps, pure } from 'recompose';
import { graphql } from 'react-apollo';
import Immutable, { fromJS } from 'immutable';
import { Divider, Message, Button, Step, Header } from 'semantic-ui-react';

import GrantsList from 'components/Grants/GrantsList';

class Grants extends React.Component {
  render() {
    return <GrantsList />;
  }
}

Grants.propTypes = {};

export default Grants;
