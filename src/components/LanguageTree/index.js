import React, { useCallback, useEffect, useMemo } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import PropTypes from "prop-types";

import { getLanguageTree, getTocGrants, getTocOrganizations, proxyDictionaryInfo } from "backend";
import Placeholder from "components/Placeholder";
// eslint-disable-next-line import/no-unresolved
import config from "config";
import { compositeIdToString, stringToCompositeId } from "utils/compositeId";
import smoothScroll from "utils/smoothscroll";

import "./styles.scss";

/** Language tree with dictionaries or corpora */
const LanguageTree = ({ tree, sortMode, entityId, style }) => {
  const revealEntity = useCallback(() => {
    const container = document.querySelector(".pusher");
    let elem = document.getElementById(`${sortMode}_${entityId}`);
    if (!elem && sortMode !== "language") {
      elem = document.querySelector(".language_tree");
    }
    if (!elem) {
      return;
    }

    smoothScroll(elem.offsetTop - 160, 500, null, container);
    elem.classList.add("highlighted_subtree");
    setTimeout(() => {
      elem.classList.remove("highlighted_subtree");
    }, 2000);
  }, [entityId, sortMode]);

  useEffect(() => {
    if (entityId && tree) {
      revealEntity();
    }
  }, [entityId, revealEntity, tree]);

  if (!tree) {
    return <Placeholder />;
  }

  return (
    <div className="container-gray" style={style}>
      <ul className="language_tree">{tree}</ul>
    </div>
  );
};

LanguageTree.propTypes = {
  sortMode: PropTypes.string.isRequired,
  entityId: PropTypes.string,
  style: PropTypes.object
};

export default LanguageTree;
