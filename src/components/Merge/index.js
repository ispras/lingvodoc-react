import React from 'react';
import PropTypes from 'prop-types';
import { compose, onlyUpdateForKeys, branch, renderNothing, pure } from 'recompose';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { isEqual, find, take, drop, flow, groupBy, sortBy, reverse } from 'lodash';
import { Table, Dimmer, Header, Icon, Button } from 'semantic-ui-react';

import Settings from './Settings';

const Merge = props => (
  <div>
    <Settings id={props.id} />
  </div>
);

Merge.propTypes = {
  id: PropTypes.array.isRequired,
};

export default Merge;
