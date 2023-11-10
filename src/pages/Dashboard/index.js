import React, { useContext } from "react";
import { connect } from "react-redux";
import { Confirm, Dimmer, Dropdown, Header, Icon, List, Popup, Tab } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, onlyUpdateForKeys, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import DictionaryProperties from "components/DictionaryPropertiesModal";
import { openModal as openDictionaryOrganizationsModal } from "ducks/dictionaryOrganizations";
import { openDictionaryPropertiesModal } from "ducks/dictionaryProperties";
import { openPerspectivePropertiesModal } from "ducks/perspectiveProperties";
import { openRoles } from "ducks/roles";
import { openSaveDictionaryModal } from "ducks/saveDictionary";
import { openStatistics } from "ducks/statistics";
import TranslationContext from "Layout/TranslationContext";
import { dictionaryQuery } from "pages/DialeqtImport";
import { compositeIdToString } from "utils/compositeId";

const dimmerStyle = { minHeight: "600px" };

export const query = gql`
  query dashboardQuery($mode: Int!, $category: Int!) {
    dictionaries(mode: $mode, category: $category) {
      id
      parent_id
      translations
      status_translations
      state_translation_gist_id
      perspectives {
        id
        parent_id
        translations
        status_translations
        state_translation_gist_id
      }
    }
    all_statuses {
      id
      created_at
      marked_for_deletion
      type
      translations
    }
  }
`;

const updateDictionaryStatusMutation = gql`
  mutation updateDictionaryStatus($id: LingvodocID!, $status_id: LingvodocID!) {
    update_dictionary_status(id: $id, state_translation_gist_id: $status_id) {
      triumph
    }
  }
`;

const updatePerspectiveStatusMutation = gql`
  mutation updatePerspectiveStatus($id: LingvodocID!, $status_id: LingvodocID!) {
    update_perspective_status(id: $id, state_translation_gist_id: $status_id) {
      triumph
    }
  }
`;

const removePerspectiveMutation = gql`
  mutation removePerspective($id: LingvodocID!) {
    delete_perspective(id: $id) {
      triumph
    }
  }
`;

const removeDictionaryMutation = gql`
  mutation removeDictionary($id: LingvodocID!) {
    delete_dictionary(id: $id) {
      triumph
    }
  }
`;

const Statuses = onlyUpdateForKeys(["translations"])(({ translations, statusId, parentId, statuses, updateStatus }) => {
  const updateHandler = (id, sid) => {
    updateStatus({
      variables: { id, status_id: sid },
      refetchQueries: [
        {
          query,
          variables: {
            mode: 1,
            category: 0
          }
        }
      ]
    });
  };

  return (
    <Dropdown
      item
      text={T(translations)}
      className="lingvo-dashboard-elem lingvo-dashboard-elem_status"
      icon={<i className="lingvo-icon lingvo-icon_arrow" />}
    >
      <Dropdown.Menu>
        {statuses.map(status => (
          <Dropdown.Item
            key={compositeIdToString(status.id)}
            text={T(status.translations)}
            active={isEqual(statusId, status.id)}
            onClick={() => updateHandler(parentId, status.id)}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
});

// Dictionary and Perspective share the set of statuses but use different mutations to change current status.
const DicionaryStatuses = graphql(updateDictionaryStatusMutation, { name: "updateStatus" })(Statuses);
const PerspectiveStatuses = graphql(updatePerspectiveStatusMutation, { name: "updateStatus" })(Statuses);

class P extends React.Component {
  constructor(props) {
    super(props);

    this.state = { confirmation: false };

    this.onRemovePerspective = this.onRemovePerspective.bind(this);
  }

  onRemovePerspective() {
    const { id, mode, category, removePerspective } = this.props;

    this.setState({ confirmation: false });
    removePerspective({
      variables: {
        id
      },
      refetchQueries: [
        {
          query,
          variables: {
            mode,
            category
          }
        }
      ]
    });
  }

  render() {
    const {
      id,
      parent_id,
      translations,
      status_translations,
      state_translation_gist_id: statusId,
      statuses,
      actions
    } = this.props;

    const { confirmation } = this.state;

    return (
      <List.Item>
        <List.Content>
          <div className="lingvo-dashboard-block">
            <div className="lingvo-dashboard-block__small">
              <div className="lingvo-dashboard-group-elems">
                <Dropdown
                  trigger={
                    <span>
                      <i className="lingvo-icon lingvo-icon_book" /> {T(translations)}
                    </span>
                  }
                  className="link item lingvo-dashboard-elem"
                  icon={<i className="lingvo-icon lingvo-icon_arrow" />}
                >
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => actions.openRoles(id, "perspective", this.context("Roles"))}>
                      <i className="lingvo-icon lingvo-icon_roles" /> {this.context("Roles")}
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() =>
                        actions.openPerspectivePropertiesModal(
                          id,
                          parent_id,
                          `${this.context("Perspective")} '${T(translations)}' ${this.context(
                            "Properties"
                          ).toLowerCase()}`
                        )
                      }
                    >
                      <i className="lingvo-icon lingvo-icon_properties" /> {this.context("Properties")}
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => actions.openStatistics(id, "perspective", this.context("Statistics"))}
                    >
                      <i className="lingvo-icon lingvo-icon_stats" /> {this.context("Statistics")}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setState({ confirmation: true })}>
                      <i className="lingvo-icon lingvo-icon_delete" /> {this.context("Remove perspective")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <div className="lingvo-dashboard-group-elems__block">
                  <Popup
                    trigger={
                      <a
                        className="lingvo-dashboard-elem lingvo-dashboard-elem_button"
                        href={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/view`}
                      >
                        <i className="lingvo-icon lingvo-icon_view" />
                      </a>
                    }
                    content={this.context("View")}
                    className="lingvo-popup-inverted"
                    hideOnScroll={true}
                  />

                  <Popup
                    trigger={
                      <a
                        className="lingvo-dashboard-elem lingvo-dashboard-elem_button"
                        href={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/edit`}
                      >
                        <i className="lingvo-icon lingvo-icon_edit" />
                      </a>
                    }
                    content={this.context("Edit")}
                    className="lingvo-popup-inverted"
                    hideOnScroll={true}
                  />

                  <Popup
                    trigger={
                      <a
                        className="lingvo-dashboard-elem lingvo-dashboard-elem_button"
                        href={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/publish`}
                      >
                        <i className="lingvo-icon lingvo-icon_publish" />
                      </a>
                    }
                    content={this.context("Publish")}
                    className="lingvo-popup-inverted"
                    hideOnScroll={true}
                  />

                  <a
                    className="lingvo-dashboard-elem lingvo-dashboard-elem_button"
                    href={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/contributions`}
                  >
                    {this.context("Contributions")}
                  </a>
                </div>
              </div>
            </div>

            <div className="lingvo-dashboard-block__small">
              <PerspectiveStatuses
                translations={status_translations}
                statusId={statusId}
                parentId={id}
                statuses={statuses}
              />
            </div>
          </div>
        </List.Content>
        <Confirm
          open={confirmation}
          header={this.context("Confirmation")}
          content={`${this.context("Are you sure you want to delete perspective")} '${T(translations)}'?`}
          onConfirm={this.onRemovePerspective}
          onCancel={() => this.setState({ confirmation: false })}
          className="lingvo-confirm"
        />
      </List.Item>
    );
  }
}

P.contextType = TranslationContext;

P.propTypes = {
  id: PropTypes.array.isRequired,
  parent_id: PropTypes.array.isRequired,
  translations: PropTypes.object.isRequired,
  mode: PropTypes.number.isRequired,
  category: PropTypes.number.isRequired,
  status_translations: PropTypes.object.isRequired,
  state_translation_gist_id: PropTypes.array.isRequired,
  statuses: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  removePerspective: PropTypes.func.isRequired
};

const Perspective = compose(
  connect(null, dispatch => ({
    actions: bindActionCreators({ openRoles, openPerspectivePropertiesModal, openStatistics }, dispatch)
  })),
  graphql(removePerspectiveMutation, { name: "removePerspective" }),
  onlyUpdateForKeys(["translations", "status_translations"])
)(P);

class D extends React.Component {
  constructor(props) {
    super(props);

    this.state = { confirmation: false };

    this.onRemoveDictionary = this.onRemoveDictionary.bind(this);
  }

  onRemoveDictionary() {
    const { id, mode, category, removeDictionary } = this.props;

    this.setState({ confirmation: false });
    removeDictionary({
      variables: {
        id
      },
      refetchQueries: [
        {
          query,
          variables: {
            mode,
            category
          }
        },
        { query: dictionaryQuery }
      ]
    });
  }

  render() {
    const {
      id,
      translations,
      status_translations,
      state_translation_gist_id: statusId,
      perspectives,
      statuses,
      actions,
      mode,
      category
    } = this.props;

    const { confirmation } = this.state;

    return (
      <List.Item>
        <List.Content>
          <div className="lingvo-dashboard-block">
            <div className="lingvo-dashboard-block__big">
              <Dropdown
                text={T(translations)}
                className="link item lingvo-dashboard-elem lingvo-dashboard-elem_main"
                icon={<i className="lingvo-icon lingvo-icon_arrow" />}
              >
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => actions.openRoles(id, "dictionary", this.context("Roles"))}>
                    <i className="lingvo-icon lingvo-icon_roles" /> {this.context("Roles")}
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      actions.openDictionaryPropertiesModal(
                        id,
                        `${this.context("Dictionary")} '${T(translations)}' ${this.context("Properties").toLowerCase()}`
                      )
                    }
                  >
                    <i className="lingvo-icon lingvo-icon_properties" /> {this.context("Properties")}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => actions.openDictionaryOrganizationsModal(id)}>
                    <i className="lingvo-icon lingvo-icon_organizations" /> {this.context("Organizations")}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => actions.openStatistics(id, "dictionary", this.context("Statistics"))}>
                    <i className="lingvo-icon lingvo-icon_stats" /> {this.context("Statistics")}
                  </Dropdown.Item>
                  {/*<Dropdown.Item icon="circle" text={this.context("Create a new perspective...")} />*/}
                  <Dropdown.Item onClick={() => actions.openSaveDictionaryModal(id)}>
                    <i className="lingvo-icon lingvo-icon_save" /> {this.context("Save dictionary")}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => this.setState({ confirmation: true })}>
                    <i className="lingvo-icon lingvo-icon_delete" /> {this.context("Remove dictionary")}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div className="lingvo-dashboard-block__small">
              <DicionaryStatuses
                translations={status_translations}
                statusId={statusId}
                parentId={id}
                statuses={statuses}
              />
            </div>
          </div>

          <List relaxed className="lingvo-dashboard-subblock">
            {perspectives.map(perspective => (
              <Perspective
                key={compositeIdToString(perspective.id)}
                {...perspective}
                category={category}
                mode={mode}
                as={List.Item}
                statuses={statuses}
              />
            ))}
          </List>
        </List.Content>
        <Confirm
          open={confirmation}
          header={this.context("Confirmation")}
          content={`${this.context("Are you sure you want to delete dictionary")} '${T(translations)}'?`}
          onConfirm={this.onRemoveDictionary}
          onCancel={() => this.setState({ confirmation: false })}
          className="lingvo-confirm"
        />
      </List.Item>
    );
  }
}

D.contextType = TranslationContext;

D.propTypes = {
  id: PropTypes.array.isRequired,
  perspectives: PropTypes.array.isRequired,
  translations: PropTypes.object.isRequired,
  mode: PropTypes.number.isRequired,
  category: PropTypes.number.isRequired,
  status_translations: PropTypes.object.isRequired,
  state_translation_gist_id: PropTypes.array.isRequired,
  statuses: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  removeDictionary: PropTypes.func.isRequired
};

const Dictionary = compose(
  connect(null, dispatch => ({
    actions: bindActionCreators(
      {
        openRoles,
        openDictionaryPropertiesModal,
        openStatistics,
        openSaveDictionaryModal,
        openDictionaryOrganizationsModal
      },
      dispatch
    )
  })),
  graphql(removeDictionaryMutation, { name: "removeDictionary" }),
  onlyUpdateForKeys(["translations", "status_translations", "perspectives"])
)(D);

const Dashboard = ({ data, mode, category }) => {
  const { loading, dictionaries, all_statuses: statuses } = data;
  return (
    <div className="lingvo-dashboard">
      <Dimmer.Dimmable dimmed={loading} style={dimmerStyle}>
        <Dimmer active={loading} inverted className="lingvo-dimmer">
          <Header as="h2" icon>
            <Icon name="spinner" loading className="lingvo-spinner" />
          </Header>
        </Dimmer>

        <List>
          {!loading &&
            dictionaries.map(dictionary => (
              <Dictionary
                key={compositeIdToString(dictionary.id)}
                statuses={statuses}
                category={category}
                mode={mode}
                {...dictionary}
              />
            ))}
        </List>
      </Dimmer.Dimmable>
    </div>
  );
};

Dashboard.propTypes = {
  data: PropTypes.object.isRequired,
  mode: PropTypes.number.isRequired,
  category: PropTypes.number.isRequired
};

const Dictionaries = compose(
  graphql(query),
  onlyUpdateForKeys(["data"]),
  branch(({ data }) => !!data.error, renderNothing)
)(Dashboard);

const DICTIONARIES_TABS = getTranslation => {
  return [
    {
      menuItem: getTranslation("My dictionaries"),
      render: () => (
        <Tab.Pane className="lingvo-tab__pane">
          <Dictionaries category={0} mode={0} />
        </Tab.Pane>
      )
    },
    {
      menuItem: getTranslation("Available dictionaries"),
      render: () => (
        <Tab.Pane className="lingvo-tab__pane">
          <Dictionaries category={0} mode={1} />
        </Tab.Pane>
      )
    }
  ];
};

const CORPORA_TABS = getTranslation => {
  return [
    {
      menuItem: getTranslation("My corpora"),
      render: () => (
        <Tab.Pane className="lingvo-tab__pane">
          <Dictionaries category={1} mode={0} />
        </Tab.Pane>
      )
    },
    {
      menuItem: getTranslation("Available corpora"),
      render: () => (
        <Tab.Pane className="lingvo-tab__pane">
          <Dictionaries category={1} mode={1} />
        </Tab.Pane>
      )
    }
  ];
};

const DictionaryDashboard = () => {
  const getTranslation = useContext(TranslationContext);
  return (
    <div className="background-content">
      <Tab className="inverted lingvo-tab" panes={DICTIONARIES_TABS(getTranslation)} renderActiveOnly />
      <DictionaryProperties />
    </div>
  );
};

const CorpusDashboard = () => {
  const getTranslation = useContext(TranslationContext);
  return (
    <div className="background-content">
      <Tab className="inverted lingvo-tab" panes={CORPORA_TABS(getTranslation)} renderActiveOnly />
      <DictionaryProperties />
    </div>
  );
};

export { DictionaryDashboard, CorpusDashboard };
