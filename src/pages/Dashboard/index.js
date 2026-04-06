import React, { useContext, useState } from "react";
import { connect } from "react-redux";
import { Confirm, Dimmer, Dropdown, Header, Icon, List, Popup, Tab, Button } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { isEqual, cloneDeep } from "lodash";
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
import { openUploadModal } from "ducks/upload";
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
      additional_metadata {
        stars
      }
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

const updateDictionaryMutation = gql`
  mutation updateDictionary($id: LingvodocID!, $additionalMetadata: ObjectVal!) {
    update_dictionary(id: $id, additional_metadata: $additionalMetadata) {
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
  const [curStatus, setCurStatus] = useState(statusId);
  const [curStatusText, setCurStatusText] = useState(translations);

  const updateHandler = (id, status) => {
    updateStatus({
      variables: { id, status_id: status.id },
      refetchQueries: [
        {
          query,
          variables: {
            mode: 1,
            category: 0
          }
        }
      ]
    }).then(() => {
      setCurStatus(status.id);
      setCurStatusText(status.translations);
    });
  };

  return (
    <Dropdown
      item
      text={T(curStatusText)}
      className="lingvo-dashboard-elem lingvo-dashboard-elem_status"
      icon={<i className="lingvo-icon lingvo-icon_arrow" />}
    >
      <Dropdown.Menu>
        {statuses.map(status => (
          <Dropdown.Item
            key={compositeIdToString(status.id)}
            text={T(status.translations)}
            active={isEqual(curStatus, status.id)}
            selected={isEqual(curStatus, status.id)}
            onClick={() => updateHandler(parentId, status)}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
});

// Dictionary and Perspective share the set of statuses but use different mutations to change current status.
const DicionaryStatuses = graphql(updateDictionaryStatusMutation, { name: "updateStatus" })(Statuses);
const PerspectiveStatuses = graphql(updatePerspectiveStatusMutation, { name: "updateStatus" })(Statuses);

const P = ({
  id,
  mode,
  category,
  removePerspective,
  parent_id,
  translations,
  status_translations,
  state_translation_gist_id: statusId,
  statuses,
  actions
}) => {
  const getTranslation = useContext(TranslationContext);

  const [confirmation, setConfirmation] = useState(false);

  const onRemovePerspective = () => {
    setConfirmation(false);
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
  };

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
                  <Dropdown.Item onClick={() => actions.openRoles(id, "perspective", getTranslation("Roles"))}>
                    <i className="lingvo-icon lingvo-icon_roles" /> {getTranslation("Roles")}
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      actions.openPerspectivePropertiesModal(
                        id,
                        parent_id,
                        `${getTranslation("Perspective")} '${T(translations)}' ${getTranslation(
                          "Properties"
                        ).toLowerCase()}`
                      )
                    }
                  >
                    <i className="lingvo-icon lingvo-icon_properties" /> {getTranslation("Properties")}
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => actions.openStatistics(id, "perspective", getTranslation("Statistics"))}
                  >
                    <i className="lingvo-icon lingvo-icon_stats" /> {getTranslation("Statistics")}
                  </Dropdown.Item>

                  <Dropdown.Item onClick={() => setConfirmation(true)}>
                    <i className="lingvo-icon lingvo-icon_delete" /> {getTranslation("Remove perspective")}
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
                  content={getTranslation("View")}
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
                  content={getTranslation("Edit")}
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
                  content={getTranslation("Publish")}
                  className="lingvo-popup-inverted"
                  hideOnScroll={true}
                />

                <a
                  className="lingvo-dashboard-elem lingvo-dashboard-elem_button"
                  href={`/dictionary/${parent_id[0]}/${parent_id[1]}/perspective/${id[0]}/${id[1]}/contributions`}
                >
                  {getTranslation("Contributions")}
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
        header={getTranslation("Confirmation")}
        content={`${getTranslation("Are you sure you want to delete perspective")} '${T(translations)}'?`}
        onConfirm={onRemovePerspective}
        onCancel={() => setСonfirmation(false)}
        className="lingvo-confirm"
      />
    </List.Item>
  );
};

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

const D = ({
  user,
  additional_metadata,
  id,
  mode,
  category,
  removeDictionary,
  updateDictionary,
  translations,
  status_translations,
  state_translation_gist_id: statusId,
  perspectives,
  statuses,
  actions
}) => {
  const getTranslation = useContext(TranslationContext);

  const { stars } = additional_metadata;

  const [star, setStar] = useState(stars && stars[user.id] ? stars[user.id][0] : 0);
  const [starring, setStarring] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const onRemoveDictionary = () => {
    setConfirmation(false);
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
  };

  const onUpdateFavorite = () => {
    const { stars: oldStars } = additional_metadata;

    const stars = oldStars ? cloneDeep(oldStars) : {};

    const currentStar = user.id in stars ? [(stars[user.id][0] + 1) % 3, stars[user.id][1]] : [1, ""];

    stars[user.id] = currentStar;

    setStar(currentStar[0]);
    setStarring(true);

    updateDictionary({
      variables: {
        id,
        additionalMetadata: { stars }
      },
      refetchQueries: [
        {
          query,
          variables: {
            mode,
            category
          }
        },
        {
          query,
          variables: {
            mode: 2,
            category
          }
        }
        //{ query: dictionaryQuery }
      ],
      awaitRefetchQueries: true
    }).then(() => setStarring(false));
  };

  return (
    <List.Item>
      <List.Content>
        <div className="lingvo-dashboard-block">
          <div className="lingvo-dashboard-block__big">
            <div className="lingvo-dashboard-group-elems">
              <Dropdown
                text={T(translations)}
                className="link item lingvo-dashboard-elem lingvo-dashboard-elem_main"
                icon={<i className="lingvo-icon lingvo-icon_arrow" />}
              >
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => actions.openRoles(id, "dictionary", getTranslation("Roles"))}>
                    <i className="lingvo-icon lingvo-icon_roles" /> {getTranslation("Roles")}
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      actions.openDictionaryPropertiesModal(
                        id,
                        `${getTranslation("Dictionary")} '${T(translations)}' ${getTranslation(
                          "Properties"
                        ).toLowerCase()}`
                      )
                    }
                  >
                    <i className="lingvo-icon lingvo-icon_properties" /> {getTranslation("Properties")}
                  </Dropdown.Item>

                  <Dropdown.Item onClick={() => actions.openDictionaryOrganizationsModal(id)}>
                    <i className="lingvo-icon lingvo-icon_organizations" /> {getTranslation("Organizations")}
                  </Dropdown.Item>

                  <Dropdown.Item onClick={() => actions.openStatistics(id, "dictionary", getTranslation("Statistics"))}>
                    <i className="lingvo-icon lingvo-icon_stats" /> {getTranslation("Statistics")}
                  </Dropdown.Item>

                  {/*<Dropdown.Item icon="circle" text={getTranslation("Create a new perspective...")} />*/}

                  <Dropdown.Item onClick={() => actions.openSaveDictionaryModal(id)}>
                    <i className="lingvo-icon lingvo-icon_save" /> {getTranslation("Save dictionary")}
                  </Dropdown.Item>

                  <Dropdown.Item onClick={() => setConfirmation(true)}>
                    <i className="lingvo-icon lingvo-icon_delete" /> {getTranslation("Remove dictionary")}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <div className="lingvo-dashboard-group-elems__block">
                <Popup
                  trigger={
                    <Button className="lingvo-dashboard-elem lingvo-dashboard-elem_button" onClick={onUpdateFavorite}>
                      <i
                        className={
                          starring
                            ? "lingvo-icon lingvo-icon_spinner"
                            : star === 1
                            ? "lingvo-icon lingvo-icon_star_yellow"
                            : star === 2
                            ? "lingvo-icon lingvo-icon_star_red"
                            : "lingvo-icon lingvo-icon_star_empty"
                        }
                      />
                    </Button>
                  }
                  disabled={starring}
                  content={
                    star === 1
                      ? getTranslation("Add red star")
                      : star === 2
                      ? getTranslation("Clean any star")
                      : getTranslation("Add yellow star")
                  }
                  className="lingvo-popup-inverted"
                  hideOnScroll={true}
                />
              </div>
            </div>
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
        header={getTranslation("Confirmation")}
        content={`${getTranslation("Are you sure you want to delete dictionary")} '${T(translations)}'?`}
        onConfirm={onRemoveDictionary}
        onCancel={() => setConfirmation(false)}
        className="lingvo-confirm"
      />
    </List.Item>
  );
};

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
  connect(
    state => state.user,
    dispatch => ({
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
    })
  ),
  graphql(updateDictionaryMutation, { name: "updateDictionary" }),
  graphql(removeDictionaryMutation, { name: "removeDictionary" }),
  onlyUpdateForKeys(["translations", "status_translations", "perspectives", "additional_metadata"])
)(D);

const Dashboard = ({ data, mode, category, setShowFavorite }) => {
  const { loading, dictionaries, all_statuses: statuses } = data;

  if (!loading && !dictionaries.length && setShowFavorite) {
    setShowFavorite(false);
  }

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

const DICTIONARIES_TABS = ({ getTranslation, showFavorite, setShowFavorite }) => {
  const result = [];

  if (showFavorite) {
    result.push({
      menuItem: getTranslation("Favorite dictionaries"),
      render: () => (
        <Tab.Pane className="lingvo-tab__pane">
          <Dictionaries category={0} mode={2} setShowFavorite={setShowFavorite} />
        </Tab.Pane>
      )
    });
  }

  result.push(
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
  );

  return result;
};

const CORPORA_TABS = ({ getTranslation, showFavorite, setShowFavorite }) => {
  const result = [];

  if (showFavorite) {
    result.push({
      menuItem: getTranslation("Favorite corpora"),
      render: () => (
        <Tab.Pane className="lingvo-tab__pane">
          <Dictionaries category={1} mode={2} setShowFavorite={setShowFavorite} />
        </Tab.Pane>
      )
    });
  }

  result.push(
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
  );

  return result;
};

const PARALLEL_CORPORA_TABS = getTranslation => {
  return [
    {
      menuItem: getTranslation("My parallel corpora"),
      render: () => (
        <Tab.Pane className="lingvo-tab__pane">
          <Dictionaries category={2} mode={0} />
        </Tab.Pane>
      )
    },
    {
      menuItem: getTranslation("Available parallel corpora"),
      render: () => (
        <Tab.Pane className="lingvo-tab__pane">
          <Dictionaries category={2} mode={1} />
        </Tab.Pane>
      )
    }
  ];
};

const DictionaryDashboard = () => {
  const getTranslation = useContext(TranslationContext);
  const [showFavorite, setShowFavorite] = useState(true);

  return (
    <div className="background-content">
      <Tab
        className="inverted lingvo-tab"
        panes={DICTIONARIES_TABS({ getTranslation, showFavorite, setShowFavorite })}
        renderActiveOnly
      />
      <DictionaryProperties />
    </div>
  );
};

const CorpusDashboard = () => {
  const getTranslation = useContext(TranslationContext);
  const [showFavorite, setShowFavorite] = useState(true);

  return (
    <div className="background-content">
      <Tab
        className="inverted lingvo-tab"
        panes={CORPORA_TABS({ getTranslation, showFavorite, setShowFavorite })}
        renderActiveOnly
      />
      <DictionaryProperties />
    </div>
  );
};

const ParallelCorporaDashboard = () => {
  const getTranslation = useContext(TranslationContext);
  return (
    <div className="background-content">
      <Tab className="inverted lingvo-tab" panes={PARALLEL_CORPORA_TABS(getTranslation)} renderActiveOnly />
      <DictionaryProperties />
    </div>
  );
};

export { DictionaryDashboard, CorpusDashboard, ParallelCorporaDashboard };
