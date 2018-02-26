import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing } from 'recompose';
import { graphql } from 'react-apollo';
import { Segment, Checkbox, Button, Modal, Tab } from 'semantic-ui-react';
import { closeStatistics } from 'ducks/statistics';
import { bindActionCreators } from 'redux';
import { isEqual } from 'lodash';
import { connect } from 'react-redux';
import styled from 'styled-components';

const StatisticsModal = (props) => {
  return (
    <Modal dimmer open size="fullscreen">
      <Modal.Content>
      </Modal.Content>
      <Modal.Actions>
        <Button icon="minus" content="Cancel" onClick={props.closeStatistics} />
      </Modal.Actions>
    </Modal>
  );
};

StatisticsModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  closeStatistics: PropTypes.func.isRequired,
};

StatisticsModal.defaultProps = {};

export default compose(
  connect(state => state.statistics, dispatch => bindActionCreators({ closeStatistics }, dispatch)),
  branch(({ visible }) => !visible, renderNothing),
)(StatisticsModal);
