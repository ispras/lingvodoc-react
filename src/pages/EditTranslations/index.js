import React, { useState } from "react";
import { connect } from "react-redux";
import { Icon, Input, Menu } from "semantic-ui-react";

import { getTranslation } from "api/i18n";

import TranslationsBlock from "./TranslationsBlock";

import "./styles.scss";

const categories = ["Perspective", "Dictionary", "Service", "Language", "Field", "Organization", "Grant", "All"];

const Filter = ({ filterStr: initialFilterStr, onChange }) => {
  const [filterStr, setFilterStr] = useState(initialFilterStr);

  return (
    <div>
      <Input
        placeholder={`${getTranslation("Filter")}...`}
        value={filterStr}
        onKeyPress={e => {
          if (e.key === "Enter" && filterStr != initialFilterStr) {
            onChange(filterStr);
          }
        }}
        onChange={e => setFilterStr(e.target.value)}
        icon={
          filterStr != initialFilterStr ? (
            <Icon name="search" link onClick={() => onChange(filterStr)} />
          ) : (
            <Icon name="search" disabled />
          )
        }
      />
    </div>
  );
};

class EditTranslations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCategory: 0,
      filterStr: ""
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
            <Filter filterStr={this.state.filterStr} onChange={filterStr => this.setState({ filterStr })} />
          </div>
        </div>
        {selectedCategory == -1 ? null : (
          <TranslationsBlock
            gists_type={selectedCategory == 7 ? "" : categories[selectedCategory]}
            searchstring={this.state.filterStr}
          />
        )}
      </div>
    );
  }
}

export default connect(state => state.user)(EditTranslations);
