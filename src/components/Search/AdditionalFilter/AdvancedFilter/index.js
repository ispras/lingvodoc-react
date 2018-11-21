import React, { PureComponent } from 'react';
import { Segment } from 'semantic-ui-react';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { getTranslation } from 'api/i18n';
import AudioField from './AudioField';
import KindField from './KindField';
import HumanSettlementField from './HumanSettlementField';
import YearsField from './YearsField';
import Authors from './AuthorsField';
import LanguageVulnerabilityField from './LanguageVulnerabilityField';
import './index.scss';

/* ----------- PROPS ----------- */
const classNames = {
  container: 'search-advanced-filter',
  field: 'search-advanced-filter__field',
  header: 'search-advanced-filter__header',
  hide: 'hide',
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
    languageVulnerability: PropTypes.array.isRequired,
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
    const { show } = this.props;
    const {
      years: yearOptions, humanSettlement: humanSettlementOptions,
      authors: authorsOptions, nativeSpeakersCount: languageVulnerabilityOptions,
    } = this.props.metadata;

    return (
      <Segment.Group className={`${classNames.container} ${!show ? classNames.hide : ''}`}>
        {show ?
          <Segment.Group>
            <Segment>
              <AudioField
                classNames={classNames}
                value={this.props.hasAudio}
                onChange={this.onHasAudioChange}
                getTranslation={getTranslation}
              />
            </Segment>
            <Segment>
              <KindField
                classNames={classNames}
                value={this.props.kind}
                onChange={this.onKindChange}
                getTranslation={getTranslation}
              />
            </Segment>
            <Segment>
              <YearsField
                classNames={classNames}
                options={yearOptions}
                value={this.props.years}
                onChange={this.onFieldChange}
                getTranslation={getTranslation}
              />
            </Segment>
            <Segment>
              <HumanSettlementField
                classNames={classNames}
                options={humanSettlementOptions}
                value={this.props.humanSettlement}
                onChange={this.onFieldChange}
                getTranslation={getTranslation}
              />
            </Segment>
            <Segment>
              <Authors
                classNames={classNames}
                options={authorsOptions}
                value={this.props.authors}
                onChange={this.onFieldChange}
                getTranslation={getTranslation}
              />
            </Segment>
            <Segment>
              <LanguageVulnerabilityField
                classNames={classNames}
                options={languageVulnerabilityOptions}
                value={this.props.languageVulnerability}
                onChange={this.onFieldChange}
                getTranslation={getTranslation}
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
