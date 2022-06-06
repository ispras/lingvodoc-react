import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Container, Header, Icon, Menu, Message, Tab } from "semantic-ui-react";
import { useApolloClient, useQuery } from "@apollo/client";
import { isEqual } from "lodash";

import { getId } from "api/user";
import {
  getLanguagesForSearch,
  getLanguageTree,
  getTocGrants,
  getTocOrganizations,
  proxyDictionaryInfo
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
  grantMap,
  grantDictionaryIdSetMap,
  organizationMap,
  organizationDictionaryIdSetMap,
  proxyData,
  selected,
  setSelected
) {
  const { languages, tree } = data.language_tree;
  const languageMap = {};

  if (tree === null) {
    return null;
  }

  languages.forEach(language => {
    languageMap[compositeIdToString(language.id)] = language;
  });

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
    return entityId ? (
      <LanguageNode
        node={tree}
        languageMap={languageMap}
        selected={selected}
        setSelected={setSelected}
        proxyData={proxyData}
      />
    ) : (
      tree[1].map((node, index) => (
        <LanguageNode
          key={index}
          node={node}
          languageMap={languageMap}
          selected={selected}
          setSelected={setSelected}
          proxyData={proxyData}
        />
      ))
    );
  } else {
    return entityId ? (
      <NodeComponent
        node={[Number(entityId), tree[1]]}
        groupMap={groupMap}
        dictionaryIdSet={groupDictionaryIdSetMap[entityId]}
        languageMap={languageMap}
        selected={selected}
        setSelected={setSelected}
        proxyData={proxyData}
      />
    ) : (
      tree[1].map((node, index) =>
        node[0] ? (
          <NodeComponent
            key={index}
            node={node}
            groupMap={groupMap}
            dictionaryIdSet={groupDictionaryIdSetMap[String(node[0])]}
            languageMap={languageMap}
            selected={selected}
            setSelected={setSelected}
            proxyData={proxyData}
          />
        ) : (
          <IndividualNode
            key={index}
            node={node}
            languageMap={languageMap}
            dictionaryIdSet={groupDictionaryIdSetMap[""]}
            selected={selected}
            setSelected={setSelected}
            proxyData={proxyData}
          />
        )
      )
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
const DictionariesAll = ({ forCorpora = false }) => {
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
          if (!forCorpora) {
            mode = "grant";
            id = value;
          }
          break;

        case "organization":
          if (!forCorpora) {
            mode = "organization";
            id = value || "";
          }
          break;
      }
    }

    return [mode, tab, id];
  }, [searchParams]);

  const category = forCorpora ? 1 : 0;

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

  const { data: proxyData } = useQuery(proxyDictionaryInfo, {
    variables: { proxy: published ? false : true, category },
    fetchPolicy: "cache-and-network",
    skip: skip_general || config.buildType === "server"
  });

  /* Multiple queries for different situations because apparently with a single query Apollo returns
   * getLanguageTree query from cache even if variables are different. */

  const queryDictId = {};
  const queryDictAll = {};

  const sortModeList = forCorpora ? ["language"] : ["language", "grant", "organization"];

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
      skip: skip_general || !entityIdValue || aSortMode != sortMode
    });

    queryDictAll[aSortMode] = useQuery(getLanguageTree, {
      variables: variablesAll,
      fetchPolicy: "cache-and-network",
      skip: skip_general || activeTab !== "1" || aSortMode != sortMode
    });
  }

  const { data: dataTreeId } = queryDictId[sortMode];
  const { data: dataTreeAll } = queryDictAll[sortMode];

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

  const [treeId, setTreeId] = useState(undefined);
  const [treeAll, setTreeAll] = useState(undefined);

  useEffect(() => {
    if (
      !dataTreeId ||
      (sortMode === "grant" && !grantMap) ||
      (sortMode === "organization" && !organizationMap) ||
      (config.buildType !== "server" && !proxyData)
    ) {
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
        grantMap,
        grantDictionaryIdSetMap,
        organizationMap,
        organizationDictionaryIdSetMap,
        proxyData,
        selected,
        setSelected
      );

      if (!active) {
        return;
      }

      setTreeId(result);
    }
  }, [sortMode, dataTreeId, grantMap, organizationMap, proxyData, selected, setSelected]);

  useEffect(() => {
    let active = true;
    constructAllTree();
    return () => {
      active = false;
    };

    async function constructAllTree() {
      if (
        !dataTreeAll ||
        (sortMode === "grant" && !grantMap) ||
        (sortMode === "organization" && !organizationMap) ||
        (config.buildType !== "server" && !proxyData)
      ) {
        return;
      }

      const result = constructTree(
        dataTreeAll,
        sortMode,
        entityId,
        grantMap,
        grantDictionaryIdSetMap,
        organizationMap,
        organizationDictionaryIdSetMap,
        proxyData,
        selected,
        setSelected
      );

      if (!active) {
        return;
      }

      setTreeAll(result);
    }
  }, [sortMode, dataTreeAll, grantMap, organizationMap, proxyData, selected, setSelected]);

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
          dataList={activeTab === "0" ? [queryLanguages.data, dataTreeAll] : [dataTreeAll, queryLanguages.data]}
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
              menuItem: getTranslation(forCorpora ? "Corpora" : "Dictionaries"),
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
