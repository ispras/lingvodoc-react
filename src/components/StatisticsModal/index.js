import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing } from 'recompose';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Header, Container, Table, Button, Modal } from 'semantic-ui-react';
import { closeStatistics } from 'ducks/statistics';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { getTranslation } from 'api/i18n';

import 'react-datepicker/dist/react-datepicker.css';
import './style.scss';

/*
 * NOTE:
 *
 * We need an 'id' field in perspective / dictionary statistics query because otherwise these queries do not
 * work when Statistics modal is called from the perspective view (PerspectivePath component), GraphQL
 * Apollo's client.query() terminates with error "Error writing result to store for query...", see
 * https://stackoverflow.com/questions/44403930/error-network-error-error-writing-result-to-store-for-query-apollo-client
 * for this solution.
 */

const perspectiveStatisticsQuery = gql`
  query statisticsPerspective($id: LingvodocID!, $start: Int!, $end: Int!) {
    perspective(id: $id) {
      id
      statistic(starting_time: $start, ending_time: $end)
    }
  }
`;

const dictionaryStatisticsQuery = gql`
  query statisticsDictionary($id: LingvodocID!, $start: Int!, $end: Int!) {
    dictionary(id: $id) {
      id
      statistic(starting_time: $start, ending_time: $end)
    }
  }
`;

function sortTotalLast(keys)
{
  /* Total goes after everything except 'unaccepted', and 'unaccepted' goes after total,
   * because it does not count towards it. */

  const tail_list = [];

  if (keys.indexOf('total') >= 0)
    tail_list.push('total');

  if (keys.indexOf('unaccepted') >= 0)
    tail_list.push('unaccepted');

  const key_list =    
    keys.filter(k => k !== 'total' && k !== 'unaccepted').sort();

  key_list.push(...tail_list);

  return key_list;
}

function entitiesDictionaryTable(block) {
  const keys = sortTotalLast(Object.keys(block));
  return keys.flatMap((key) => {
    let blockTitle1Included = false;
    const sb = block[key];
    const keys2 = sortTotalLast(Object.keys(sb));
    return keys2.flatMap((key2) => {
      let blockTitle2Included = false;
      const sb2 = sb[key2];
      const keys3 = sortTotalLast(Object.keys(sb2));
      return keys3.map((key3) => {
        const sb3 = sb2[key3];
        const row = [
          !blockTitle1Included ? key : '',
          !blockTitle2Included ? key2 : '',
          key3,
          sb3.desktop,
          sb3.web,
          sb3.total,
        ];
        blockTitle1Included = true;
        blockTitle2Included = true;
        return row;
      });
    });
  });
}

function entitiesPerspectiveTable(block) {
  const keys = sortTotalLast(Object.keys(block));
  return keys.flatMap((key) => {
    let blockTitleIncluded = false;
    const sb = block[key];
    const keys2 = sortTotalLast(Object.keys(sb));
    return keys2.map((key2) => {
      const sb2 = sb[key2];
      const row = [!blockTitleIncluded ? key : '', key2, sb2.desktop, sb2.web, sb2.total];
      blockTitleIncluded = true;
      return row;
    });
  });
}

function entriesDictionaryTable(block) {
  const keys = sortTotalLast(Object.keys(block));
  return keys.map((key) => {
    const sb = block[key];
    const row = [key, sb.desktop, sb.web, sb.total];
    return row;
  });
}

const DictionaryLexicalEntries = ({ entries }) => {
  const tableData = entriesDictionaryTable(entries);
  return (
    <Table celled structured textAlign="center">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell rowSpan="2">{getTranslation('Perspective state')}</Table.HeaderCell>
          <Table.HeaderCell colSpan="3">{getTranslation('Client type')}</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell>{getTranslation('desktop')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('web')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('total')}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {tableData.map((row, i) =>
          <Table.Row key={i}>
            {row.map((cell, j) =>
              <Table.Cell key={j}>{cell}</Table.Cell>)}
          </Table.Row>)}
      </Table.Body>
    </Table>
  );
};

DictionaryLexicalEntries.propTypes = {
  entries: PropTypes.object.isRequired,
};

const PerspectiveLexicalEntries = ({ entries }) => {
  return (
    <Table celled structured textAlign="center">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan="3">{getTranslation('Client type')}</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell>{getTranslation('desktop')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('web')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('total')}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row>
          <Table.Cell>{entries.desktop}</Table.Cell>
          <Table.Cell>{entries.web}</Table.Cell>
          <Table.Cell>{entries.total}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
};

PerspectiveLexicalEntries.propTypes = {
  entries: PropTypes.object.isRequired,
};

const DictionaryEntities = ({ entities }) => {
  const tableData = entitiesDictionaryTable(entities);

  return (
    <Table celled structured textAlign="center">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell rowSpan="2">{getTranslation('Perspective state')}</Table.HeaderCell>
          <Table.HeaderCell rowSpan="2">{getTranslation('Entity status')}</Table.HeaderCell>
          <Table.HeaderCell rowSpan="2">{getTranslation('Entity type')}</Table.HeaderCell>
          <Table.HeaderCell colSpan="3">{getTranslation('Client type')}</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell>{getTranslation('desktop')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('web')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('total')}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {tableData.map((row, i) =>
          <Table.Row key={i}>
            {row.map((cell, j) =>
              <Table.Cell key={j}>{cell}</Table.Cell>)}
          </Table.Row>)}
      </Table.Body>
    </Table>
  );
};

DictionaryEntities.propTypes = {
  entities: PropTypes.object.isRequired,
};

const PerspectiveEntities = ({ entities }) => {
  const tableData = entitiesPerspectiveTable(entities);

  return (
    <Table celled structured textAlign="center">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell rowSpan="2">{getTranslation('Entity status')}</Table.HeaderCell>
          <Table.HeaderCell rowSpan="2">{getTranslation('Entity type')}</Table.HeaderCell>
          <Table.HeaderCell colSpan="3">{getTranslation('Client type')}</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell>{getTranslation('desktop')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('web')}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation('total')}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {tableData.map((row, i) =>
          <Table.Row key={i}>
            {row.map((cell, j) =>
              <Table.Cell key={j}>{cell}</Table.Cell>)}
          </Table.Row>)}
      </Table.Body>
    </Table>
  );
};

PerspectiveEntities.propTypes = {
  entities: PropTypes.object.isRequired,
};

const Statistics = ({ statistics, mode }) => {
  const LexicalEntriesComponent = 
    mode === 'dictionary' ? DictionaryLexicalEntries : PerspectiveLexicalEntries;
  const EntitiesComponent = 
    mode === 'dictionary' ? DictionaryEntities : PerspectiveEntities;
  return (
    <div>
      {statistics.map(user => (
        (user.lexical_entries || user.entities) && (
          <div key={user.name}>
            <Header>{user.name}</Header>
            {user.lexical_entries && (
              <div>
                <Header size="small" content={getTranslation("Lexical entries")} />
                <LexicalEntriesComponent entries={user.lexical_entries} />
              </div>
            )}
            {user.entities && (
              <div>
                <Header size="small" content={getTranslation("Entities")} />
                <EntitiesComponent entities={user.entities} />
              </div>
            )}
          </div>
        )
      ))}
    </div>
  );
};

Statistics.propTypes = {
  statistics: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
};

class StatisticsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().subtract(5, 'years'),
      endDate: moment(),
      statistics: [],
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

    const { perspective } = data;
    const { dictionary } = data;

    if (perspective) {
      this.setState({
        statistics: perspective.statistic,
      });
    }

    if (dictionary) {
      this.setState({
        statistics: dictionary.statistic,
      });
    }
  }

  handleChange(date, mode) {
    const u = {};
    u[mode] = date;
    this.setState(u);
  }

  render() {
    const { mode } = this.props;
    const { startDate, endDate, statistics } = this.state;
    return (
      <Modal dimmer open size="fullscreen">
        <Modal.Content>
          <div>
            {getTranslation('From:')}
            <DatePicker
              selected={startDate}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              onChange={d => this.handleChange(d, 'startDate')}
              dateFormat="YYYY.MM.DD HH:mm"
            />
            {getTranslation('To:')}
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
            <Button basic content={getTranslation("Show statistics")} onClick={this.getStatistics} />
          </Container>

          <Container>
            <Statistics statistics={statistics} mode={mode} />
          </Container>
        </Modal.Content>
        <Modal.Actions>
          <Button icon="minus" content={getTranslation("Cancel")} onClick={this.props.closeStatistics} />
        </Modal.Actions>
      </Modal>
    );
  }
}

StatisticsModal.propTypes = {
  id: PropTypes.arrayOf(PropTypes.number).isRequired,
  mode: PropTypes.string.isRequired,
  closeStatistics: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
};

StatisticsModal.defaultProps = {};

export default compose(
  connect(state => state.statistics, dispatch => bindActionCreators({ closeStatistics }, dispatch)),
  branch(({ visible }) => !visible, renderNothing),
  withApollo
)(StatisticsModal);
