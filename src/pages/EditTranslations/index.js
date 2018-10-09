import React from 'react';
import { Container, Menu } from 'semantic-ui-react';
import { graphql, withApollo } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { compose } from 'recompose';
import styled from 'styled-components';
import TranslationsBlock from './TranslationsBlock';

const i18nQuery = gql`
  query {
    advanced_translation_search(
      searchstrings: [
        "Perspective",
        "Dictionary",
        "Service",
        "Language",
        "Field",
        "Grant",
        "All",
        "Loading",
        "This page is available for administrator only",
        "Add Translation",
        "Save"
      ]
    ) {
      translation
    }
  }
`;

const CategorySelector = styled(Menu)`
  position: fixed;
  top: 4rem;
  z-index: 100;
`;

export const categories = [
  "Perspective",
  "Dictionary",
  "Service",
  "Language",
  "Field",
  "Grant",
  "All"
];

export const i18n = [];

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
    const { user, data: { error, loading, advanced_translation_search: translated } } = this.props;
    if (loading || error) {
      return null;
    }

    const { selectedCategory } = this.state;
    let translatedCategories = [];
    for (let i = 0; i < translated.length; i++) {
      i18n[i] =  translated[i] ? translated[i].translation : null;
      if (i < 7)
        translatedCategories[i] = translated[i] ? translated[i].translation : categories[i];
    }

    if (user.id === undefined || user.id != 1) {
      return <h4>{translated[8] ? translated[8].translation : 'This page is available for administrator only'}</h4>;
    }

    return (
      <Container fluid>
        <CategorySelector size='massive' compact>
          {translatedCategories.map((category, index) => (
            <Menu.Item key={index}
              name={category}
              index={index}
              active={selectedCategory == index}
              onClick={this.handleCategoryClick}
            />
          ))}
        </CategorySelector>
        {selectedCategory == -1 ? null : <TranslationsBlock gists_type={selectedCategory == 6 ? "" : categories[selectedCategory]}></TranslationsBlock>}
      </Container>
    );
  }

}

export default compose(
  connect(state => state.user),
  graphql(i18nQuery),
  withApollo
)(EditTranslations);
