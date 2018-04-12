import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing } from 'recompose';
import { graphql, gql } from 'react-apollo';
import { Checkbox, Button, Modal, Divider, List, Select } from 'semantic-ui-react';
import { closeModal } from 'ducks/phonology';
import { bindActionCreators } from 'redux';
import { isEqual, map } from 'lodash';
import { connect } from 'react-redux';
import { compositeIdToString } from 'utils/compositeId';
import { perspectiveColumnsQuery, createPhonologyMutation } from './graphql';

class PhonologyModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      vowelsMode: 'all',
      translationsMode: 'all',
      enabledTiers: false,
      tiers: [],
      enabledGroup: false,
    };

    this.handleVowelsChange = this.handleVowelsChange.bind(this);
    this.handleTranslationsChange = this.handleTranslationsChange.bind(this);
    this.handleEnableTier = this.handleEnableTier.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
  }

  handleVowelsChange(e, { value: vowelsMode }) {
    this.setState({ vowelsMode });
  }

  handleTranslationsChange(e, { value: translationsMode }) {
    this.setState({ translationsMode });
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
    const {
      perspective: { columns },
      all_fields: allFields,
      phonology_tier_list: { tier_count: tiers, total_count: tiersCount },
    } = data;
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

            {tiersCount > 0 && (
              <div>
                <Checkbox
                  label="Choose markup tiers"
                  checked={this.state.enabledTiers}
                  onChange={(e, { checked }) => this.setState({ enabledTiers: checked })}
                />

                {this.state.enabledTiers && (
                  <List>
                    {map(tiers, (count, tier) => (
                      <List.Item key={tier}>
                        <Checkbox
                          label={`Tier ${tier} (present at ${parseFloat(count / tiersCount * 100).toFixed(2)}% of markup records)`}
                          checked={this.state.tiers.indexOf(tier) >= 0}
                          onChange={(e, { checked }) => this.handleEnableTier(tier, checked)}
                        />
                      </List.Item>
                    ))}
                  </List>
                )}
              </div>
            )}

            <Divider />

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

            <Checkbox
              label="Group phonology data by markup descriptions."
              checked={this.state.enabledGroup}
              onChange={(e, { checked }) => this.setState({ enabledGroup: checked })}
            />
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
  branch(({ data }) => data.loading, renderNothing)
)(PhonologyModal);
