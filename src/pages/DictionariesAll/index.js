import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Container, Tab } from "semantic-ui-react";

import { getId } from "api/user";
import { getLanguagesForSearch } from "backend";
import BackTopButton from "components/BackTopButton";
import LanguageSearchField from "components/LanguageSearchField";
import LanguageTree from "components/LanguageTree";
import Placeholder from "components/Placeholder";
import TableOfContents from "components/TableOfContents";
import { useTranslations } from "hooks";

import SortModeSelector from "./sort_mode_selector";

import "./styles.scss";

/** Dashboard dictionaries page */
const DictionariesAll = () => {
  const { getTranslation, chooseTranslation } = useTranslations();

  const [searchParams, setSearchParams] = useSearchParams();

  const user = useSelector(state => state.user);
  const published = useMemo(() => (user.user.id === undefined ? true : undefined), [user]);

  const sortMode = useMemo(() => {
    const mode = searchParams.get("sortMode");
    return mode ? mode : "language";
  }, [searchParams]);
  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab");
    return tab ? tab : "0";
  }, [searchParams]);
  const entityId = useMemo(() => searchParams.get("entity"), [searchParams]);

  const [selected, setSelected] = useState([]);

  if (user.loading || (getId() && user.user.id === undefined && !user.error)) {
    return <Placeholder />;
  }

  return (
    <div className="dictionariesAll">
      <SortModeSelector selected={selected} setSelected={setSelected} />
      {sortMode === "language" && (
        <LanguageSearchField
          queryData={{
            query: getLanguagesForSearch,
            variables: { category: 0, published },
            getEntries: data => data.language_tree.languages
          }}
          variables={{ category: 0, published }}
          getLabel={language => chooseTranslation(language.translations)}
          getValue={language => language.id.toString()}
          search
          clearable
          placeholder={getTranslation("Start typing language name")}
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
                  <TableOfContents sortMode={sortMode} published={published} />
                  {entityId && (
                    <LanguageTree
                      sortMode={sortMode}
                      published={published}
                      entityId={searchParams.get("entity")}
                      selected={selected}
                      setSelected={setSelected}
                      style={{ background: "white" }}
                    />
                  )}
                </Tab.Pane>
              )
            },
            {
              menuItem: getTranslation("Dictionaries"),
              render: () => (
                <Tab.Pane>
                  <LanguageTree
                    sortMode={sortMode}
                    published={published}
                    selected={selected}
                    setSelected={setSelected}
                  />
                </Tab.Pane>
              )
            }
          ]}
          onTabChange={(_event, data) => {
            if (data.activeIndex.toString() === "0") {
              searchParams.delete("tab");
            } else {
              searchParams.set("tab", data.activeIndex);
            }
            searchParams.delete("entity");
            setSearchParams(searchParams);
            if (selected.length !== 0) {
              setSelected([]);
            }
          }}
        />
      </Container>
      <BackTopButton scrollContainer={document.querySelector(".pusher")} />
    </div>
  );
};

export default DictionariesAll;
