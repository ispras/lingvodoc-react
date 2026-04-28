import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Container, Header, Icon, Menu, Message, Tab } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import { additionalClient } from "apolo";
import { isEqual } from "lodash";

import { getId } from "api/user";
import {
  getLanguagesForSearch,
  getLanguageTree,
  getLanguageTreeProxy,
  getTocGrants,
  getTocOrganizations,
  localDictionaryInfo,
  proxyDictionaryInfo,
  getPermissionsBulk
} from "backend";
import BackTopButton from "components/BackTopButton";
import LanguageSearchField from "components/LanguageSearchField";
import LanguageTree from "components/LanguageTree";
import { GrantNode, IndividualNode, LanguageNode, OrganizationNode } from "components/LanguageTree/node";
import Placeholder from "components/Placeholder";
import GrantsToc from "components/TableOfContents/grants";
import LanguagesToc from "components/TableOfContents/languages";
import OrganizationsToc from "components/TableOfContents/organizations";
import config from "config";
import { useTranslations } from "hooks";
import { compositeIdToString, stringToCompositeId } from "utils/compositeId";

import SortModeSelector from "./sort_mode_selector";

import "./styles.scss";

function groupMaps(groups) {
  const groupMap = {};

  const allGroupDictionaryIdSet = new Set();
  const groupDictionaryIdSetMap = { "": allGroupDictionaryIdSet };

  groups.forEach(group => {
    const groupIdStr = String(group.id);
    groupMap[groupIdStr] = group;

    const dictionaryIdSet = new Set();

    for (const dictionaryId of group.additional_metadata.participant) {
      const dictionarIdStr = compositeIdToString(dictionaryId);

      dictionaryIdSet.add(dictionarIdStr);
      allGroupDictionaryIdSet.add(dictionarIdStr);
    }

    groupDictionaryIdSetMap[groupIdStr] = dictionaryIdSet;
  });

  return [groupMap, groupDictionaryIdSetMap];
}

function constructTree(
  data,
  sortMode,
  entityId,
  entityAll,
  grantMap,
  grantDictionaryIdSetMap,
  organizationMap,
  organizationDictionaryIdSetMap,
  proxyPermission,
  selected,
  setSelected,
  setDataTreeCommon,
  refreshLangTree,
  localPermission,
  proxyData
) {

  const startstamp = Date.now();
  const localEditPermission = (
    localPermission?.permission_lists.edit?.map(obj => obj.id.toString()));
  const { languages: localLanguages, tree: frozenTree } = data.language_tree;
  let tree = structuredClone(frozenTree);
  const languageMap = { common: {} };

  if (!proxyData) {

    if (tree === null) {
      return null;
    }

    localLanguages.forEach(language => {
      setDataTreeCommon(data);
      languageMap.common[compositeIdToString(language.id)] = language;
    });

  } else {

    if (tree === null) {
      tree = [null, []];
    }

    console.log("Starting language trees merging...");

    // Merging local and proxy language maps

    const { languages: proxyLanguages } = proxyData.language_tree;
    const languageData = {
      local: structuredClone(localLanguages),
      proxy: structuredClone(proxyLanguages)
    };
    const dictionaryMap = {};
    const perspectiveMap = {};

    // Getting maps of languages, dictionaries and perspectives by id
    // Objects from these three maps must be interlinked.
    // So dictionaryMap.local[dictId] must point to object
    // from languageMap.local[langId].dictionaries
    // (!) but be not its copy (!)

    console.log("Mapping tree...");

    ['local', 'proxy'].forEach(side => {

      languageMap[side] = {};
      dictionaryMap[side] = {};
      perspectiveMap[side] = {};

      languageData[side].forEach(language => {
        const lang_id = compositeIdToString(language.id);

        // Debugging
        if (languageMap[side].hasOwnProperty(lang_id)) {
          console.log(`Collision for language ${lang_id}`);
          return;
        }

        languageMap[side][lang_id] = language;

        // Debugging
        if (lang_id === '3619,28523') {
          console.log(`${lang_id}: ${language.translations[2]}`);
        }

        language.dictionaries.forEach(dictionary => {
          const dict_id = compositeIdToString(dictionary.id);

          // Debugging
          if (dictionaryMap[side].hasOwnProperty(dict_id)) {
            console.log(`Collision for dictionary ${dict_id}`);
            return;
          }

          dictionaryMap[side][dict_id] = dictionary;

          dictionary.perspectives.forEach(perspective => {
            const pers_id = compositeIdToString(perspective.id);

            // Debugging
            if (perspectiveMap[side].hasOwnProperty(pers_id)) {
              console.log(`Collision for perspective ${pers_id}`);
              return;
            }

            perspectiveMap[side][pers_id] = perspective;
          });
        });
      });
    });

    // Getting diffs and intersection of lang/dict/pers lists between local and proxy sides
    [languageMap, dictionaryMap, perspectiveMap].forEach(amap => {

      const local_set = new Set(Object.keys(amap.local));
      const proxy_set = new Set(Object.keys(amap.proxy));

      amap.local_diff = local_set.difference(proxy_set);
      amap.proxy_diff = proxy_set.difference(local_set);
      amap.union = local_set.union(proxy_set);
      amap.intersection = local_set.intersection(proxy_set);
    });

    // Marking object in input map as 'single' if corresponding '_diff' list includes its id
    ['local', 'proxy'].forEach(side => {
      const side_diff = `${side}_diff`;

      for (const [langId, langObj] of Object.entries(languageMap[side])) {
        langObj.single = languageMap[side_diff].has(langId) && side;

        langObj.dictionaries.forEach(dictObj => {
          const dictId = compositeIdToString(dictObj.id);
          dictObj.single = dictionaryMap[side_diff].has(dictId) && side;

          dictObj.perspectives.forEach(persObj => {
            const persId = compositeIdToString(persObj.id);
            persObj.single = perspectiveMap[side_diff].has(persId) && side;
          });
        });
      }
    });

    // Insert language from proxy with its parents
    // to local tree since common point or from the top
    function f(lang) {
      languageMap.intersection.add(compositeIdToString(lang.id));
      let parents = [lang.id];
      let parent_id = lang.parent_id;
      let parent_id_str = compositeIdToString(parent_id);
      let common_point = languageMap.intersection.has(parent_id_str) && parent_id_str;

      while (parent_id && !common_point) {
        languageMap.intersection.add(parent_id_str);
        parents = [parent_id, [parents]];
        parent_id = languageMap.proxy[parent_id_str].parent_id;
        parent_id_str = compositeIdToString(parent_id);
        common_point = languageMap.intersection.has(parent_id_str) && parent_id_str;
      }

      let stub = tree[1];

      function g(stb) {
        if (!common_point) {
          return;
        }

        for (const s of stb) {
          const local_id = compositeIdToString(s[0]);

          if (local_id === common_point) {
            if (s.length === 1) {
              s[s.length] = [];
            }
            stub = s[1];
            break;

          } else if (s.length > 1) {
            g(s[1]);
          }
        }
      }

      // Cutting off tree and add languages from proxy at beginning of branch
      g(stub);
      stub.unshift(parents);
    }

    // Iterate through language_union (local+proxy)
    // to collect languages into common map.
    // (!) After this block languageMap.local and
    // dictionaryMap.local will contain merged data (!)

    console.log("Merging...");

    languageMap.union.forEach(lang_id => {

      // If language exists only on proxy side
      if (languageMap.proxy_diff.has(lang_id)) {
        const lang_result = languageMap.proxy[lang_id];
        languageMap.common[lang_id] = lang_result;
        f(lang_result);

      } else {
        const lang_result = languageMap.local[lang_id];
        languageMap.common[lang_id] = lang_result;

        // If language is on the both sides
        if (languageMap.intersection.has(lang_id)) {
          const dict_union = new Set([
            ...languageMap.local[lang_id].dictionaries,
            ...languageMap.proxy[lang_id].dictionaries]
            .map(obj => compositeIdToString(obj.id)));

          // Debugging
          if (lang_id === '3619,28523') {
            console.log(`${lang_id}: ${lang_result.translations[2]}`);
          }

          // Iterate through dictionary_union for current language
          dict_union.forEach(dict_id => {

            // If dictionary exists only on proxy side
            if (dictionaryMap.proxy_diff.has(dict_id)) {
              const dict_result = dictionaryMap.proxy[dict_id];
              lang_result.dictionaries.push(dict_result);

            } else {
              const dict_result = dictionaryMap.local[dict_id];

              // Debugging
              if (lang_id === '3619,28523' && dict_id === '11560,775') {
                console.log(`${dict_id}: ${dict_result.translations[2]}`);
              }

              // If dictionary is on the both sides
              if (dictionaryMap.intersection.has(dict_id)) {
                const pers_union = new Set([
                  ...dictionaryMap.local[dict_id].perspectives,
                  ...dictionaryMap.proxy[dict_id].perspectives]
                  .map(obj => compositeIdToString(obj.id)));

                // Iterate through perspective_union for current dictionary
                pers_union.forEach(pers_id => {

                  // If perspective exists only on proxy side
                  if (perspectiveMap.proxy_diff.has(pers_id)) {
                    const pers_result = perspectiveMap.proxy[pers_id];
                    dict_result.perspectives.push(pers_result);
                  }
                });
              }
            }
          });
        }
      }
    });
  }

  // Construct common data to use in LanguageSearchField component
  setDataTreeCommon({language_tree: {languages: Object.values(languageMap.common)}});

  const finishstamp = Date.now();
  console.log(`The trees are merged successfully in ${(finishstamp - startstamp)/1000} sec`);

  let groupMap = undefined;
  let groupDictionaryIdSetMap = undefined;

  let NodeComponent = undefined;

  if (sortMode === "grant") {
    groupMap = grantMap;
    groupDictionaryIdSetMap = grantDictionaryIdSetMap;

    NodeComponent = GrantNode;
  } else if (sortMode === "organization") {
    groupMap = organizationMap;
    groupDictionaryIdSetMap = organizationDictionaryIdSetMap;

    NodeComponent = OrganizationNode;
  }

  /* For efficiency we do not transform the tree structure in any way and use it directly. */

  if (sortMode === "language") {
    return entityAll ? (
      tree[1].map((node, index) => (
        <LanguageNode
          key={index}
          node={node}
          languageMap={languageMap.common}
          selected={selected}
          setSelected={setSelected}
          proxyData={proxyPermission}
          refreshLangTree={refreshLangTree}
          localPermission={localEditPermission}
        />
      ))
    ) : (
      <LanguageNode
        node={tree}
        languageMap={languageMap.common}
        selected={selected}
        setSelected={setSelected}
        proxyData={proxyPermission}
        refreshLangTree={refreshLangTree}
        localPermission={localEditPermission}
      />
    );
  } else {
    return entityAll ? (
      tree[1].map((node, index) =>
        node[0] ? (
          <NodeComponent
            key={index}
            node={node}
            groupMap={groupMap}
            dictionaryIdSet={groupDictionaryIdSetMap[String(node[0])]}
            languageMap={languageMap.common}
            selected={selected}
            setSelected={setSelected}
            proxyData={proxyPermission}
          />
        ) : (
          <IndividualNode
            key={index}
            node={node}
            languageMap={languageMap.common}
            dictionaryIdSet={groupDictionaryIdSetMap[""]}
            selected={selected}
            setSelected={setSelected}
            proxyData={proxyPermission}
          />
        )
      )
    ) : (
      <NodeComponent
        node={[Number(entityId), tree[1]]}
        groupMap={groupMap}
        dictionaryIdSet={groupDictionaryIdSetMap[entityId]}
        languageMap={languageMap.common}
        selected={selected}
        setSelected={setSelected}
        proxyData={proxyPermission}
      />
    );
  }
}

const Wrapper = ({ tree, ...rest }) => {
  const { getTranslation } = useTranslations();

  /* 1-frame pause with placeholder for smoother UX before rendering the tree when we don't have to wait for
   * it in case it is large. */

  const [pause, setPause] = useState(!!tree);

  useEffect(() => {
    if (pause) {
      setTimeout(() => setPause(false), 0);
    }
  }, [pause]);

  if (tree === null) {
    return <Header>{getTranslation("No data.")}</Header>;
  }

  if (tree === undefined || pause) {
    return <Placeholder />;
  }

  return <LanguageTree tree={tree} {...rest} />;
};

/** Dashboard dictionaries page */
const DictionariesAll = ({ forCorpora = false, forParallelCorpora = false }) => {
  const { getTranslation } = useTranslations();

  const [searchParams, setSearchParams] = useSearchParams();

  const user = useSelector(state => state.user);
  const published = useMemo(() => (user.user.id === undefined ? true : null), [user]);

  const [sortMode, activeTab, entityId] = useMemo(() => {
    let mode = "language";
    let tab = "0";
    let id = "";

    for (const [key, value] of searchParams) {
      switch (key) {
        case "all":
          tab = "1";
          break;

        case "language":
          mode = "language";
          id = value || "";
          break;

        case "grant":
          if (!forCorpora && !forParallelCorpora) {
            mode = "grant";
            id = value;
          }
          break;

        case "organization":
          if (!forCorpora && !forParallelCorpora) {
            mode = "organization";
            id = value || "";
          }
          break;
      }
    }

    return [mode, tab, id];
  }, [searchParams]);

  const category = (
    forCorpora
    ? 1
    : forParallelCorpora
    ? 2
    : 0);

  const entityIdValue = useMemo(() => {
    let entityIdValue = null;

    if (entityId) {
      try {
        switch (sortMode) {
          case "language":
            entityIdValue = stringToCompositeId(entityId);

            if (
              !Array.isArray(entityIdValue) ||
              entityIdValue.length != 2 ||
              !Number.isInteger(entityIdValue[0]) ||
              !Number.isInteger(entityIdValue[1]) ||
              entityIdValue[0] <= 0 ||
              entityIdValue[1] <= 0
            ) {
              entityIdValue = undefined;
            }

            break;

          case "grant":
          case "organization":
            entityIdValue = parseInt(entityId);

            if (!Number.isInteger(entityIdValue) || entityIdValue <= 0) {
              entityIdValue = undefined;
            }

            break;
        }
      } catch {
        entityIdValue = undefined;
      }
    }

    return entityIdValue;
  }, [sortMode, entityId]);

  const variables = { category, published };

  const user_loading = user.loading || (!!getId() && user.user.id === undefined && !user.error);
  const skip_general = user_loading || entityIdValue === undefined;
  const allowed_sync = (user.user.id === 1 || user.user.allowed_sync);

  /* Cache-only in case we are at "Dictionaries" tab and are using cached language data for the language
   * search if we need it and if we have any. */

  const queryLanguages = useQuery(getLanguagesForSearch, {
    variables,
    fetchPolicy: activeTab === "0" ? "cache-and-network" : "cache-only",
    skip: skip_general || sortMode !== "language"
  });

  const queryGrants = useQuery(getTocGrants, {
    variables,
    fetchPolicy: "cache-and-network",
    skip: skip_general || sortMode !== "grant"
  });

  const queryOrganizations = useQuery(getTocOrganizations, {
    variables,
    fetchPolicy: "cache-and-network",
    skip: skip_general || sortMode !== "organization"
  });

  const { data: proxyPermission } = useQuery(proxyDictionaryInfo, {
    variables: { proxy: published ? false : true, category },
    fetchPolicy: "cache-and-network",
    skip: skip_general || config.buildType === "server"
  });

  const { data: localPermission } = useQuery(localDictionaryInfo, {
    client: additionalClient,
    fetchPolicy: "cache-and-network",
    skip: skip_general || !allowed_sync || user.user.id === 1
  });

  /* Multiple queries for different situations because apparently with a single query Apollo returns
   * getLanguageTree query from cache even if variables are different. */

  const queryDictId = {};
  const queryDictAll = {};
  const queryDictIdProxy = {};
  const queryDictAllProxy = {};

  const sortModeList = forCorpora || forParallelCorpora ? ["language"] : ["language", "grant", "organization"];
  const proxy = (config.buildType !== "server");

  const [dataTreeId, setDataTreeId] = useState(undefined);
  const [dataTreeAll, setDataTreeAll] = useState(undefined);

  const [dataTreeIdProxy, setDataTreeIdProxy] = useState(undefined);
  const [dataTreeAllProxy, setDataTreeAllProxy] = useState(undefined);

  for (const aSortMode of sortModeList) {
    const variablesId = { ...variables };
    const variablesAll = { ...variables };

    if (aSortMode === "language") {
      variablesId.languageId = entityIdValue;
    } else if (aSortMode === "grant") {
      variablesId.byGrants = true;
      variablesId.grantId = entityIdValue;

      variablesAll.byGrants = true;
    } else if (aSortMode === "organization") {
      variablesId.byOrganizations = true;
      variablesId.organizationId = entityIdValue;

      variablesAll.byOrganizations = true;
    }

    queryDictId[aSortMode] = useQuery(getLanguageTree, {
      variables: variablesId,
      fetchPolicy: "cache-and-network",
      onCompleted: (data) => {
        console.log(`Completed getLanguageTreeId for sortMode '${aSortMode}'`);
        setDataTreeId(data);
      },
      skip: skip_general || !entityIdValue || aSortMode != sortMode
    });

    queryDictAll[aSortMode] = useQuery(getLanguageTree, {
      variables: variablesAll,
      fetchPolicy: "cache-and-network",
      onCompleted: (data) => {
        console.log(`Completed getLanguageTreeAll for sortMode '${aSortMode}'`);
        setDataTreeAll(data);
      },
      skip: skip_general || activeTab !== "1" || aSortMode != sortMode
    });

    queryDictIdProxy[aSortMode] = useQuery(getLanguageTree, {
      variables: { ...variablesId, proxy: true },
      fetchPolicy: "cache-and-network",
      client: additionalClient,
      onCompleted: (data) => {
        console.log(`Completed getLanguageTreeIdProxy for sortMode '${aSortMode}'`);
        setDataTreeIdProxy(data);
      },
      skip: skip_general || !allowed_sync || !entityIdValue || aSortMode != sortMode
    });

    queryDictAllProxy[aSortMode] = useQuery(getLanguageTree, {
      variables: { ...variablesAll, proxy: true },
      fetchPolicy: "cache-and-network",
      client: additionalClient,
      onCompleted: (data) => {
        console.log(`Completed getLanguageTreeAllProxy for sortMode '${aSortMode}'`);
        setDataTreeAllProxy(data);
      },
      skip: skip_general || !allowed_sync || activeTab !== "1" || aSortMode != sortMode
    });
  }

  const perspectiveIdList = useMemo(() => {
    const languages = dataTreeAll?.language_tree?.languages || [];
    const result = [];
    languages.forEach(
      language => language.dictionaries.forEach(
        dictionary => dictionary.perspectives.forEach(
          perspective => result.push(perspective.id))));
    return result;
  }, [dataTreeAll]);

  /*
  const { data: localPermission } = useQuery(getPermissionsBulk, {
    variables: { category },
    fetchPolicy: "cache-and-network",
    skip: !allowed_sync || user.user.id === 1
  });
  */

  const refreshLangTree = () => {
    setTimeout(queryDictAll[sortMode].refetch, 500);
  }

  //setInterval(queryDictAllProxy[sortMode].refetch, 300000);

  const { data: grantData } = queryGrants;
  const { data: organizationData } = queryOrganizations;

  const [grantMap, grantDictionaryIdSetMap] = useMemo(() => {
    if (!grantData) {
      return [undefined, undefined];
    }

    return groupMaps(grantData.grants);
  }, [grantData]);

  const [organizationMap, organizationDictionaryIdSetMap] = useMemo(() => {
    if (!organizationData) {
      return [undefined, undefined];
    }

    return groupMaps(organizationData.organizations);
  }, [organizationData]);

  const [selected, setSelected] = useState([]);

  /* Async construction of the language trees in case they are large, along the lines of
   * https://stackoverflow.com/a/66071205/2016856. */

  const [dataTreeCommon, setDataTreeCommon] = useState({ language_tree: {} });
  const [treeId, setTreeId] = useState(undefined);
  const [treeAll, setTreeAll] = useState(undefined);

  const skipConstructTree = (
    (sortMode === "grant" && !grantMap) ||
    (sortMode === "organization" && !organizationMap) ||
    (allowed_sync && user.user.id !== 1 && !localPermission) ||
    (proxy && !proxyPermission)
  );

  const skipConstructIdTree = (
    !dataTreeId ||
    (allowed_sync && !dataTreeIdProxy) ||
    skipConstructTree
  );

  const skipConstructAllTree = (
    !dataTreeAll ||
    (allowed_sync && !dataTreeAllProxy) ||
    skipConstructTree
  );

  // For debugging
  ['sortMode',
   'grantMap',
   'organizationMap',
   'localPermission',
   'proxyPermission',
   'dataTreeAll',
   'dataTreeAllProxy',
   'selected',
   'setSelected'
  ].forEach(state => {
    useEffect(() => {
      let attention = '';
      if (!skipConstructAllTree) {
        attention = '!!! >>> ';
      }
      if (eval(state)) {
        console.log(`${attention}Changed ${state}`);
      }
    }, [eval(state)]);
  });

  useEffect(() => {
    if (skipConstructIdTree) {
      return;
    }

    let active = true;
    constructIdTree();
    return () => {
      active = false;
    };

    async function constructIdTree() {
      const result = constructTree(
        dataTreeId,
        sortMode,
        entityId,
        false,
        grantMap,
        grantDictionaryIdSetMap,
        organizationMap,
        organizationDictionaryIdSetMap,
        proxyPermission,
        selected,
        setSelected,
        setDataTreeCommon,
        refreshLangTree,
        localPermission,
        dataTreeIdProxy
      );

      if (!active) {
        return;
      }

      setTreeId(result);
    }
  }, [sortMode, dataTreeId, grantMap, organizationMap, proxyPermission, localPermission, dataTreeIdProxy, selected, setSelected]);

  useEffect(() => {
    if (skipConstructAllTree) {
      return;
    }

    let active = true;
    console.log("Running constructAllTree...");
    constructAllTree();
    return () => {
      active = false;
    };

    async function constructAllTree() {
      const result = constructTree(
        dataTreeAll,
        sortMode,
        entityId,
        true,
        grantMap,
        grantDictionaryIdSetMap,
        organizationMap,
        organizationDictionaryIdSetMap,
        proxyPermission,
        selected,
        setSelected,
        setDataTreeCommon,
        refreshLangTree,
        localPermission,
        dataTreeAllProxy
      );

      if (!active) {
        return;
      }

      setTreeAll(result);
    }
  }, [sortMode, dataTreeAll, grantMap, organizationMap, proxyPermission, localPermission, dataTreeAllProxy, selected, setSelected]);

  if (entityIdValue === undefined) {
    return (
      <Message negative compact>
        {getTranslation(`Invalid ${sortMode} id`)} {`'${entityId}'`}.
      </Message>
    );
  }

  if (user_loading) {
    return <Placeholder />;
  }

  /* When we select a subtree in the ToC, we immediately stop displaying the current one, in particular so
   * that we do not navigate to the just selected language in current tree only for it to vanish and for us
   * to re-navigate to the tree of the selected language when it would be displayed. */

  const onSelectId = id => {
    if (id != entityId) {
      setTreeId(undefined);
    }
  };

  return (
    <div className="dictionariesAll">
      {forCorpora ? (
        <div className="background-header">
          <Container className="published">
            <h2 className="page-title">{getTranslation("Language corpora")}</h2>
          </Container>
        </div>
      ) : forParallelCorpora ? (
        <div className="background-header">
          <Container className="published">
            <h2 className="page-title">{getTranslation("Parallel corpora")}</h2>
          </Container>
        </div>
      ) : (
        <SortModeSelector
          onChange={() => {
            setTreeId(undefined);
            setTreeAll(undefined);
          }}
          sortMode={sortMode}
          selected={selected}
          setSelected={setSelected}
        />
      )}

      {sortMode === "language" && (
        <LanguageSearchField
          sortMode={sortMode}
          entityId={entityId}
          dataList={activeTab === "0" ? [queryLanguages.data, dataTreeCommon] : [dataTreeCommon, queryLanguages.data]}
          onSelectId={onSelectId}
        />
      )}
      <Container style={{ marginTop: "26px" }}>
        <Tab
          className="dictionaries-tabs"
          activeIndex={activeTab}
          panes={[
            {
              menuItem: getTranslation("Table of contents"),
              render: () => (
                <Tab.Pane>
                  {sortMode === "language" ? (
                    <LanguagesToc queryLanguages={queryLanguages} onSelectId={onSelectId} />
                  ) : sortMode === "grant" ? (
                    <GrantsToc queryGrants={queryGrants} onSelectId={onSelectId} />
                  ) : sortMode === "organization" ? (
                    <OrganizationsToc queryOrganizations={queryOrganizations} onSelectId={onSelectId} />
                  ) : null}
                  {entityId && (
                    <Wrapper tree={treeId} sortMode={sortMode} entityId={entityId} style={{ background: "white" }} />
                  )}
                </Tab.Pane>
              )
            },
            {
              menuItem: getTranslation(forCorpora
                ? "Corpora"
                : forParallelCorpora
                ? "Parallel corpora"
                : "Dictionaries"),
              render: () => (
                <Tab.Pane>
                  <Wrapper tree={treeAll} sortMode={sortMode} entityId={entityId} />
                </Tab.Pane>
              )
            }
          ]}
          onTabChange={(_event, data) => {
            if (data.activeIndex.toString() === "0") {
              searchParams.delete("all");
            } else {
              searchParams.set("all", "");
            }

            if (entityId) {
              if (sortMode === "language") {
                searchParams.delete("language");
              } else {
                searchParams.set(sortMode, "");
              }
            }

            setSearchParams(searchParams);
            if (selected.length !== 0) {
              setSelected([]);
            }
          }}
        />
      </Container>
      {(activeTab === "0" ? treeId : treeAll) && <BackTopButton scrollContainer={document.querySelector(".pusher")} />}
    </div>
  );
};

export default DictionariesAll;
