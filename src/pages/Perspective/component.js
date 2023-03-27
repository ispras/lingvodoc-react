import React, { useContext, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Checkbox, Container, Dropdown, Icon, Input, Label, List, Menu, Message, Modal } from "semantic-ui-react";
import { gql, useMutation, useQuery } from "@apollo/client";
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

export const valencyVerbCasesMutation = gql`
  mutation valencyVerbCases($perspectiveId: LingvodocID!) {
    valency_verb_cases(perspective_id: $perspectiveId) {
      triumph
      xlsx_url
      verb_case_list
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

function renderData(getTranslation, data, sentences, setSentences, filter, setFilter, refInput) {
  let filterValue = filter;

  const {
    valency_verb_cases: { xlsx_url, verb_case_list }
  } = data;

  let final_list = verb_case_list;

  if (filter) {
    final_list = [];

    const filterLower = filter.toLowerCase();

    for (const item of verb_case_list) {
      const [verb_xlat, verb_case_sentence_list, verb_list] = item;
      let found = false;

      if (verb_xlat.toLowerCase().indexOf(filterLower) !== -1) {
        found = true;
      } else {
        for (const verb of verb_list) {
          if (verb.toLowerCase().indexOf(filterLower) !== -1) {
            found = true;
            break;
          }
        }
      }

      if (found) {
        final_list.push(item);
      }
    }
  }

  return (
    <>
      <div>
        <a href={xlsx_url}>{getTranslation("XLSX-exported data")}</a>
      </div>

      <div style={{ marginTop: "0.75em" }}>
        <Checkbox
          label={getTranslation("Show sentences")}
          checked={sentences}
          onChange={(e, { checked }) => setSentences(checked)}
        />
      </div>

      <div style={{ marginTop: "0.75em" }}>
        <Input
          placeholder={`${getTranslation("Verb lexeme/translation filter")}...`}
          onChange={(e, { value }) => {
            filterValue = value;
          }}
          onKeyPress={e => {
            if (e.key === "Enter") {
              setFilter(filterValue);
            }
          }}
          icon={<Icon name="filter" link onClick={() => setFilter(filterValue)} />}
        />
      </div>

      <div style={{ marginTop: "0.75em" }}>{`${final_list.length} ${getTranslation("verbs")}`}</div>

      <div style={{ marginTop: "1em" }}>
        <List>
          {final_list.map(([verb_xlat, case_verb_sentence_list, _]) => (
            <List.Item key={verb_xlat}>
              {verb_xlat}
              <List>
                {case_verb_sentence_list.map(([case_str, verb_list, verb_sentence_list]) =>
                  sentences ? (
                    <List.Item key={case_str}>
                      {case_str}
                      <List>
                        {verb_sentence_list.map(([verb, sentence_list]) => (
                          <List.Item key={verb}>
                            {verb}
                            <List>
                              {sentence_list.map((sentence, index) => (
                                <List.Item key={index}>{sentence}</List.Item>
                              ))}
                            </List>
                          </List.Item>
                        ))}
                      </List>
                    </List.Item>
                  ) : (
                    <List.Item key={case_str}>{`${case_str}: ${verb_list.join(", ")}`}</List.Item>
                  )
                )}
              </List>
            </List.Item>
          ))}
        </List>
      </div>
    </>
  );
}

const VerbCasesModal = ({ verbCases, setVerbCases, data, error, loading }) => {
  const getTranslation = useContext(TranslationContext);

  const [filter, setFilter] = useState("");
  const [sentences, setSentences] = useState(false);

  return (
    <Modal closeIcon onClose={() => setVerbCases(false)} open={verbCases} size="large">
      <Modal.Header>{getTranslation("Valency verb cases")}</Modal.Header>
      <Modal.Content>
        {loading && (
          <span>
            {`${getTranslation("Loading valency verb cases data")}...`} <Icon name="spinner" loading />
          </span>
        )}
        {error && (
          <Message negative compact>
            <Message.Header>{getTranslation("Valency verb cases error")}</Message.Header>
            <div style={{ marginTop: "0.25em" }}>
              {getTranslation(
                "Try closing the dialog and opening it again; if the error persists, please contact administrators."
              )}
            </div>
          </Message>
        )}
        {data && renderData(getTranslation, data, sentences, setSentences, filter, setFilter)}
      </Modal.Content>
    </Modal>
  );
};

const Tools = ({
  openCognateAnalysisModal,
  openPhonemicAnalysisModal,
  openPhonologyModal,
  launchSoundAndMarkup,
  launchValency,
  id /* perspective_id */,
  user_id,
  mode
}) => {
  const getTranslation = useContext(TranslationContext);

  const [verbCases, setVerbCases] = useState(false);

  const { data, error, loading } = useQuery(toolsQuery, { variables: { id } });
  const [valencyVerbCases, { data: vcd, error: vce, loading: vcl }] = useMutation(valencyVerbCasesMutation);

  if (loading || error) {
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

  return (
    <>
      <Dropdown
        className="lingvo-dropdown-item lingvo-dropdown-item_tools"
        item
        text={getTranslation("Tools")}
        icon={<i className="lingvo-icon lingvo-icon_arrow" />}
      >
        <Dropdown.Menu>
          {(user_id === 1 || user_id === author_id || edit_check) && (
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
            <>
              <Dropdown.Item onClick={() => valency(id, launchValency, getTranslation)}>
                {getTranslation("Valency data")}
              </Dropdown.Item>

              <Dropdown.Item
                onClick={() => {
                  valencyVerbCases({ variables: { perspectiveId: id } });
                  setVerbCases(true);
                }}
              >
                {getTranslation("Valency verb cases")}
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>

      <VerbCasesModal verbCases={verbCases} setVerbCases={setVerbCases} data={vcd} error={vce} loading={vcl} />
    </>
  );
};

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
