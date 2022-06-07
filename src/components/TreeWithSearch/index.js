import React, { useState } from "react";
import SortableTree from "react-sortable-tree";
import { Button, Input } from "semantic-ui-react";
import PropTypes from "prop-types";

import { useTranslations } from "hooks";

/**
 * Language tree with search capability.
 */
const TreeWithSearch = ({ inverted, ...props }) => {
  const { getTranslation, chooseTranslation } = useTranslations();

  const [searchString, setSearchString] = useState(null);
  const [currentMatch, setCurrentMatch] = useState();
  const [totalMatches, setTotalMatches] = useState(0);

  return (
    <div style={{ height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", marginLeft: "12px", marginBottom: "10px" }}>
        <Input
          size="small"
          placeholder={getTranslation("Search")}
          value={searchString || ""}
          onChange={event => {
            const value = event.target.value;
            setSearchString(value === "" ? null : value);
            setCurrentMatch(1);
          }}
        />
        {totalMatches !== 0 && (
          <>
            <Button
              size="small"
              icon="angle left"
              onClick={() => setCurrentMatch(currentMatch === 1 ? totalMatches : currentMatch - 1)}
              style={{ marginLeft: "6px" }}
            />
            <Button
              size="small"
              icon="angle right"
              onClick={() => setCurrentMatch(currentMatch === totalMatches ? 1 : currentMatch + 1)}
              style={{ marginLeft: "6px" }}
            />
            <span style={{ marginLeft: "6px", fontWeight: "bold", color: inverted ? "white" : undefined }}>
              {`${currentMatch} / ${totalMatches}`}
            </span>
          </>
        )}
      </div>
      <SortableTree
        {...props}
        searchQuery={searchString}
        searchMethod={({ node, searchQuery }) => {
          const langName = chooseTranslation(node.translations);
          return searchQuery === null ? false : langName.toLowerCase().includes(searchQuery.toLowerCase());
        }}
        searchFocusOffset={currentMatch - 1}
        searchFinishCallback={matches => setTotalMatches(matches.length)}
      />
    </div>
  );
};

TreeWithSearch.propTypes = {
  inverted: PropTypes.bool
};

export default TreeWithSearch;
