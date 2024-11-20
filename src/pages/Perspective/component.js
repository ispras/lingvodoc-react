import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Checkbox,
  Container,
  Dimmer,
  Dropdown,
  Icon,
  Input,
  Label,
  List,
  Loader,
  Menu,
  Message,
  Modal
} from "semantic-ui-react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { map } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, onlyUpdateForKeys, renderNothing, withHandlers, withState } from "recompose";

import { chooseTranslation as T } from "api/i18n";
import { queryCounter } from "backend";
import CorporaView from "components/CorporaView";
import DictionaryProperties from "components/DictionaryPropertiesModal";
import Merge from "components/Merge";
import PerspectiveView from "components/PerspectiveView";
import { useMutation } from "hooks";
import TranslationContext from "Layout/TranslationContext";
import NotFound from "pages/NotFound";
import { compositeIdToString as id2str } from "utils/compositeId";

import PerspectivePath from "./PerspectivePath";

import "../../components/CognateAnalysisModal/style.scss";
import "./style.scss";
import { useSearchParams } from "react-router-dom";

export const perspectiveIsHiddenOrDeletedQuery = gql`
  query perspectiveIsHiddenOrDeleted($id: LingvodocID!) {
    perspective(id: $id) {
      id
      is_hidden_for_client
      marked_for_deletion
      additional_metadata {
        parallel
      }
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
      verb_data_list
    }
  }
`;

export const valencyVerbCasesExtendedMutation = gql`
  mutation valencyVerbCasesExtended($languageArgList: ObjectVal) {
    valency_verb_cases(language_arg_list: $languageArgList) {
      triumph
      xlsx_url
      verb_data_list
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
      columns {
        field {
          translations
        }
      }
    }
  }
`;

function renderData(getTranslation, data, sentences, setSentences, filter, setFilter) {
  let filterValue = filter;

  const {
    valency_verb_cases: { xlsx_url, verb_data_list }
  } = data;

  let final_list = verb_data_list;

  if (filter) {
    final_list = [];

    const filterLower = filter.toLowerCase();

    for (const item of verb_data_list) {
      const [verb_xlat, verb_case_sentence_list, verb_list] = item;

      let found = verb_xlat.toLowerCase().indexOf(filterLower) !== -1;

      if (!found) {
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
      <div className="lingvo-perspective-component-text" style={{ paddingTop: "6px", paddingBottom: "6px" }}>
        <a href={xlsx_url}>{getTranslation("XLSX-exported data")}</a>
      </div>

      <div style={{ marginTop: "0.75em" }}>
        <SentenceCheckbox sentences={sentences} setSentences={setSentences} />
      </div>

      <div style={{ marginTop: "1em" }}>
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
          className="lingvo-input-normal lingvo-input-normal_verbfilter"
        />
      </div>

      <div style={{ marginTop: "1em" }}>{`${final_list.length} ${getTranslation("verbs")}`}</div>

      <div style={{ marginTop: "1em" }}>
        <List>
          {final_list.map(([verb_xlat, case_verb_sentence_list, _]) => (
            <List.Item key={verb_xlat}>
              {verb_xlat}
              <List>
                {case_verb_sentence_list.map(([case_str, verb_list, verb_sentence_list]) =>
                  sentences ? (
                    <List.Item key={case_str}>
                      {case_str.toUpperCase()}
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
                    <List.Item key={case_str}>{`${case_str.toUpperCase()}: ${verb_list.join(", ")}`}</List.Item>
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
    <Modal
      closeIcon
      onClose={() => setVerbCases(false)}
      open={verbCases}
      dimmer
      centered
      size="large"
      className="lingvo-modal2"
    >
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

const verbPerpsectiveDataQuery = gql`
  query verbPerspectiveData($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      tree {
        id
        translations
        ... on Language {
          in_toc
        }
      }
    }
  }
`;

const verbLanguageDataQuery = gql`
  query verbLanguageData($languageId: LingvodocID!) {
    language_tree(language_id: $languageId) {
      tree
      languages {
        id
        translations
        dictionaries(deleted: false) {
          id
          translations
          status_translations
          perspectives(with_verb_data: true) {
            id
            translations
            status_translations
          }
        }
      }
    }
  }
`;

const verbLanguagesDataQuery = gql`
  query verbLanguagesData {
    languages(only_in_toc: true, in_tree_order: true) {
      id
      translations
      tree {
        id
        translations
      }
    }
  }
`;

/* Prepares language data for selection of perspectives. */
const prepareLanguage = async (client, baseLanguage) => {
  /* Getting all perspectives of the base language with verb data, including recursively perspectives of
   * sub-languages. */
  const {
    data: {
      language_tree: { tree: languageTree, languages }
    }
  } = await client.query({
    query: verbLanguageDataQuery,
    variables: { languageId: baseLanguage.id }
  });

  baseLanguage.separateByCorpora = false;
  baseLanguage.perspectiveList = [];

  const languageMap = {};

  for (const language of languages) {
    languageMap[id2str(language.id)] = language;
  }

  /* Going through all perspectives in ToC tree order, preparing their data for selection. */

  const f = (treeNode, treePath) => {
    const language = languageMap[id2str(treeNode[0])];
    const languageTreePath = [...treePath, language];

    if (treeNode.length > 1) {
      for (const treeSubNode of treeNode[1]) {
        f(treeSubNode, languageTreePath);
      }
    }

    for (const dictionary of language.dictionaries) {
      const dictionaryTreePath = [...languageTreePath, dictionary];

      for (const perspective of dictionary.perspectives) {
        const perspectiveData = {
          ...perspective,
          treePath: [...dictionaryTreePath, perspective],
          selected: true
        };
        baseLanguage.perspectiveList.push(perspectiveData);
      }
    }
  };

  f(languageTree, baseLanguage.treePath.slice(0, -1));
};

/* Loads language data for verb valency cases analysis. */
const getVerbSelectionLanguageData = async (client, initialLanguage, handler) => {
  const {
    data: { languages }
  } = await client.query({
    query: verbLanguagesDataQuery
  });

  const initialLanguageIdStr = id2str(initialLanguage.id);

  const baseLanguageList = [];
  const baseLanguageMap = {};

  for (const language of languages) {
    const languageIdStr = id2str(language.id);

    if (languageIdStr == initialLanguageIdStr) {
      baseLanguageList.push(initialLanguage);
      baseLanguageMap[languageIdStr] = initialLanguage;

      continue;
    }

    const baseLanguage = {
      id: language.id,
      translations: language.translations,
      treePath: language.tree.slice().reverse()
    };

    baseLanguage.treePathStr = baseLanguage.treePath.map(e => T(e.translations)).join(" \u203a ");

    baseLanguageList.push(baseLanguage);
    baseLanguageMap[languageIdStr] = baseLanguage;
  }

  if (!baseLanguageMap.hasOwnProperty(initialLanguageIdStr)) {
    baseLanguageList.push(initialLanguage);
    baseLanguageMap[languageIdStr] = initialLanguage;
  }

  handler(baseLanguageList, baseLanguageMap);
};

const VerbCasesSelectionLanguage = ({ language, client, info, setSelectedLanguageList }) => {
  const getTranslation = useContext(TranslationContext);

  const [initialized, setInitialized] = useState(language.perspectiveList);

  /* If the language doesn't have perspective selection data, we prepare it. */

  useEffect(() => {
    if (!language.perspectiveList) {
      prepareLanguage(client, language).then(() => {
        setInitialized(true);

        info.selectedCount += language.perspectiveList.length;

        const canComputeFlag = info.selectedCount > 0;

        if (info.canComputeFlag != canComputeFlag) {
          info.canComputeFlag = canComputeFlag;

          if (info.setCanComputeFlag) {
            info.setCanComputeFlag(canComputeFlag);
          }
        }
      });
    }
  }, [language]);

  if (!initialized) {
    return (
      <div className="lingvo-cognate-loading">
        {getTranslation("Loading perspective data")}... <Icon name="spinner" loading />
      </div>
    );
  }

  return (
    <div className="lingvo-cognate-language">
      <h2 className="lingvo-verb-case-language-header">
        <Breadcrumb
          icon="right angle"
          sections={language.treePath.map(e => ({
            key: e.id,
            content: T(e.translations),
            link: false
          }))}
        />
        <i
          className="lingvo-icon lingvo-icon_trash"
          onClick={e => {
            e.stopPropagation();

            /* First updating can compute state if required. */

            info.selectedCount -= language.perspectiveList.reduce(
              (n, perspective) => (perspective.selected ? n + 1 : n),
              0
            );

            const canComputeFlag = info.selectedCount > 0;

            if (info.canComputeFlag != canComputeFlag) {
              info.canComputeFlag = canComputeFlag;

              if (info.setCanComputeFlag) {
                info.setCanComputeFlag(canComputeFlag);
              }
            }

            /* Then actually removing the language. */

            const languageIdStr = id2str(language.id);

            info.selectedLanguageList = info.selectedLanguageList.filter(
              selectedLanguage => id2str(selectedLanguage.id) != languageIdStr
            );

            info.selectedLanguageIdSet.delete(languageIdStr);

            setSelectedLanguageList(info.selectedLanguageList);
          }}
        />
      </h2>

      {language.perspectiveList.map(perspective => (
        <div key={perspective.id} className="lingvo-cognate-checkbox lingvo-cognate-checkbox_lang">
          <Checkbox
            className="lingvo-checkbox lingvo-checkbox_labeled"
            defaultChecked={perspective.selected}
            onChange={(e, { checked }) => {
              perspective.selected = checked;

              const canComputeFlag = (info.selectedCount += checked ? +1 : -1) > 0;

              if (canComputeFlag != info.canComputeFlag) {
                info.canComputeFlag = canComputeFlag;
                if (info.setCanComputeFlag) {
                  info.setCanComputeFlag(canComputeFlag);
                }
              }
            }}
            label={
              <label>
                <Breadcrumb
                  style={perspective.selected ? {} : { opacity: 0.5 }}
                  icon="right angle"
                  sections={perspective.treePath.map(e => ({
                    key: e.id,
                    content: e.hasOwnProperty("status_translations")
                      ? `${T(e.translations)} (${T(e.status_translations)})`
                      : T(e.translations),
                    link: false
                  }))}
                />
              </label>
            }
          />
        </div>
      ))}

      {language.perspectiveList.length > 1 && (
        <div className="lingvo-cognate-checkbox lingvo-cognate-checkbox_lang">
          <Checkbox
            className="lingvo-checkbox lingvo-checkbox_labeled"
            defaultChecked={language.separateByCorpora}
            onChange={(e, { checked }) => {
              language.separateByCorpora = checked;
            }}
            label={getTranslation("Separate by corpora")}
          />
        </div>
      )}
    </div>
  );
};

const VerbCasesContent = ({ perspectiveId, close, client, info }) => {
  const getTranslation = useContext(TranslationContext);

  const [selectedLanguageList, setSelectedLanguageList] = useState(undefined);
  const [availableLanguageList, setAvailableLanguageList] = useState(undefined);

  useEffect(() => {
    /* Loads base language/corpora selection data for verb valency cases analysis. */
    const getVerbSelectionData = async (perspectiveId, client, handler) => {
      const {
        data: { perspective }
      } = await client.query({
        query: verbPerpsectiveDataQuery,
        variables: { perspectiveId }
      });

      /* Starting by finding the root language of the language group we are to analyze verb valency cases.*/

      const tree = perspective.tree;

      const baseLanguage = {
        ...tree[tree.length - 1],
        treePath: tree.slice(tree.length - 1, tree.length).reverse()
      };

      for (let i = 0; i < tree.length; i++) {
        if (tree[i].in_toc) {
          Object.assign(baseLanguage, tree[i]);
          baseLanguage.treePath = tree.slice(i, tree.length).reverse();
          break;
        }
      }

      baseLanguage.treePathStr = baseLanguage.treePath.map(e => T(e.translations)).join(" \u203a ");

      await prepareLanguage(client, baseLanguage);

      handler(baseLanguage, baseLanguage.perspectiveList.length);
    };

    getVerbSelectionData(perspectiveId, client, (initialLanguage, selectedCount) => {
      /* Finishing first phase of initialization, with the base language. */

      info.initialLanguage = initialLanguage;

      info.selectedLanguageList = [initialLanguage];
      info.selectedLanguageIdSet = new Set([id2str(initialLanguage.id)]);
      info.selectedCount = selectedCount;

      setSelectedLanguageList(info.selectedLanguageList);

      info.canComputeFlag = selectedCount > 0;

      if (info.setCanComputeFlag) {
        info.setCanComputeFlag(info.canComputeFlag);
      }

      getVerbSelectionLanguageData(client, initialLanguage, (baseLanguageList, baseLanguageMap) => {
        /* Finishing second phase of initialization, got list of languages to select. */

        setAvailableLanguageList(baseLanguageList);
        info.baseLanguageMap = baseLanguageMap;
      });
    });
  }, [perspectiveId, client, info]);

  if (!selectedLanguageList) {
    return (
      <Modal.Content>
        <Dimmer active={true} inverted>
          <Loader>{`${getTranslation("Loading")}...`}</Loader>
        </Dimmer>
      </Modal.Content>
    );
  }

  const onSelectLanguage = (event, data) => {
    const baseLanguage = info.baseLanguageMap[data.value];

    info.selectedLanguageList.push(baseLanguage);
    info.selectedLanguageIdSet.add(id2str(baseLanguage.id));

    setSelectedLanguageList([...info.selectedLanguageList]);

    /* If selected language already has loaded info, we update selection state right now. */

    if (baseLanguage.perspectiveList) {
      info.selectedCount += baseLanguage.perspectiveList.reduce(
        (n, perspective) => (perspective.selected ? n + 1 : n),
        0
      );

      const canComputeFlag = info.selectedCount > 0;

      if (info.canComputeFlag != canComputeFlag) {
        info.canComputeFlag = canComputeFlag;

        if (info.setCanComputeFlag) {
          info.setCanComputeFlag(canComputeFlag);
        }
      }
    }
  };

  return (
    <Modal.Content>
      {selectedLanguageList.map(language => (
        <VerbCasesSelectionLanguage
          key={language.id}
          language={language}
          client={client}
          info={info}
          setSelectedLanguageList={setSelectedLanguageList}
        />
      ))}

      <div style={{ paddingTop: "1em" }}>
        {availableLanguageList ? (
          <Dropdown
            className="lingvo-dropdown-select"
            icon={<i className="lingvo-icon lingvo-icon_arrow" />}
            fluid
            placeholder={getTranslation("Add language")}
            search
            selection
            options={availableLanguageList

              .filter(language => !info.selectedLanguageIdSet.has(id2str(language.id)))

              .map(language => ({
                key: language.id,
                value: id2str(language.id),
                text: language.treePathStr
              }))}
            value={""}
            onChange={onSelectLanguage}
          />
        ) : (
          <div className="lingvo-cognate-loading">
            {getTranslation("Loading language data")}... <Icon name="spinner" loading />
          </div>
        )}
      </div>
    </Modal.Content>
  );
};

const SentenceCheckbox = ({ sentences, setSentences }) => {
  const getTranslation = useContext(TranslationContext);

  const [pending, setPending] = useState([false, sentences]);

  /*
   * Sentence show state.
   *
   * Can't have useTransition until react is ^18, so trying to do something similar ourselves with state and
   * effect.
   *
   * On checkbox change we first indicate intended state, then actually initiate state change.
   */

  useEffect(() => {
    if (pending[0]) {
      setSentences(pending[1]);
      setPending([false, pending[1]]);
    }
  }, [pending]);

  return (
    <Checkbox
      label={
        pending[0]
          ? `${getTranslation(pending[1] ? "Showing sentences" : "Hiding sentences")}...`
          : getTranslation("Show sentences")
      }
      disabled={pending[0]}
      checked={sentences}
      onChange={(e, { checked }) => setPending([true, checked])}
      className="lingvo-checkbox lingvo-checkbox_labeled"
    />
  );
};

const VerbCasesResult = ({ valency_verb_cases }) => {
  const getTranslation = useContext(TranslationContext);

  const [filter, setFilter] = useState("");
  const [sentences, setSentences] = useState(false);

  let filterValue = filter;

  const { xlsx_url, verb_data_list } = valency_verb_cases;

  let verbDataList = verb_data_list;

  if (filter) {
    verbDataList = [];

    const filterLower = filter.toLowerCase();

    for (const item of verb_data_list) {
      const [verb_xlat, language_list, verb_list] = item;

      let found = verb_xlat.toLowerCase().indexOf(filterLower) !== -1;

      if (!found) {
        for (const verb of verb_list) {
          if (verb.toLowerCase().indexOf(filterLower) !== -1) {
            found = true;
            break;
          }
        }
      }

      if (found) {
        verbDataList.push(item);
      }
    }
  }

  return (
    <Modal.Content>
      <div className="lingvo-perspective-component-text" style={{ paddingTop: "6px", paddingBottom: "6px" }}>
        <a href={xlsx_url}>{getTranslation("XLSX-exported data")}</a>
      </div>

      <div style={{ marginTop: "0.75em" }}>
        <SentenceCheckbox sentences={sentences} setSentences={setSentences} />
      </div>

      <div style={{ marginTop: "1em" }}>
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
          className="lingvo-input-normal lingvo-input-normal_verbfilter"
        />
      </div>

      <div style={{ marginTop: "1em" }}>{`${verbDataList.length} ${getTranslation("verbs")}`}</div>

      <div style={{ marginTop: "1em" }}>
        <List>
          {verbDataList.map(([verb_xlat, language_list, _]) => (
            <List.Item key={verb_xlat}>
              {verb_xlat}
              <List>
                {language_list.map(([language_str, case_verb_sentence_list]) => (
                  <List.Item key={language_str}>
                    {language_str}
                    <List>
                      {case_verb_sentence_list.map(([case_str, verb_list, verb_sentence_list]) =>
                        sentences ? (
                          <List.Item key={case_str}>
                            {case_str.toUpperCase()}
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
                          <List.Item key={case_str}>{`${case_str.toUpperCase()}: ${verb_list.join(", ")}`}</List.Item>
                        )
                      )}
                    </List>
                  </List.Item>
                ))}
              </List>
            </List.Item>
          ))}
        </List>
      </div>
    </Modal.Content>
  );
};

const VerbCasesActionResult = ({ close, client, info }) => {
  const getTranslation = useContext(TranslationContext);

  const [computing, setComputing] = useState(false);
  const [canComputeFlag, setCanComputeFlag] = useState(info.canComputeFlag);
  const [result, setResult] = useState(null);

  useEffect(() => {
    info.setCanComputeFlag = setCanComputeFlag;

    if (info.canComputeFlag != canComputeFlag) {
      setCanComputeFlag(info.canComputeFlag);
    }

    return () => {
      info.setCanComputeFlag = null;
    };
  }, []);

  const onCompute = () => {
    setComputing(true);

    const languageArgList = info.selectedLanguageList

      .map(language => [
        language.id,
        language.perspectiveList.filter(perspective => perspective.selected).map(perspective => perspective.id),
        language.separateByCorpora
      ])

      .filter(item => item[1].length > 0);

    client
      .mutate({
        mutation: valencyVerbCasesExtendedMutation,
        variables: { languageArgList }
      })
      .then(
        ({ data }) => {
          setComputing(false);
          setResult(data);
        },
        () => {
          setComputing(false);
          window.logger.err(getTranslation("Failed to compute valency verb cases analysis."));
        }
      );
  };

  return (
    <>
      <Modal.Actions style={result ? { borderBottom: "1px solid rgba(34,36,38,.15)" } : {}}>
        <Button
          content={
            computing ? (
              <span>
                {getTranslation("Computing")}... <Icon name="spinner" loading />
              </span>
            ) : (
              getTranslation("Compute")
            )
          }
          onClick={onCompute}
          disabled={!canComputeFlag || computing}
          className="lingvo-button-violet"
        />
        <Button content={getTranslation("Close")} onClick={close} className="lingvo-button-basic-black" />
      </Modal.Actions>

      {result && <VerbCasesResult valency_verb_cases={result.valency_verb_cases} />}
    </>
  );
};

const VerbCasesExtendedModal = ({ verbCases, setVerbCases, perspectiveId }) => {
  const getTranslation = useContext(TranslationContext);
  const client = useApolloClient();
  const infoRef = useRef({});

  const close = () => setVerbCases(false);

  return (
    <Modal closeIcon onClose={close} open={verbCases} dimmer size="fullscreen" className="lingvo-modal2">
      <Modal.Header>{getTranslation("Valency verb cases (extended)")}</Modal.Header>
      <VerbCasesContent perspectiveId={perspectiveId} close={close} client={client} info={infoRef.current} />
      <VerbCasesActionResult close={close} client={client} info={infoRef.current} />
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
  const [verbCasesExtended, setVerbCasesExtended] = useState(false);

  const { data, error, loading } = useQuery(toolsQuery, { variables: { id } });
  const [valencyVerbCases, { data: vcd, error: vce, loading: vcl }] = useMutation(valencyVerbCasesMutation);

  if (loading || error) {
    return null;
  }

  const {
    perspective: {
      english_status,
      created_by: { id: author_id },
      edit_check,
      columns
    }
  } = data;

  const isMorphology = ({ field: { translations: tt } }) =>
    Object.values(tt).some(t => t.toLowerCase().includes("affix") || t.toLowerCase().includes("аффикс"));
  const glottMode = columns.some(isMorphology) ? "morphology" : "swadesh";
  const glottMenu = columns.some(isMorphology) ? "Morphology distance" : "Glottochronology (Swadesh-Starostin)";
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

              <Dropdown.Item onClick={() => openCognateAnalysisModal(id, glottMode)}>
                {getTranslation(glottMenu)}
              </Dropdown.Item>

              <Dropdown.Item onClick={() => openCognateAnalysisModal(id, `multi_${glottMode}`)}>
                {getTranslation(`${glottMenu} multi-language`)}
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

              <Dropdown.Item
                onClick={() => {
                  setVerbCasesExtended(true);
                }}
              >
                {getTranslation("Valency verb cases (extended)")}
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>

      <VerbCasesModal verbCases={verbCases} setVerbCases={setVerbCases} data={vcd} error={vce} loading={vcl} />

      <VerbCasesExtendedModal verbCases={verbCasesExtended} setVerbCases={setVerbCasesExtended} perspectiveId={id} />
    </>
  );
};

const handlers = compose(
  withState("value", "updateValue", props => props.filter.value),
  withState("isCaseSens", "setCaseSens", true),
  withState("isRegexp", "setRegexp", false),
  withHandlers({
    onChange(props) {
      return event => props.updateValue(event.target.value);
    },
    onSubmit(props) {
      return event => {
        event.preventDefault();
        props.submitFilter(props.value, props.isCaseSens, props.isRegexp);
      };
    },
    onToggleCaseSens(props) {
      return (e, { checked }) => props.setCaseSens(checked);
    },
    onToggleRegexp(props) {
      return (e, { checked }) => props.setRegexp(checked);
    }
  })
);

const Filter = handlers(({ value, onChange, onSubmit, isCaseSens, onToggleCaseSens, isRegexp, onToggleRegexp }) => {
  const getTranslation = useContext(TranslationContext);

  return (
    <div className="ui right aligned category search item">
      <form className="ui transparent icon input" onSubmit={onSubmit}>
        <input className="white" type="text" placeholder={getTranslation("Search")} value={value} onChange={onChange} />
        <button type="submit" className="white">
          <i className="search link icon" />
        </button>
        <div className="lingvo-search-entities__checkboxes">
          <Checkbox
            label={getTranslation("A≠a")}
            checked={isCaseSens}
            onChange={onToggleCaseSens}
            className="lingvo-checkbox_labeled"
          />
          <Checkbox
            label={getTranslation("a.*")}
            checked={isRegexp}
            onChange={onToggleRegexp}
            className="lingvo-checkbox_labeled"
          />
        </div>
      </form>
    </div>
  );
});

const uploadPerspective = gql`
  mutation uploadPerspective($id: LingvodocID!, $debugFlag: Boolean) {
    tsakorpus(perspective_id: $id, debug_flag: $debugFlag) {
      triumph
    }
  }
`;

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

    const [runUploadPerspective, {data, error, loading}] = (
      useMutation(uploadPerspective, { variables: { id } }));

    useEffect(() => { runUploadPerspective(); }, []);

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
      <Menu tabular className="lingvo-perspective-menu">
        {map(modes, (info, stub) => (
          <Menu.Item key={stub} as={Link} to={`${baseUrl}/${stub}`} active={mode === stub}>
            {info.text}
            {info.component === PerspectiveView ? <Counter id={id} mode={info.entitiesMode} /> : null}
          </Menu.Item>
        ))}
        { (loading || (!error && data && data.tsakorpus.triumph)) && (
          <Menu.Item
            key="corpus_search"
            onClick={() => !loading && window.open(`http://83.149.198.78/${id[0]}_${id[1]}/search`, "_blank")}
            content={
              loading ? (
                <span>
                  {getTranslation("Uploading")}... <Icon name="spinner" loading />
                </span>
              ) : (
                getTranslation("Corpus search")
            )}
          />
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
          <Filter
            filter={filter}
            submitFilter={submitFilter}
          />
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

  // Renewing filter on every opened perspective
  useEffect(() => { submitFilter("", true, false) }, []);

  const [dndProvider, setDndProvider] = useState(true);

  const disableDNDProvider = useCallback(() => {
    setDndProvider(false);
  }, [dndProvider]);

  const enableDNDProvider = useCallback(() => {
    setDndProvider(true);
  }, [dndProvider]);

  const { id, parent_id, mode, page, baseUrl } = perspective.params;
  const { value: filter } = perspective.filter;

  const [searchParams, _] = useSearchParams();
  const urlPageParam = parseInt(searchParams.get("page"));
  const urlPage = isNaN(urlPageParam) ? 1 : urlPageParam;

  const [activePage, setActivePage] = useState(page);
  useEffect(() => setActivePage(page), [page, filter]);

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
  const parallelCorpora = p.additional_metadata.parallel;
  const Viewer = parallelCorpora ? CorporaView : PerspectiveView;

  const modes = {};
  if (user.id !== undefined) {
    Object.assign(modes, {
      edit: {
        entitiesMode: "all",
        text: getTranslation("Edit"),
        component: Viewer
      },
      publish: {
        entitiesMode: "all",
        text: getTranslation("Publish"),
        component: Viewer
      }
    });
  }
  Object.assign(modes, {
    view: {
      entitiesMode: "published",
      text: getTranslation("View published"),
      component: Viewer
    },
    contributions: {
      entitiesMode: "not_accepted",
      text: getTranslation("View contributions"),
      component: Viewer
    },
    merge: {
      entitiesMode: "all",
      text: getTranslation("Merge suggestions"),
      component: Merge
    }
  });

  return (
    <div
      className={
        (parallelCorpora && "background-content lingvo-scrolling-content lingvo-scrolling-content_corpora") ||
        "background-content lingvo-scrolling-content"
      }
    >
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
        {!isDeleted && (
          <PerspectivePath
            id={id}
            dictionary_id={parent_id}
            mode={mode}
            performRedirect
            disableDNDProvider={disableDNDProvider}
          />
        )}
        {!isDeleted && (
          <ModeSelector
            mode={mode}
            id={id}
            baseUrl={baseUrl}
            filter={filter}
            isCaseSens={perspective.filter.isCaseSens}
            isRegexp={perspective.filter.isRegexp}
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
                    page={filter.length ? activePage : urlPage}
                    filter={filter}
                    isCaseSens={perspective.filter.isCaseSens}
                    isRegexp={perspective.filter.isRegexp}
                    className="content"
                    activeDndProvider={dndProvider}
                    changePage={newPage => setActivePage(newPage)}
                  />
                }
              />
            ))}
            <Route component={NotFound} />
          </Routes>
        )}

        <DictionaryProperties enableDNDProvider={enableDNDProvider} />
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
