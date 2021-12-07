import React from 'react';
import { Container, Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import TranslationsBlock from './TranslationsBlock';
import { getTranslation } from 'api/i18n';

const CategorySelector = styled(Menu)`
  position: fixed;
  top: 58px;
  z-index: 100;
`;

const categories = [
  "Perspective",
  "Dictionary",
  "Service",
  "Language",
  "Field",
  "Grant",
  "All"
];

class EditTranslations extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedCategory: -1
    };
  }

  handleCategoryClick = (e, { index } ) => {
    this.setState({ selectedCategory: index });
  };

  render() {
    const { user } = this.props;
    if (user.id === undefined || user.id != 1) {
      return <h4>{getTranslation('This page is available for administrator only')}</h4>;
    }

    const { selectedCategory } = this.state;
    return (
      <div className="page-content">
          <CategorySelector size='massive' compact>
            {categories.map((category, index) => (
              <Menu.Item key={index}
                name={getTranslation(category)}
                index={index}
                active={selectedCategory == index}
                onClick={this.handleCategoryClick}
              />
            ))}
          </CategorySelector>
          {selectedCategory == -1 ? null : <TranslationsBlock gists_type={selectedCategory == 6 ? "" : categories[selectedCategory]}></TranslationsBlock>}
      </div>
    );
  }

}

export default connect(state => state.user)(EditTranslations);