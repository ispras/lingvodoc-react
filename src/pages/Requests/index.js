import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, branch, renderComponent, renderNothing, withProps, pure } from 'recompose';
import { graphql } from 'react-apollo';
import Immutable, { fromJS } from 'immutable';
import { Divider, Message, Button, Step, Header } from 'semantic-ui-react';

import Requests from 'components/Grants/Requests';

class UserRequests extends React.Component {
  render() {
    return <Requests />;
  }
}

UserRequests.propTypes = {};

export default UserRequests;
