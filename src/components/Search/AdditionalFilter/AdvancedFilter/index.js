import React, { PureComponent } from 'react';
import { Segment } from 'semantic-ui-react';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { getTranslation } from 'api/i18n';
import AudioField from './AudioField';
import KindField from './KindField';
import Field from './Field';
import './index.scss';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-advanced-filter',
  field: 'search-advanced-filter__field',
  header: 'search-advanced-filter__header',
};

/* ----------- COMPONENT ----------- */
/**
 * Advanced filter.
 */
class AdvancedFilter extends PureComponent {
  static propTypes = {
    show: PropTypes.bool,
    hasAudio: PropTypes.oneOf([
      true, false, null,
    ]),
    kind: PropTypes.oneOf([
      'Expedition', 'Archive', null,
    ]),
    years: PropTypes.array.isRequired,
    humanSettlement: PropTypes.array.isRequired,
    authors: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    metadata: PropTypes.object.isRequired,
  }

  static defaultProps = {
    show: true,
  }

  constructor() {
    super();

    this.onHasAudioChange = this.onHasAudioChange.bind(this);
    this.onKindChange = this.onKindChange.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
  }

  /**
   * Event handler for "hasAudio" field selecting.
   * @param {boolean|null} value - hasAudio field value
   */
  onHasAudioChange(value) {
    this.props.onChange(value, 'hasAudio');
  }

  /**
   * Event handler for "kind" field selecting.
   * @param {boolean|null} value - hasAudio field value
   */
  onKindChange(value) {
    this.props.onChange(value, 'kind');
  }

  /**
   * Event handler for field value changing.
   * @param {string[]} value - field value
   * @param {string} name - field name
   */
  onFieldChange(value, name) {
    this.props.onChange(value, name);
  }

  render() {
    const { years: yearOptions, humanSettlement: humanSettlementOptions } = this.props.metadata;
    // TODO: insert this phrases into stringsToTranslate object in 'api/i18n.js'
    const allSelectedText = getTranslation('All');
    const selectAllText = getTranslation('Select all');
    const clearAllText = getTranslation('Clear all');
    const selectedText = getTranslation('You have selected:');
    // audio field text
    const audioOptions = {
      haveAudio: getTranslation('Have audio'),
      noAudio: getTranslation('No audio'),
    };
    const audioLabel = getTranslation('Audio');
    // kind field text
    const kindOptions = {
      expedition: getTranslation('Expedition'),
      archive: getTranslation('Archive'),
    };
    const kindLabel = getTranslation('Data source');
    // years field text
    const selectYearsText = getTranslation('Select years');
    const noYearsFoundText = getTranslation('No years found.');
    const yearsLabel = getTranslation('Years');
    // humanSettlement field text
    const selectHumanSettlementText = getTranslation('Select human settlement');
    const noHumanSettlementFoundText = getTranslation('No human settlement found.');
    const humanSettlementLabel = getTranslation('Human settlement');
    // authors field text
    const selectAuthorsText = getTranslation('Select authors');
    const noAuthorsFoundText = getTranslation('No authors found.');
    const authorsLabel = getTranslation('Authors');

    return (
      <Segment.Group className={classNames.container}>
        <Segment>
          {selectedText}
        </Segment>
        {this.props.show ?
          <Segment.Group>
            <Segment>
              <AudioField
                classNames={classNames}
                value={this.props.hasAudio}
                options={audioOptions}
                onChange={this.onHasAudioChange}
                label={audioLabel}
                allSelectedText={allSelectedText}
              />
            </Segment>
            <Segment>
              <KindField
                classNames={classNames}
                value={this.props.kind}
                options={kindOptions}
                onChange={this.onKindChange}
                label={kindLabel}
                allSelectedText={allSelectedText}
              />
            </Segment>
            <Segment>
              <Field
                classNames={classNames}
                options={yearOptions}
                value={this.props.years}
                name="years"
                onChange={this.onFieldChange}
                label={yearsLabel}
                selectAllText={selectAllText}
                clearAllText={clearAllText}
                selectText={selectYearsText}
                noFoundText={noYearsFoundText}
              />
            </Segment>
            <Segment>
              <Field
                classNames={classNames}
                options={humanSettlementOptions}
                value={this.props.humanSettlement}
                name="humanSettlement"
                onChange={this.onFieldChange}
                label={humanSettlementLabel}
                selectAllText={selectAllText}
                clearAllText={clearAllText}
                selectText={selectHumanSettlementText}
                noFoundText={noHumanSettlementFoundText}
              />
            </Segment>
          </Segment.Group> :
          null
        }
      </Segment.Group>
    );
  }
}

/**
 * Component for receiving, transmitting and handling data from the API to the main component.
 * @param {Object} props - component properties
 * @returns {AdditionalFields} - component with added properties (data from API)
 */
const AdvancedFilterWrap = (props) => {
  const { metadataQuery } = props;
  const { error: metadataQueryError, loading: metadataQueryLoading } = metadataQuery;

  if (metadataQueryError || metadataQueryLoading) {
    return null;
  }

  const newProps = {
    ...props,
    metadata: metadataQuery.select_tags_metadata,
  };

  return <AdvancedFilter {...newProps} />;
};

AdvancedFilterWrap.propTypes = {
  metadataQuery: PropTypes.object.isRequired,
};

/* ----------- QUERIES ----------- */
const metadataQuery = gql`
  query metadata {
    select_tags_metadata
  }
`;

export default compose(graphql(metadataQuery, {
  name: 'metadataQuery',
}))(AdvancedFilterWrap);
