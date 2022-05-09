import React, { useCallback, useEffect, useMemo } from "react";
import { Container } from "semantic-ui-react";
import { useLazyQuery, useQuery } from "@apollo/client";
import PropTypes from "prop-types";

import { getLanguageTree, getTocGrants, getTocOrganizations, proxyDictionaryInfo } from "backend";
import Placeholder from "components/Placeholder";
// eslint-disable-next-line import/no-unresolved
import config from "config";
import { compositeIdToString, stringToCompositeId } from "utils/compositeId";
import smoothScroll from "utils/smoothscroll";

import Node from "./node";

/** Language tree with dictionaries or corpora */
const LanguageTree = ({ kind, entityId, selected, setSelected, style }) => {
  const variables = useMemo(() => {
    const result = {};
    switch (kind) {
      case "language":
        if (entityId) {
          result.languageId = stringToCompositeId(entityId);
        }
        break;
      case "grant":
        result.byGrants = true;
        if (entityId) {
          result.grantId = parseInt(entityId);
        }
        break;
      case "organization":
        result.byOrganizations = true;
        if (entityId) {
          result.organizationId = parseInt(entityId);
        }
        break;
      default:
    }
    return result;
  }, [entityId, kind]);
  const { loading: treeLoading, data: treeData } = useQuery(getLanguageTree, {
    variables,
    fetchPolicy: "network-only"
  });

  const [requestGrants, { called: grantsRequested, loading: grantsLoading, data: grantsData }] = useLazyQuery(
    getTocGrants,
    {
      fetchPolicy: "network-only"
    }
  );

  const [
    requestOrganizations,
    { called: organizationsRequested, loading: organizationsLoading, data: organizationsData }
  ] = useLazyQuery(getTocOrganizations, {
    fetchPolicy: "network-only"
  });

  const [requestProxyData, { called: proxyDataRequested, loading: proxyDataLoading, data: proxyData }] = useLazyQuery(
    proxyDictionaryInfo,
    {
      fetchPolicy: "network-only"
    }
  );

  const loading = useMemo(() => {
    if (proxyDataLoading) {
      return true;
    }

    switch (kind) {
      case "language":
        return treeLoading;
      case "grant":
        return treeLoading || grantsLoading;
      case "organization":
        return treeLoading || organizationsLoading;
    }
  }, [grantsLoading, kind, organizationsLoading, proxyDataLoading, treeLoading]);

  const tree = useMemo(() => {
    if (loading || !treeData || (kind === "grant" && !grantsData) || (kind === "organization" && !organizationsData)) {
      return [];
    }

    const { languages, tree: idTree } = treeData.language_tree;
    const languagesMap = new Map();
    languages.forEach(language => {
      languagesMap[compositeIdToString(language.id)] = language;
    });

    const mapIdNodeToEntityNode = node => {
      const result = {};
      const id = node[0];
      if (id === null) {
        result.entity = { __typename: "Text" };
      } else {
        if (Array.isArray(id)) {
          result.entity = languagesMap[compositeIdToString(id)];
        } else {
          if (kind === "language") {
            result.entity = { __typename: "Unknown" };
          } else {
            const collection = kind === "grant" ? grantsData.grants : organizationsData.organizations;
            result.entity = collection.find(entity => entity.id === id);
            if (!result.entity) {
              result.entity = { __typename: "Unknown" };
            }
          }
        }
      }
      result.children = node[1] ? node[1].map(mapIdNodeToEntityNode) : [];
      return result;
    };
    const result =
      entityId && kind === "language" ? [mapIdNodeToEntityNode(idTree)] : idTree[1].map(mapIdNodeToEntityNode);

    return result;
  }, [loading, treeData, kind, grantsData, organizationsData, entityId]);

  const revealEntity = useCallback(() => {
    const elem = document.getElementById(`${kind}_${entityId}`);
    if (!elem) {
      return;
    }

    const container = document.querySelector(".pusher");
    smoothScroll(elem.offsetTop - 160, 500, null, container);
    elem.classList.add("highlighted");
    setTimeout(() => {
      elem.classList.remove("highlighted");
    }, 2000);
  }, [entityId, kind]);

  useEffect(() => {
    let requested = false;
    let requestData;
    switch (kind) {
      case "grant":
        requested = grantsRequested;
        requestData = requestGrants;
        break;
      case "organization":
        requested = organizationsRequested;
        requestData = requestOrganizations;
        break;
      default:
    }
    if (requestData && !requested) {
      requestData();
    }
  }, [grantsRequested, kind, organizationsRequested, requestGrants, requestOrganizations]);

  useEffect(() => {
    if (entityId && tree.length !== 0) {
      revealEntity();
    }
  }, [entityId, revealEntity, tree]);

  useEffect(() => {
    if ((config.buildType === "desktop" || config.buildType === "proxy") && !proxyDataRequested) {
      requestProxyData();
    }
  }, [proxyDataRequested, requestProxyData]);

  if (loading) {
    return <Placeholder />;
  }

  if (tree.length === 0) {
    return null;
  }

  return (
    <Container className="container-gray" style={style}>
      <ul className="tree">
        {tree.map((node, index) => (
          <Node key={index} nodeInfo={node} root selected={selected} setSelected={setSelected} proxyData={proxyData} />
        ))}
      </ul>
    </Container>
  );
};

LanguageTree.propTypes = {
  kind: PropTypes.string.isRequired,
  entityId: PropTypes.string,
  selected: PropTypes.array.isRequired,
  setSelected: PropTypes.func.isRequired,
  style: PropTypes.object
};

export default LanguageTree;
