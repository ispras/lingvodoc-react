import React, { useContext, useState } from "react";
import { connect } from "react-redux";
import { Checkbox, Icon, Input, Menu } from "semantic-ui-react";

import TranslationContext from "Layout/TranslationContext";

import TranslationsBlock from "./TranslationsBlock";

import "./styles.scss";

const categories = ["Perspective", "Dictionary", "Service", "Language", "Field", "Organization", "Grant", "All"];

const Filter = ({ filterStr: initialFilterStr, caseSensitive, regularExpression, onChange }) => {
  const [filterStr, setFilterStr] = useState(initialFilterStr);

  const getTranslation = useContext(TranslationContext);

  return (
    <div style={{ position: "relative" }}>
      <Input
        placeholder={`${getTranslation("Filter")}...`}
        value={filterStr}
        onKeyPress={e => {
          if (e.key === "Enter" && filterStr != initialFilterStr) {
            onChange({ filterStr });
          }
        }}
        onChange={e => setFilterStr(e.target.value)}
        icon={
          filterStr != initialFilterStr ? (
            <Icon name="search" link onClick={() => onChange({ filterStr })} />
          ) : (
            <Icon name="search" disabled />
          )
        }
      />
      <div
        style={{
          display: "inline-block",
          position: "absolute",
          top: "50%",
          transform: "translate(0%, -50%)",
          marginLeft: "0.75em",
          textAlign: "left"
        }}
      >
        <div>
          <Checkbox
            label={getTranslation("Case-sensitive")}
            checked={caseSensitive}
            onChange={(e, { checked }) => onChange({ filterStr, caseSensitive: checked })}
          />
        </div>
        <div style={{ marginTop: "0.25em" }}>
          <Checkbox
            label={getTranslation("Regular expression")}
            checked={regularExpression}
            onChange={(e, { checked }) => onChange({ filterStr, regularExpression: checked })}
          />
        </div>
      </div>
    </div>
  );
};

class EditTranslations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCategory: 0,
      filterStr: "",
      caseSensitive: false,
      regularExpression: false
    };
  }

  handleCategoryClick = (e, { index }) => {
    this.setState({ selectedCategory: index });
  };

  render() {
    const { user } = this.props;

    if (user.id === undefined || user.id != 1) {
      return (
        <div className="page-content">
          <h4>{this.context("This page is available for administrator only")}</h4>
        </div>
      );
    }

    const { selectedCategory } = this.state;

    return (
      <div>
        <div className="background-header lingvo-translations-head">
          <div className="lingvo-translations-menu">
            <Menu secondary>
              {categories.map((category, index) => (
                <Menu.Item
                  key={index}
                  name={this.context(category)}
                  index={index}
                  active={selectedCategory == index}
                  onClick={this.handleCategoryClick}
                />
              ))}
            </Menu>
            <Filter
              filterStr={this.state.filterStr}
              caseSensitive={this.state.caseSensitive}
              regularExpression={this.state.regularExpression}
              onChange={state => this.setState(state)}
            />
          </div>
        </div>
        {selectedCategory == -1 ? null : (
          <TranslationsBlock
            gists_type={selectedCategory == 7 ? "" : categories[selectedCategory]}
            searchstring={this.state.filterStr}
            search_case_insensitive={!this.state.caseSensitive}
            search_regular_expression={this.state.regularExpression}
          />
        )}
      </div>
    );
  }
}

EditTranslations.contextType = TranslationContext;

export default connect(state => state.user)(EditTranslations);
