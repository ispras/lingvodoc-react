import React from 'react';
import './styles.scss';
import { Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';
import TranslationsBlock from './TranslationsBlock';
import { getTranslation } from 'api/i18n';

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
      selectedCategory: 0
    };
  }

  handleCategoryClick = (e, { index } ) => {
    this.setState({ selectedCategory: index });
  };

  render() {
    const { user } = this.props;
    if (user.id === undefined || user.id != 1) {
      return <div className="page-content"><h4>{getTranslation('This page is available for administrator only')}</h4></div>;
    }

    const { selectedCategory } = this.state;

    return (
      <div>
          <div className="background-header lingvo-translations-head">
            <div className="lingvo-translations-menu">
              <Menu secondary>
                {categories.map((category, index) => (
                  <Menu.Item key={index}
                    name={getTranslation(category)}
                    index={index}
                    active={selectedCategory == index}
                    onClick={this.handleCategoryClick}
                  />
                ))}
              </Menu>
            </div>
          </div>
          {selectedCategory == -1 ? null : <TranslationsBlock gists_type={selectedCategory == 6 ? "" : categories[selectedCategory]}></TranslationsBlock>}
      </div>
    );
  }
  
}

export default connect(state => state.user)(EditTranslations);
