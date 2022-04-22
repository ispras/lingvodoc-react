import React, { useState } from "react";
import { connect } from "react-redux";
import { Checkbox, Icon, Input, Menu } from "semantic-ui-react";

import { getTranslation } from "api/i18n";

import TranslationsBlock from "./TranslationsBlock";

import "./styles.scss";

const categories = ["Perspective", "Dictionary", "Service", "Language", "Field", "Organization", "Grant", "All"];

const Filter = ({ filterStr: initialFilterStr, caseSensitive, onChange }) => {
  const [filterStr, setFilterStr] = useState(initialFilterStr);

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
      <Checkbox
        style={{
          position: "absolute",
          top: "50%",
          transform: "translate(0%, -50%)",
          marginLeft: "0.75em"
        }}
        label={getTranslation("Case-sensitive")}
        checked={caseSensitive}
        disabled={!initialFilterStr && !filterStr}
        onChange={(e, { checked }) => onChange({ filterStr, caseSensitive: checked })}
      />
    </div>
  );
};

class EditTranslations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCategory: 0,
      filterStr: "",
      caseSensitive: false
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
          <h4>{getTranslation("This page is available for administrator only")}</h4>
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
                  name={getTranslation(category)}
                  index={index}
                  active={selectedCategory == index}
                  onClick={this.handleCategoryClick}
                />
              ))}
            </Menu>
            <Filter
              filterStr={this.state.filterStr}
              caseSensitive={this.state.caseSenstitive}
              onChange={state => this.setState(state)}
            />
          </div>
        </div>
        {selectedCategory == -1 ? null : (
          <TranslationsBlock
            gists_type={selectedCategory == 7 ? "" : categories[selectedCategory]}
            searchstring={this.state.filterStr}
            search_case_insensitive={!this.state.caseSensitive}
          />
        )}
      </div>
    );
  }
}

export default connect(state => state.user)(EditTranslations);
