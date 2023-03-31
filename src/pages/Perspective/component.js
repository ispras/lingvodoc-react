import React, { useContext, useEffect } from "react";
import { connect } from "react-redux";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Container, Dropdown, Label, Menu } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { map } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, onlyUpdateForKeys, renderNothing, withHandlers, withState } from "recompose";

import { queryCounter } from "backend";
import Merge from "components/Merge";
import PerspectiveView from "components/PerspectiveView";
import TranslationContext from "Layout/TranslationContext";
import NotFound from "pages/NotFound";
import { compositeIdToString as id2str } from "utils/compositeId";
import { isAdmin } from "utils/isadmin";

import PerspectivePath from "./PerspectivePath";

import "./style.scss";

export const perspectiveIsHiddenOrDeletedQuery = gql`
  query perspectiveIsHiddenOrDeleted($id: LingvodocID!) {
    perspective(id: $id) {
      id
      is_hidden_for_client
      marked_for_deletion
      tree {
        id
        marked_for_deletion
      }
    }
  }
`;

export const launchSoundAndMarkupMutation = gql`
  mutation launchSoundAndMarkup($perspectiveId: LingvodocID!, $publishedMode: String!) {
    sound_and_markup(perspective_id: $perspectiveId, published_mode: $publishedMode) {
      triumph
    }
  }
`;

export const launchValencyMutation = gql`
  mutation launchValency($perspectiveId: LingvodocID!) {
    valency(perspective_id: $perspectiveId) {
      triumph
    }
  }
`;

const Counter = graphql(queryCounter)(({ data }) => {
  if (data.loading || data.error) {
    return null;
  }
  const {
    perspective: { counter }
  } = data;
  return ` (${counter})`;
});

const toolsQuery = gql`
  query tools($id: LingvodocID!) {
    perspective(id: $id) {
      id
      english_status: status(locale_id: 2)
      created_by {
        id
      }
      edit_check: role_check(subject: "perspective", action: "edit")
    }
  }
`;

const Tools = graphql(toolsQuery)(
  ({
    data,
    openCognateAnalysisModal,
    openPhonemicAnalysisModal,
    openPhonologyModal,
    launchSoundAndMarkup,
    launchValency,
    id /* perspective_id */,
    user_id,
    mode
  }) => {
    if (data.loading || data.error) {
      return null;
    }

    const {
      perspective: {
        english_status,
        created_by: { id: author_id },
        edit_check
      }
    } = data;

    const published = english_status === "Published" || english_status === "Limited access";

    const getTranslation = useContext(TranslationContext);

    return (
      <Dropdown
        className="lingvo-dropdown-item lingvo-dropdown-item_tools"
        item
        text={getTranslation("Tools")}
        icon={<i className="lingvo-icon lingvo-icon_arrow" />}
      >
        <Dropdown.Menu>
          {(isAdmin(user_id) || user_id === author_id || edit_check) && (
            <>
              <Dropdown.Item onClick={() => openCognateAnalysisModal(id, "acoustic")}>
                {getTranslation("Cognate acoustic analysis")}
              </Dropdown.Item>

              <Dropdown.Item onClick={() => openCognateAnalysisModal(id)}>
                {getTranslation("Cognate analysis")}
              </Dropdown.Item>

              <Dropdown.Item onClick={() => openCognateAnalysisModal(id, "multi_analysis")}>
                {getTranslation("Cognate multi-language analysis")}
              </Dropdown.Item>

              <Dropdown.Item onClick={() => openCognateAnalysisModal(id, "multi_reconstruction")}>
                {getTranslation("Cognate multi-language reconstruction")}
              </Dropdown.Item>

              <Dropdown.Item onClick={() => openCognateAnalysisModal(id, "multi_suggestions")} disabled={!published}>
                {getTranslation(
                  published
                    ? "Cognate multi-language suggestions"
                    : "Cognate multi-language suggestions (disabled, perspective is not published)"
                )}
              </Dropdown.Item>

              <Dropdown.Item onClick={() => openCognateAnalysisModal(id, "reconstruction")}>
                {getTranslation("Cognate reconstruction")}
              </Dropdown.Item>

              <Dropdown.Item onClick={() => openCognateAnalysisModal(id, "suggestions")} disabled={!published}>
                {getTranslation(
                  published ? "Cognate suggestions" : "Cognate suggestions (disabled, perspective is not published)"
                )}
              </Dropdown.Item>
            </>
          )}

          <Dropdown.Item onClick={() => openPhonemicAnalysisModal(id)}>
            {getTranslation("Phonemic analysis")}
          </Dropdown.Item>

          <Dropdown.Item onClick={() => openPhonologyModal(id)}>{getTranslation("Phonology")}</Dropdown.Item>

          <Dropdown.Item onClick={() => openPhonologyModal(id, "statistical_distance")}>
            {getTranslation("Phonological statistical distance")}
          </Dropdown.Item>

          <Dropdown.Item
            // eslint-disable-next-line no-use-before-define
            onClick={() => soundAndMarkup(id, mode, launchSoundAndMarkup, getTranslation)}
          >
            {getTranslation("Sound and markup")}
          </Dropdown.Item>

          {user_id != null && (
            <Dropdown.Item onClick={() => valency(id, launchValency, getTranslation)}>
              {getTranslation("Valency")}
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
);

const handlers = compose(
  withState("value", "updateValue", props => props.filter),
  withHandlers({
    onChange(props) {
      return event => props.updateValue(event.target.value);
    },
    onSubmit(props) {
      return event => {
        event.preventDefault();
        props.submitFilter(props.value);
      };
    }
  })
);

const Filter = handlers(({ value, onChange, onSubmit }) => {
  const getTranslation = useContext(TranslationContext);

  return (
    <div className="ui right aligned category search item">
      <form className="ui transparent icon input" onSubmit={onSubmit}>
        <input className="white" type="text" placeholder={getTranslation("Search")} value={value} onChange={onChange} />
        <button type="submit" className="white">
          <i className="search link icon" />
        </button>
      </form>
    </div>
  );
});

const tsakorpusIdStrSet = {
  "3796,6": null,
  "4222,7": null,
  "3235,7": null,
  "4083,7": null,
  "3421,8": null,
  "3648,8": null,
  "3814,9": null,
  "3872,9": null,
  "5180,9": null,
  "3428,9": null,
  "4448,9": null,
  "4830,11": null,
  "5039,22": null,
  "4830,27": null,
  "4473,32": null,
  "4443,37": null,
  "5124,45": null,
  "4447,99": null,
  "4447,130": null,
  "3539,769": null,
  "3391,9437": null,
  "4084,86722": null
};

const ModeSelector = compose(
  connect(state => state.user),
  onlyUpdateForKeys(["mode", "baseUrl", "filter", "user"])
)(
  ({
    mode,
    baseUrl,
    filter,
    submitFilter,
    openCognateAnalysisModal,
    openPhonemicAnalysisModal,
    openPhonologyModal,
    launchSoundAndMarkup,
    launchValency,
    id,
    user
  }) => {
    const getTranslation = useContext(TranslationContext);

    const modes = {};
    if (user.id !== undefined) {
      Object.assign(modes, {
        edit: {
          entitiesMode: "all",
          text: getTranslation("Edit"),
          component: PerspectiveView
        },
        publish: {
          entitiesMode: "all",
          text: getTranslation("Publish"),
          component: PerspectiveView
        }
      });
    }
    Object.assign(modes, {
      view: {
        entitiesMode: "published",
        text: getTranslation("View published"),
        component: PerspectiveView
      },
      contributions: {
        entitiesMode: "not_accepted",
        text: getTranslation("View contributions"),
        component: PerspectiveView
      },
      merge: {
        entitiesMode: "all",
        text: getTranslation("Merge suggestions"),
        component: Merge
      }
    });

    const tsakorpusFlag = tsakorpusIdStrSet.hasOwnProperty(id2str(id));

    return (
      <Menu tabular className="lingvo-perspective-menu">
        {map(modes, (info, stub) => (
          <Menu.Item key={stub} as={Link} to={`${baseUrl}/${stub}`} active={mode === stub}>
            {info.text}
            {info.component === PerspectiveView ? <Counter id={id} mode={info.entitiesMode} /> : null}
          </Menu.Item>
        ))}
        {tsakorpusFlag && (
          <Menu.Item key="corpus_search" href={`http://83.149.198.78:8080/${id[0]}_${id[1]}/search`}>
            {getTranslation("Corpus search")}
          </Menu.Item>
        )}
        <Tools
          id={id}
          user_id={user.id}
          mode={mode}
          openCognateAnalysisModal={openCognateAnalysisModal}
          openPhonemicAnalysisModal={openPhonemicAnalysisModal}
          openPhonologyModal={openPhonologyModal}
          launchSoundAndMarkup={launchSoundAndMarkup}
          launchValency={launchValency}
        />
        <Menu.Menu position="right">
          <Filter filter={filter} submitFilter={submitFilter} />
        </Menu.Menu>
      </Menu>
    );
  }
);

const soundAndMarkup = (perspectiveId, mode, launchSoundAndMarkup, getTranslation) => {
  launchSoundAndMarkup({
    variables: {
      perspectiveId,
      publishedMode: mode === "edit" ? "all" : "published"
    }
  }).then(
    () => {
      window.logger.suc(getTranslation("Sound and markup compilation is being created. Check out tasks for details."));
    },
    () => {
      window.logger.err(getTranslation("Failed to launch sound and markup compilation!"));
    }
  );
};

const valency = (perspectiveId, launchValency, getTranslation) => {
  launchValency({
    variables: {
      perspectiveId
    }
  }).then(
    () => {
      window.logger.suc(getTranslation("Valency data is being compiled. Check out tasks for details."));
    },
    () => {
      window.logger.err(getTranslation("Failed to launch valency data compilation!"));
    }
  );
};

const Perspective = ({
  data,
  perspective,
  init,
  submitFilter,
  openCognateAnalysisModal,
  openPhonemicAnalysisModal,
  openPhonologyModal,
  launchSoundAndMarkup,
  launchValency,
  user,
  location
}) => {
  const getTranslation = useContext(TranslationContext);
  useEffect(() => {
    init({ location });
  }, [init, location]);

  const { id, parent_id, mode, page, baseUrl } = perspective.params;
  if (!baseUrl || location.pathname.indexOf(baseUrl) === -1) {
    return null;
  }

  if (data.loading || data.error) {
    return null;
  }

  const { perspective: p } = data;
  if (p.is_hidden_for_client) {
    return (
      <div style={{ marginTop: "1em" }}>
        <Label>{getTranslation("Perspective is hidden and you don't have permissions to access it.")}</Label>
      </div>
    );
  }
  const isDeleted = p.marked_for_deletion || p.tree.some(entity => entity.marked_for_deletion);

  const modes = {};
  if (user.id !== undefined) {
    Object.assign(modes, {
      edit: {
        entitiesMode: "all",
        text: getTranslation("Edit"),
        component: PerspectiveView
      },
      publish: {
        entitiesMode: "all",
        text: getTranslation("Publish"),
        component: PerspectiveView
      }
    });
  }
  Object.assign(modes, {
    view: {
      entitiesMode: "published",
      text: getTranslation("View published"),
      component: PerspectiveView
    },
    contributions: {
      entitiesMode: "not_accepted",
      text: getTranslation("View contributions"),
      component: PerspectiveView
    },
    merge: {
      entitiesMode: "all",
      text: getTranslation("Merge suggestions"),
      component: Merge
    }
  });

  return (
    <div className="background-content lingvo-scrolling-content">
      <Container fluid className="perspective inverted lingvo-scrolling-content__container">
        {isDeleted && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              fontSize: "20px",
              color: "white"
            }}
          >
            {getTranslation("This entity was deleted")}
          </div>
        )}
        {!isDeleted && <PerspectivePath id={id} dictionary_id={parent_id} mode={mode} performRedirect />}
        {!isDeleted && (
          <ModeSelector
            mode={mode}
            id={id}
            baseUrl={baseUrl}
            filter={perspective.filter}
            submitFilter={submitFilter}
            openCognateAnalysisModal={openCognateAnalysisModal}
            openPhonemicAnalysisModal={openPhonemicAnalysisModal}
            openPhonologyModal={openPhonologyModal}
            launchSoundAndMarkup={launchSoundAndMarkup}
            launchValency={launchValency}
          />
        )}
        {!isDeleted && (
          <Routes>
            <Route path="/" element={<Navigate to={`${baseUrl}/view`} replace={true} />} />
            {map(modes, (info, stub) => (
              <Route
                key={stub}
                path={stub}
                element={
                  <info.component
                    id={id}
                    mode={mode}
                    entitiesMode={info.entitiesMode}
                    page={page}
                    filter={perspective.filter}
                    className="content"
                  />
                }
              />
            ))}
            <Route component={NotFound} />
          </Routes>
        )}
      </Container>
    </div>
  );
};

Perspective.propTypes = {
  perspective: PropTypes.object.isRequired,
  init: PropTypes.func.isRequired,
  submitFilter: PropTypes.func.isRequired,
  openCognateAnalysisModal: PropTypes.func.isRequired,
  openPhonemicAnalysisModal: PropTypes.func.isRequired,
  openPhonologyModal: PropTypes.func.isRequired,
  launchSoundAndMarkup: PropTypes.func.isRequired,
  launchValency: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default compose(
  connect(state => state.user),
  branch(({ perspective }) => !perspective.params || !perspective.params.id, renderNothing),
  graphql(perspectiveIsHiddenOrDeletedQuery, {
    options: ({ perspective }) => ({
      variables: { id: perspective.params.id }
    })
  }),
  graphql(launchSoundAndMarkupMutation, { name: "launchSoundAndMarkup" }),
  graphql(launchValencyMutation, { name: "launchValency" })
)(Perspective);
