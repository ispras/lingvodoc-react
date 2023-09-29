import React, { useContext } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { connect } from "react-redux";
import { Button, Checkbox, Container, Icon, List, Message, Modal, Table } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { withApollo } from "@apollo/client/react/hoc";
import { de, enGB, fi, fr, ru } from "date-fns/locale";
import { upperFirst } from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import locale from "api/locale";
import { closeStatistics } from "ducks/statistics";
import TranslationContext from "Layout/TranslationContext";

registerLocale("en", enGB);
registerLocale("ru", ru);
registerLocale("de", de);
registerLocale("fi", fi);
registerLocale("fr", fr);

import "react-datepicker/dist/react-datepicker.css";
import "./style.scss";

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

const languageStatisticsQuery = gql`
  query statisticsLanguage($id: LingvodocID!, $start: Int!, $end: Int!, $dictionaries: Boolean, $corpora: Boolean) {
    language(id: $id) {
      id
      statistic(starting_time: $start, ending_time: $end, dictionaries: $dictionaries, corpora: $corpora)
    }
  }
`;

function sortTotalLast(keys) {
  /* Total goes after everything except 'unaccepted', and 'unaccepted' goes after total,
   * because it does not count towards it. */
  const tail_list = [];

  if (keys.indexOf("total") >= 0) {
    tail_list.push("total");
  }

  if (keys.indexOf("unaccepted") >= 0) {
    tail_list.push("unaccepted");
  }

  const key_list = keys.filter(k => k !== "total" && k !== "unaccepted").sort();

  key_list.push(...tail_list);

  return key_list;
}

function entitiesDictionaryTable(block) {
  const keys = sortTotalLast(Object.keys(block));
  return keys.flatMap(key => {
    let blockTitle1Included = false;
    const sb = block[key];
    const keys2 = sortTotalLast(Object.keys(sb));
    return keys2.flatMap(key2 => {
      let blockTitle2Included = false;
      const sb2 = sb[key2];
      const keys3 = sortTotalLast(Object.keys(sb2));
      return keys3.map(key3 => {
        const sb3 = sb2[key3];
        const row = [!blockTitle1Included ? key : "", !blockTitle2Included ? key2 : "", key3, sb3.total];
        blockTitle1Included = true;
        blockTitle2Included = true;
        return row;
      });
    });
  });
}

function entitiesPerspectiveTable(block) {
  const keys = sortTotalLast(Object.keys(block));
  return keys.flatMap(key => {
    let blockTitleIncluded = false;
    const sb = block[key];
    const keys2 = sortTotalLast(Object.keys(sb));
    return keys2.map(key2 => {
      const sb2 = sb[key2];
      const row = [!blockTitleIncluded ? key : "", key2, sb2.total];
      blockTitleIncluded = true;
      return row;
    });
  });
}

function entriesDictionaryTable(block) {
  const keys = sortTotalLast(Object.keys(block));
  return keys.map(key => {
    const sb = block[key];
    const row = [key, sb.total];
    return row;
  });
}

const DictionaryLexicalEntries = ({ entries }) => {
  const tableData = entriesDictionaryTable(entries);

  const literal_str_set = ["total", "published", "unpublished", "unaccepted"];

  const getTranslation = useContext(TranslationContext);

  return (
    <Table celled structured className="lingvo-stat-table">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>{getTranslation("Amount of Lexical and Paradigmatic entries")}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation("Result")}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {tableData.map((row, i) => (
          <Table.Row key={i}>
            {row.map((cell, j) => (
              <Table.Cell key={j}>
                {literal_str_set.includes(cell) ? upperFirst(getTranslation(cell)) : cell}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

DictionaryLexicalEntries.propTypes = {
  entries: PropTypes.object.isRequired
};

const PerspectiveLexicalEntries = ({ entries }) => {
  const getTranslation = useContext(TranslationContext);
  return (
    <Table celled structured className="lingvo-stat-table">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>{getTranslation("Result")}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row>
          <Table.Cell>{entries.total}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
};

PerspectiveLexicalEntries.propTypes = {
  entries: PropTypes.object.isRequired
};

const DictionaryEntities = ({ entities }) => {
  const tableData = entitiesDictionaryTable(entities);

  const literal_str_set = ["total", "published", "unpublished", "unaccepted"];

  const getTranslation = useContext(TranslationContext);

  return (
    <Table celled structured className="lingvo-stat-table">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>{getTranslation("Amount of Lexical and Paradigmatic entries")}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation("Entity status")}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation("Entity type")}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation("Result")}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {tableData.map((row, i) => (
          <Table.Row key={i}>
            {row.map((cell, j) => (
              <Table.Cell key={j}>
                {literal_str_set.includes(cell) ? upperFirst(getTranslation(cell)) : cell}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

DictionaryEntities.propTypes = {
  entities: PropTypes.object.isRequired
};

const PerspectiveEntities = ({ entities }) => {
  const tableData = entitiesPerspectiveTable(entities);

  const literal_str_set = ["total", "published", "unpublished", "unaccepted"];

  const getTranslation = useContext(TranslationContext);

  return (
    <Table celled structured className="lingvo-stat-table">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>{getTranslation("Entity status")}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation("Entity type")}</Table.HeaderCell>
          <Table.HeaderCell>{getTranslation("Result")}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {tableData.map((row, i) => (
          <Table.Row key={i}>
            {row.map((cell, j) => (
              <Table.Cell key={j}>
                {literal_str_set.includes(cell) ? upperFirst(getTranslation(cell)) : cell}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

PerspectiveEntities.propTypes = {
  entities: PropTypes.object.isRequired
};

const Statistics = ({ statistics, mode }) => {
  const as_dictionary = mode === "dictionary" || mode === "language";
  const LexicalEntriesComponent = as_dictionary ? DictionaryLexicalEntries : PerspectiveLexicalEntries;
  const EntitiesComponent = as_dictionary ? DictionaryEntities : PerspectiveEntities;

  const getTranslation = useContext(TranslationContext);

  return (
    <div>
      {statistics.map(
        user =>
          (user.lexical_entries || user.entities) && (
            <div key={user.name}>
              <h2 className="lingvo-stat-username">{user.name === null ? getTranslation("total") : user.name}</h2>
              {user.lexical_entries && (
                <div>
                  <h3 className="lingvo-stat-title-table">{getTranslation("Lexical entries")}</h3>
                  <LexicalEntriesComponent entries={user.lexical_entries} />
                </div>
              )}
              {user.entities && (
                <div>
                  <h3 className="lingvo-stat-title-table">{getTranslation("Entities")}</h3>
                  <EntitiesComponent entities={user.entities} />
                </div>
              )}
            </div>
          )
      )}
    </div>
  );
};

Statistics.propTypes = {
  statistics: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired
};

class StatisticsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment("2012", "YYYY"),
      endDate: moment(),
      languageDictionaries: true,
      languageCorpora: true,
      loading: false,
      error: false,
      statistics: [],
      emptyStatistics: false,
      showStatistics: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.getStatistics = this.getStatistics.bind(this);
  }

  getStatistics() {
    const { client, id, mode } = this.props;
    const { startDate, endDate, languageDictionaries, languageCorpora } = this.state;
    const query =
      mode === "language"
        ? languageStatisticsQuery
        : mode === "dictionary"
        ? dictionaryStatisticsQuery
        : perspectiveStatisticsQuery;

    this.setState({ loading: true });

    client
      .query({
        query,
        variables: {
          id,
          start: startDate.unix(),
          end: endDate.unix(),
          dictionaries: languageDictionaries,
          corpora: languageCorpora
        }
      })
      .then(
        ({ data }) => {
          const { perspective } = data;
          const { dictionary } = data;
          const { language } = data;

          if (perspective) {
            if (!perspective.statistic.length) {
              this.setState({
                loading: false,
                emptyStatistics: true,
                showStatistics: true
              });
            } else {
              this.setState({
                loading: false,
                statistics: perspective.statistic,
                emptyStatistics: false,
                showStatistics: true
              });
            }
          }

          if (dictionary) {
            if (!dictionary.statistic.length) {
              this.setState({
                loading: false,
                emptyStatistics: true,
                showStatistics: true
              });
            } else {
              this.setState({
                loading: false,
                statistics: dictionary.statistic,
                emptyStatistics: false,
                showStatistics: true
              });
            }
          }

          if (language) {
            if (!language.statistic.length) {
              this.setState({
                loading: false,
                emptyStatistics: true,
                showStatistics: true
              });
            } else {
              this.setState({
                loading: false,
                statistics: language.statistic,
                emptyStatistics: false,
                showStatistics: true
              });
            }
          }
        },
        error_data => {
          this.setState({ loading: false, error: true });
        }
      );
  }

  handleChange(date, mode) {
    const u = {};
    u[mode] = date;
    u.showStatistics = false;
    this.setState(u);
  }

  render() {
    const { mode, title, locales } = this.props;
    const { startDate, endDate, languageDictionaries, languageCorpora, loading, error, statistics } = this.state;

    const currentLocaleId = locale.get();
    const localesDatePicker = [];

    locales.forEach(item => {
      if (item.id <= 5) {
        localesDatePicker.push({
          shortcut: item.shortcut,
          id: item.id
        });
      } else {
        localesDatePicker.push({
          shortcut: "en",
          id: item.id
        });
      }
    });

    return (
      <Modal closeIcon onClose={this.props.closeStatistics} dimmer open size="fullscreen" className="lingvo-modal2">
        <Modal.Header>{title}</Modal.Header>
        <Modal.Content>
          <div className="lingvo-statistics">
            <div className="lingvo-statistics-block">
              {this.context("From")}
              <DatePicker
                selected={startDate.toDate()}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                onChange={d => this.handleChange(moment(d), "startDate")}
                dateFormat="dd.MM.yyyy HH:mm"
                locale={localesDatePicker.find(item => item.id === currentLocaleId)["shortcut"] || "en"}
              />
            </div>
            <div className="lingvo-statistics-block">
              {this.context("To")}
              <DatePicker
                selected={endDate.toDate()}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                onChange={d => this.handleChange(moment(d), "endDate")}
                dateFormat="dd.MM.yyyy HH:mm"
                locale={localesDatePicker.find(item => item.id === currentLocaleId)["shortcut"] || "en"}
              />
            </div>
            {mode === "language" && (
              <div className="lingvo-statistics-block">
                <List>
                  <List.Item>
                    <Checkbox
                      label={this.context("Dictionaries")}
                      checked={languageDictionaries}
                      onChange={(e, { checked }) => this.setState({ languageDictionaries: checked })}
                    />
                  </List.Item>
                  <List.Item>
                    <Checkbox
                      label={this.context("Corpora")}
                      checked={languageCorpora}
                      onChange={(e, { checked }) => this.setState({ languageCorpora: checked })}
                    />
                  </List.Item>
                </List>
              </div>
            )}
          </div>
          <Container textAlign="center">
            <Button
              content={
                loading ? (
                  <span>
                    {this.context("Loading")}... <Icon name="spinner" loading />
                  </span>
                ) : (
                  this.context("Show statistics")
                )
              }
              onClick={this.getStatistics}
              className="lingvo-button-violet"
              disabled={loading || error || this.state.showStatistics}
            />
          </Container>
          <div className="lingvo-statistics-view">
            {error ? (
              <div style={{ margin: "auto", width: "fit-content" }}>
                <Message negative compact>
                  <Message.Header>{this.context("Statistics error")}</Message.Header>
                  <div style={{ marginTop: "0.25em" }}>
                    {this.context(
                      "Try closing the dialog and opening it again; if the error persists, please contact administrators."
                    )}
                  </div>
                </Message>
              </div>
            ) : this.state.emptyStatistics ? (
              <div className="lingvo-message lingvo-message_warning" style={{ marginBottom: "6px" }}>
                {this.context("No statistics for the selected period")}
              </div>
            ) : (
              <Statistics statistics={statistics} mode={mode} />
            )}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button
            content={this.context("Close")}
            onClick={this.props.closeStatistics}
            className="lingvo-button-basic-black"
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

StatisticsModal.contextType = TranslationContext;

StatisticsModal.propTypes = {
  id: PropTypes.arrayOf(PropTypes.number).isRequired,
  mode: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  locales: PropTypes.array.isRequired,
  closeStatistics: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired
};

StatisticsModal.defaultProps = {};

export default compose(
  connect(
    state => ({
      ...state.locale,
      ...state.statistics
    }),
    dispatch => bindActionCreators({ closeStatistics }, dispatch)
  ),
  branch(({ visible }) => !visible, renderNothing),
  withApollo
)(StatisticsModal);
