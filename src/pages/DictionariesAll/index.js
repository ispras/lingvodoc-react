import React, { useContext, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Tab } from "semantic-ui-react";

import { chooseTranslation } from "api/i18n";
import { getLanguagesForSearch } from "backend";
import LanguageSearchField from "components/LanguageSearchField";
import LanguageTree from "components/LanguageTree";
import TableOfContents from "components/TableOfContents";
import TranslationContext from "Layout/TranslationContext";

import SortModeSelector from "./sort_mode_selector";

import "./styles.scss";

const DictionariesAll = () => {
  const getTranslation = useContext(TranslationContext);

  const [searchParams, setSearchParams] = useSearchParams();

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

  return (
    <div className="dictionariesAll">
      <SortModeSelector selected={selected} setSelected={setSelected} />
      {sortMode === "language" && (
        <LanguageSearchField
          queryData={{
            query: getLanguagesForSearch,
            getEntries: data => data.language_tree.languages
          }}
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
                  <TableOfContents kind={sortMode} />
                  {entityId && (
                    <LanguageTree
                      kind={sortMode}
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
                  <LanguageTree kind={sortMode} selected={selected} setSelected={setSelected} />
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
    </div>
  );
};

export default DictionariesAll;
