import React, { useCallback, useContext, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input, Pagination as SemanticPagination } from "semantic-ui-react";
import PropTypes from "prop-types";

import TranslationContext from "Layout/TranslationContext";

import "./style.scss";

const Pagination = ({ urlBased, activePage, pageSize = 20, totalItems, showTotal, onPageChanged, style }) => {
  const getTranslation = useContext(TranslationContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = useMemo(() => {
    if (urlBased) {
      const pageNum = parseInt(searchParams.get("page"));
      return isNaN(pageNum) ? 1 : pageNum;
    } else {
      return activePage === undefined ? 1 : activePage;
    }
  }, [activePage, searchParams, urlBased]);

  const [goto, setGoto] = useState("");

  const pageChanged = useCallback(
    newPage => {
      if (urlBased) {
        searchParams.set("page", newPage);
        setSearchParams(searchParams);
      }
      onPageChanged(newPage);
    },
    [onPageChanged, searchParams, setSearchParams, urlBased]
  );

  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [pageSize, totalItems]);

  const gotoPage = useCallback(() => {
    let pageNum = parseInt(goto);
    if (isNaN(pageNum)) {
      setGoto("");
    } else {
      pageNum = Math.max(Math.min(totalPages, pageNum), 1);
      setGoto("");
      pageChanged(pageNum);
    }
  }, [goto, pageChanged, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="lingvo-pagination-block" style={style}>
      {showTotal && (
        <div className="lingvo-pagination-block__total">{`${getTranslation("Total items")}: ${totalItems}`}</div>
      )}
      <div className="lingvo-pagination-block__pages">
        <SemanticPagination
          className="lingvo-pagination"
          activePage={currentPage}
          totalPages={totalPages}
          onPageChange={(_event, { activePage: newPage }) => pageChanged(newPage)}
          nextItem={{ "aria-label": "Next item", content: ">" }}
          prevItem={{ "aria-label": "Previous item", content: "<" }}
          style={{ marginRight: "8px" }}
        />
      </div>
      <span style={{ marginRight: "4px" }}>
        Go to page
        <Input
          value={goto}
          onChange={(_event, { value }) => setGoto(value)}
          onKeyPress={event => {
            if (event.key === "Enter") {
              gotoPage();
            }
          }}
          onBlur={gotoPage}
          style={{ height: "32px", marginLeft: "4px", maxWidth: "62px" }}
        />
      </span>
    </div>
  );
};

Pagination.propTypes = {
  urlBased: PropTypes.bool,
  activePage: PropTypes.number,
  pageSize: PropTypes.number,
  totalItems: PropTypes.number.isRequired,
  showTotal: PropTypes.bool,
  onPageChanged: PropTypes.func.isRequired,
  style: PropTypes.object
};

export default Pagination;
