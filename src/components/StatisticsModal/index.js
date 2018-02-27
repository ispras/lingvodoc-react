import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing, pure } from 'recompose';
import { gql, graphql, withApollo } from 'react-apollo';
import { Segment, Checkbox, Container, Button, Modal, Tab } from 'semantic-ui-react';
import { closeStatistics } from 'ducks/statistics';
import { bindActionCreators } from 'redux';
import { isEqual } from 'lodash';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import styled from 'styled-components';

import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';

const perspectiveStatisticsQuery = gql`
  query statisticsPerspective($id: LingvodocID!, $start: Int!, $end: Int!) {
    perspective(id: $id) {
      statistic(starting_time: $start, ending_time: $end)
    }
  }
`;

const dictionaryStatisticsQuery = gql`
  query statisticsDictionary($id: LingvodocID!, $start: Int!, $end: Int!) {
    dictionary(id: $id) {
      statistic(starting_time: $start, ending_time: $end)
    }
  }
`;

class StatisticsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().subtract(5, 'years'),
      endDate: moment(),
    };
    this.handleChange = this.handleChange.bind(this);
    this.getStatistics = this.getStatistics.bind(this);
  }

  async getStatistics() {
    const { client, id, mode } = this.props;
    const { startDate, endDate } = this.state;
    const query = mode === 'dictionary' ? dictionaryStatisticsQuery : perspectiveStatisticsQuery;
    const { data } = await client.query({
      query,
      variables: {
        id,
        start: startDate.unix(),
        end: endDate.unix(),
      },
    });
    console.log(data);
  }

  handleChange(date, mode) {
    const u = {};
    u[mode] = date;
    this.setState(u);
  }

  render() {
    const { startDate, endDate } = this.state;
    return (
      <Modal dimmer open size="fullscreen">
        <Modal.Content>
          <div>
            From:
            <DatePicker
              selected={startDate}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              onChange={d => this.handleChange(d, 'startDate')}
              dateFormat="YYYY.MM.DD HH:mm"
            />
            To:
            <DatePicker
              selected={endDate}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              onChange={d => this.handleChange(d, 'endDate')}
              dateFormat="YYYY.MM.DD HH:mm"
            />
          </div>
          <Container textAlign="center">
            <Button basic content="Show statistics" onClick={this.getStatistics} />
          </Container>
        </Modal.Content>
        <Modal.Actions>
          <Button icon="minus" content="Cancel" onClick={this.props.closeStatistics} />
        </Modal.Actions>
      </Modal>
    );
  }
}

StatisticsModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  closeStatistics: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
};

StatisticsModal.defaultProps = {};

export default compose(
  connect(state => state.statistics, dispatch => bindActionCreators({ closeStatistics }, dispatch)),
  branch(({ visible }) => !visible, renderNothing),
  withApollo
)(StatisticsModal);
