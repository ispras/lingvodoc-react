import React, { PureComponent } from "react";
import { Segment } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { compose } from "recompose";

import TranslationContext from "Layout/TranslationContext";

import AudioField from "./AudioField";
import Authors from "./AuthorsField";
import HumanSettlementField from "./HumanSettlementField";
import KindField from "./KindField";
import LanguageVulnerabilityField from "./LanguageVulnerabilityField";
import YearsField from "./YearsField";

import "./index.scss";

/* ----------- PROPS ----------- */
const classNames = {
  container: "search-advanced-filter",
  field: "search-advanced-filter__field",
  header: "search-advanced-filter__header",
  warning: "search-advanced-filter__warning",
  hide: "hide"
};

/* ----------- COMPONENT ----------- */
/**
 * Advanced filter.
 */
class AdvancedFilter extends PureComponent {
  static propTypes = {
    show: PropTypes.bool,
    hasAudio: PropTypes.oneOf([true, false, null]),
    kind: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
    years: PropTypes.array.isRequired,
    humanSettlement: PropTypes.array.isRequired,
    authors: PropTypes.array.isRequired,
    languageVulnerability: PropTypes.array.isRequired,
    showVulnerabilityWarning: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    metadata: PropTypes.object.isRequired
  };

  static defaultProps = {
    show: true
  };

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
    this.props.onChange(value, "hasAudio");
  }

  /**
   * Event handler for "kind" field selecting.
   * @param {boolean|null} value - hasAudio field value
   */
  onKindChange(value) {
    this.props.onChange(value, "kind");
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
      years: yearOptions,
      humanSettlement: humanSettlementOptions,
      authors: authorsOptions,
      nativeSpeakersCount: languageVulnerabilityOptions
    } = this.props.metadata;

    return (
      <Segment.Group className={`${classNames.container} ${!show ? classNames.hide : ""}`}>
        {show ? (
          <Segment.Group>
            <Segment>
              <AudioField
                classNames={classNames}
                value={this.props.hasAudio}
                onChange={this.onHasAudioChange}
                getTranslation={this.context}
              />
            </Segment>
            <Segment>
              <KindField
                classNames={classNames}
                value={this.props.kind}
                onChange={this.onKindChange}
                getTranslation={this.context}
              />
            </Segment>
            <Segment>
              <YearsField
                classNames={classNames}
                options={yearOptions}
                value={this.props.years}
                onChange={this.onFieldChange}
                getTranslation={this.context}
              />
            </Segment>
            <Segment>
              <HumanSettlementField
                classNames={classNames}
                options={humanSettlementOptions}
                value={this.props.humanSettlement}
                onChange={this.onFieldChange}
                getTranslation={this.context}
              />
            </Segment>
            <Segment>
              <Authors
                classNames={classNames}
                options={authorsOptions}
                value={this.props.authors}
                onChange={this.onFieldChange}
                getTranslation={this.context}
              />
            </Segment>
            <Segment>
              <LanguageVulnerabilityField
                classNames={classNames}
                options={languageVulnerabilityOptions}
                value={this.props.languageVulnerability}
                showVulnerabilityWarning={this.props.showVulnerabilityWarning}
                onChange={this.onFieldChange}
                getTranslation={this.context}
              />
            </Segment>
          </Segment.Group>
        ) : null}
      </Segment.Group>
    );
  }
}

AdvancedFilter.contextType = TranslationContext;

/**
 * Component for receiving, transmitting and handling data from the API to the main component.
 * @param {Object} props - component properties
 * @returns {AdditionalFields} - component with added properties (data from API)
 */
const AdvancedFilterWrap = props => {
  const { metadataQuery } = props;
  const { error: metadataQueryError, loading: metadataQueryLoading } = metadataQuery;

  if (metadataQueryError || metadataQueryLoading) {
    return null;
  }

  const newProps = {
    ...props,
    metadata: metadataQuery.select_tags_metadata
  };

  return <AdvancedFilter {...newProps} />;
};

AdvancedFilterWrap.propTypes = {
  metadataQuery: PropTypes.object.isRequired
};

/* ----------- QUERIES ----------- */
const metadataQuery = gql`
  query metadata {
    select_tags_metadata
  }
`;

export default compose(
  graphql(metadataQuery, {
    name: "metadataQuery"
  })
)(AdvancedFilterWrap);
