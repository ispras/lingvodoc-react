import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing } from 'recompose';
import { graphql, gql, withApollo } from 'react-apollo';
import { Button, Checkbox, Divider, Input, List, Modal, Select } from 'semantic-ui-react';
import { closeModal } from 'ducks/phonology';
import { bindActionCreators } from 'redux';
import { isEqual, map } from 'lodash';
import { connect } from 'react-redux';
import { compositeIdToString } from 'utils/compositeId';
import { perspectiveColumnsQuery, phonologyTierListQuery, phonologySkipListQuery, createPhonologyMutation } from './graphql';

const DEFAULT_CHART_THRESHOLD = 8;

class PhonologyModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      vowelsMode: 'all',
      translationsMode: 'all',
      enabledGroup: false,
      chartThreshold: DEFAULT_CHART_THRESHOLD,
      tierList: [],
      loadedTiers: false,
      enabledTiers: false,
      tiers: [],
      loadedKeepJoin: false,
      keepList: [],
      enabledKeep: false,
      selectedKeepList: [],
      joinList: [],
      enabledJoin: false,
      selectedJoinList: [],
    };

    this.handleVowelsChange = this.handleVowelsChange.bind(this);
    this.handleTranslationsChange = this.handleTranslationsChange.bind(this);
    this.handleEnableTier = this.handleEnableTier.bind(this);
    this.handleSelectKeep = this.handleSelectKeep.bind(this);
    this.handleSelectJoin = this.handleSelectJoin.bind(this);
    this.handleCreate = this.handleCreate.bind(this);

    this.getTierList = this.getTierList.bind(this);
    this.getKeepJoinList = this.getKeepJoinList.bind(this);
  }

  handleVowelsChange(e, { value: vowelsMode }) {
    this.setState({ vowelsMode });
  }

  handleTranslationsChange(e, { value: translationsMode }) {
    this.setState({ translationsMode });
  }

  /* Loads list of perspective tiers, asynchronously. */
  async getTierList()
  {
    const { perspectiveId, client } = this.props;

    const { data } = await client.query({
      query: phonologyTierListQuery,
      variables: { perspectiveId },
    });

    if (data)
    {
      const { phonology_tier_list: { tier_count, total_count }} = data;

      /* Getting markup tiers with their occurence counts, sorting them in alphabetical order. */

      var tier_list = map(tier_count, (count, tier) => [tier, count]);

      tier_list.sort((a, b) =>
        {
          if (a[0].toLowerCase() < b[0].toLowerCase())
            return -1;
          if (a[0].toLowerCase() > b[0].toLowerCase())
            return 1;

          if (a[0] < b[0])
            return -1;
          if (a[0] > b[0])
            return 1;

          return 0;
        });

      this.setState({ loadedTiers: true, tierList: tier_list });
    }
  }

  handleTiersChange(enabled)
  {
    this.setState({ enabledTiers: enabled });

    if (!this.state.loadedTiers)
      this.getTierList();
  }

  handleEnableTier(tier, enable) {
    if (!enable) {
      this.setState({
        tiers: this.state.tiers.filter(t => t !== tier),
      });
    } else {
      this.setState({
        tiers: [tier, ...this.state.tiers],
      });
    }
  }

  /* Loads lists of skipped and adjacent markup characters, asynchronously. */
  async getKeepJoinList()
  {
    const { perspectiveId, client } = this.props;

    const { data } = await client.query({
      query: phonologySkipListQuery,
      variables: { perspectiveId },
    });

    if (data)
    {
      const { phonology_skip_list: { neighbour_list, skip_list }} = data;

      this.setState({
        loadedKeepJoin: true,
        keepList: skip_list,
        joinList: neighbour_list, });
    }
  }

  handleKeepChange(enabled)
  {
    this.setState({ enabledKeep: enabled });

    if (!this.state.loadedKeepJoin)
      this.getKeepJoinList();
  }

  handleJoinChange(enabled)
  {
    this.setState({ enabledJoin: enabled });

    if (!this.state.loadedKeepJoin)
      this.getKeepJoinList();
  }

  handleSelectKeep(ord, enable)
  {
    if (!enable) {
      this.setState({
        selectedKeepList: this.state.selectedKeepList.filter(t => t !== ord),
      });
    } else {
      this.setState({
        selectedKeepList: [ord, ...this.state.selectedKeepList],
      });
    }
  }

  handleSelectJoin(ord, enable)
  {
    if (!enable) {
      this.setState({
        selectedJoinList: this.state.selectedJoinList.filter(t => t !== ord),
      });
    } else {
      this.setState({
        selectedJoinList: [ord, ...this.state.selectedJoinList],
      });
    }
  }

  handleCreate() {
    const { perspectiveId, createPhonology } = this.props;
    createPhonology({
      variables: {
        perspectiveId,
        groupByDescription: this.state.enabledGroup,
        translationFieldId: this.state.selectedFieldId,
        firstTranslation: this.state.translationsMode === 'first',
        vowelSelection: this.state.vowelsMode === 'longest',
        tiers: this.state.tiers,
        chartThreshold: this.state.chartThreshold,
        keepList: this.state.selectedKeepList,
        joinList: this.state.selectedJoinList,
      },
    }).then(() => {
      window.logger.suc('Phonology is being created. Check out tasks for details.');
      this.props.closeModal();
    }, () => {
      window.logger.err('Failed to create phonology!');
    });
  }

  render() {
    const { data } = this.props;
    const { perspective: { columns }, all_fields: allFields, } = data;

    const textFields = allFields
      .filter(f => f.data_type === 'Text')
      .filter(f => !!columns.find(c => isEqual(f.id, c.field_id)));

    const textFieldsOptions = textFields.map((f, k) => ({
      key: k,
      value: compositeIdToString(f.id),
      text: f.translation,
    }));

    return (
      <div>
        <Modal dimmer open size="fullscreen">
          <Modal.Header>Phonology</Modal.Header>
          <Modal.Content>
            <List>
              <List.Item>
                <Checkbox
                  radio
                  label="All vowels."
                  name="vowelsRadioGroup"
                  value="all"
                  checked={this.state.vowelsMode === 'all'}
                  onChange={this.handleVowelsChange}
                />
              </List.Item>

              <List.Item>
                <Checkbox
                  radio
                  label="Only longest vowels and vowels with highest intensity."
                  name="vowelsRadioGroup"
                  value="longest"
                  checked={this.state.vowelsMode === 'longest'}
                  onChange={this.handleVowelsChange}
                />
              </List.Item>
            </List>

            <div>
              <Select
                placeholder="Translation field"
                options={textFieldsOptions}
                onChange={(e, { value }) => this.setState({ selectedFieldId: value })}
              />
            </div>

            <List>
              <List.Item>
                <Checkbox
                  radio
                  label="Show all translations of each word."
                  name="translationsRadioGroup"
                  value="all"
                  checked={this.state.translationsMode === 'all'}
                  onChange={this.handleTranslationsChange}
                />
              </List.Item>

              <List.Item>
                <Checkbox
                  radio
                  label="Show only the first translation of each word."
                  name="translationsRadioGroup"
                  value="longest"
                  checked={this.state.translationsMode === 'longest'}
                  onChange={this.handleTranslationsChange}
                />
              </List.Item>
            </List>

            <List>
              <List.Item>
                <Checkbox
                  label="Group phonology data by markup descriptions."
                  checked={this.state.enabledGroup}
                  onChange={(e, { checked }) => this.setState({ enabledGroup: checked })}
                />
              </List.Item>
            </List>

            <List>
              <List.Item>
                <Input
                  label="Formant chart threshold"
                  value={this.state.chartThreshold}
                  onChange={(e, { value }) => this.setState({
                    chartThreshold: parseInt(value) || DEFAULT_CHART_THRESHOLD })}
                />
              </List.Item>
            </List>

            <List>
              <List.Item>
                <Checkbox
                  label="Choose markup tiers"
                  checked={this.state.enabledTiers}
                  onChange={(e, { checked }) => this.handleTiersChange(checked)}
                />

                {this.state.enabledTiers && !this.state.loadedTiers && (
                  <div style={{marginLeft: '1.5em'}}>
                    <List>
                      <List.Item>
                        Loading tier data...
                      </List.Item>
                    </List>
                  </div>
                )}

                {this.state.enabledTiers && this.state.tierList.length > 0 && (
                  <div style={{marginLeft: '1.5em'}}>
                    <List>
                      {map(this.state.tierList, ([tier, count]) => (
                        <List.Item key={tier}>
                          <Checkbox
                            label={`Tier "${tier}" (present at ${parseFloat(count / this.state.tierList.length * 100).toFixed(2)}% of markup records)`}
                            checked={this.state.tiers.indexOf(tier) >= 0}
                            onChange={(e, { checked }) => this.handleEnableTier(tier, checked)}
                          />
                        </List.Item>
                      ))}
                    </List>
                  </div>
                )}
              </List.Item>
            </List>

            <List>
              <List.Item>
                <Checkbox
                  label="Keep skipped vowel interval characters"
                  checked={this.state.enabledKeep}
                  onChange={(e, { checked }) => this.handleKeepChange(checked)}
                />

                {this.state.enabledKeep && !this.state.loadedKeepJoin && (
                  <div style={{marginLeft: '1.5em'}}>
                    <List>
                      <List.Item>
                        Loading skipped character data...
                      </List.Item>
                    </List>
                  </div>
                )}

                {this.state.enabledKeep && this.state.keepList.length > 0 && (
                  <div style={{marginLeft: '1.5em'}}>
                    <List>
                      {map(this.state.keepList, ([ord, count, str, name]) => (
                        <List.Item key={ord}>
                          <Checkbox
                            label={`"${str}" U+${ord.toString(16).padStart(4, '0')} ${name}`}
                            checked={this.state.selectedKeepList.indexOf(ord) >= 0}
                            onChange={(e, { checked }) => this.handleSelectKeep(ord, checked)}
                          />
                        </List.Item>
                      ))}
                    </List>
                  </div>
                )}
              </List.Item>
            </List>

            <List>
              <List.Item>
                <Checkbox
                  label="Combine with adjacent interval characters"
                  checked={this.state.enabledJoin}
                  onChange={(e, { checked }) => this.handleJoinChange(checked)}
                />

                {this.state.enabledJoin && !this.state.loadedKeepJoin && (
                  <div style={{marginLeft: '1.5em'}}>
                    <List>
                      <List.Item>
                        Loading adjacent character data...
                      </List.Item>
                    </List>
                  </div>
                )}

                {this.state.enabledJoin && this.state.joinList.length > 0 && (
                  <div style={{marginLeft: '1.5em'}}>
                    <List>
                      {map(this.state.joinList, ([ord, count, str, name]) => (
                        <List.Item key={ord}>
                          <Checkbox
                            label={`"${str}" U+${ord.toString(16).padStart(4, '0')} ${name}`}
                            checked={this.state.selectedJoinList.indexOf(ord) >= 0}
                            onChange={(e, { checked }) => this.handleSelectJoin(ord, checked)}
                          />
                        </List.Item>
                      ))}
                    </List>
                  </div>
                )}
              </List.Item>
            </List>
          </Modal.Content>

          <Modal.Actions>
            <Button icon="plus" positive content="Create" onClick={this.handleCreate} />
            <Button icon="minus" negative content="Cancel" onClick={this.props.closeModal} />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

PhonologyModal.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  createPhonology: PropTypes.func.isRequired,
};

export default compose(
  connect(state => state.phonology, dispatch => bindActionCreators({ closeModal }, dispatch)),
  branch(({ visible }) => !visible, renderNothing),
  graphql(perspectiveColumnsQuery),
  graphql(createPhonologyMutation, { name: 'createPhonology' }),
  branch(({ data }) => data.loading, renderNothing),
  withApollo
)(PhonologyModal);
