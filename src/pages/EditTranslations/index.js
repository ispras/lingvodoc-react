import React, { useContext, useState } from "react";
import { connect } from "react-redux";
import { Checkbox, Container, Input, Menu } from "semantic-ui-react";

import Footer from "components/Footer";
import TranslationContext from "Layout/TranslationContext";

import TranslationsBlock from "./TranslationsBlock";

import "./styles.scss";

const categories = ["Perspective", "Dictionary", "Service", "Language", "Field", "Organization", "Grant", "All"];

const Filter = ({ filterStr: initialFilterStr, caseSensitive, regularExpression, onChange }) => {
  const [filterStr, setFilterStr] = useState(initialFilterStr);

  const getTranslation = useContext(TranslationContext);

  return (
    <div className="lingvo-search-translations">
      <Input
        placeholder={`${getTranslation("Search")}`}
        value={filterStr}
        onKeyPress={e => {
          if (e.key === "Enter" && filterStr !== initialFilterStr) {
            onChange({ filterStr });
          }
        }}
        onChange={e => setFilterStr(e.target.value)}
        icon={
          filterStr !== initialFilterStr ? (
            <i className="lingvo-icon lingvo-icon_search" onClick={() => onChange({ filterStr })} />
          ) : (
            <i className="lingvo-icon lingvo-icon_search lingvo-icon_search_disabled" />
          )
        }
        iconPosition="left"
        className="lingvo-search-translations__input"
      />
      <div className="lingvo-search-translations__checkboxes">
        <Checkbox
          label={getTranslation("Case-sensitive")}
          checked={caseSensitive}
          onChange={(e, { checked }) => onChange({ filterStr, caseSensitive: checked })}
          className="lingvo-checkbox"
        />

        <Checkbox
          label={getTranslation("Regular expression")}
          checked={regularExpression}
          onChange={(e, { checked }) => onChange({ filterStr, regularExpression: checked })}
          className="lingvo-checkbox"
        />
      </div>
    </div>
  );
};

const EditTranslations = ({ user }) => {
  const getTranslation = useContext(TranslationContext);

  const [selectedCategory, setSelectedCategory] = useState(0);
  const [filterStr, setFilterStr] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regularExpression, setRegularExpression] = useState(false);

  const handleCategoryClick = (e, { index }) => {
    setSelectedCategory(index);
  };

  if (user.id === undefined || user.id !== 1) {
    return (
      <div className="page-content">
        <h4>{getTranslation("This page is available for administrator only")}</h4>
      </div>
    );
  }

  return (
    <div className="lingvodoc-page">
      <div className="lingvodoc-page__content">
        <div className="background-header lingvo-translations-head">
          <div className="lingvo-translations-menu">
            <Menu secondary>
              {categories.map((category, index) => (
                <Menu.Item
                  key={index}
                  name={getTranslation(category)}
                  index={index}
                  active={selectedCategory === index}
                  onClick={handleCategoryClick}
                />
              ))}
            </Menu>
          </div>
        </div>

        <Container>
          <h1 className="lingvo-header-translations">{getTranslation(categories[selectedCategory])}</h1>
          <Filter
            filterStr={filterStr}
            caseSensitive={caseSensitive}
            regularExpression={regularExpression}
            onChange={state => {
              if (state.selectedCategory !== undefined) {
                setSelectedCategory(state.selectedCategory);
              }
              if (state.filterStr !== undefined) {
                setFilterStr(state.filterStr);
              }
              if (state.caseSensitive !== undefined) {
                setCaseSensitive(state.caseSensitive);
              }
              if (state.regularExpression !== undefined) {
                setRegularExpression(state.regularExpression);
              }
            }}
          />
          {selectedCategory === -1 ? null : (
            <TranslationsBlock
              gists_type={selectedCategory === 7 ? "" : categories[selectedCategory]}
              searchstring={filterStr}
              search_case_insensitive={!caseSensitive}
              search_regular_expression={regularExpression}
            />
          )}
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default connect(state => state.user)(EditTranslations);
