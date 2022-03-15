import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Input, List, TextArea, Dropdown } from 'semantic-ui-react';
import { head, nth, difference, isEmpty } from 'lodash';
import { getTranslation } from 'api/i18n';

const localesQuery = gql`
  query Locales {
    all_locales
  }
`;

export class Translation extends React.Component {
  constructor(props) {
    super(props);

    const { translation } = props;
    
    this.state = {
      id: translation.id,
      localeId: translation.localeId,
      content: translation.content
    };

    this.onChangeContent = this.onChangeContent.bind(this);
    this.onChangeLocale = this.onChangeLocale.bind(this);
    this.onDeleteTranslation = this.onDeleteTranslation.bind(this);
  }

  onChangeContent(event, data) {
    const { onChange } = this.props;
    this.setState({ content: data.value }, () => onChange(this.state));
  }

  onChangeLocale(event, data) {
    const { locales } = this.props;
    const { onChange } = this.props;
    const locale = locales.find(l => l.shortcut === data.value);
    if (locale) {
      this.setState({ localeId: locale.id }, () => onChange(this.state));
    }
  }

  onDeleteTranslation(event, { translationid }) {
    let newTranslations = [];
    this.props.translations.forEach(translation => {
      if (translation.id != translationid) {
        newTranslations.push(translation);
      }
    });

    this.props.onChangeTranslations(newTranslations);
  }

  render() {
    const { locales, usedLocaleIds, textArea, translations } = this.props;

    const { id } = this.state;

    const options = locales
      .filter(locale => usedLocaleIds.indexOf(locale.id) < 0 || locale.id === this.state.localeId)
      .map(locale => ({ key: locale.shortcut, text: locale.intl_name, value: locale.shortcut }));

    const selectedLocale = locales.find(locale => locale.id === this.state.localeId);

    return textArea ? (
      <div className="lingvo-atom-grid" key={id}>
        <div className="lingvo-atom-grid__text">
          <TextArea rows={2} placeholder="" value={this.state.content} onChange={this.onChangeContent} className="lingvo-gist-elem lingvo-gist-elem_textarea" />
        </div>
        <div className="lingvo-atom-grid__lang">
          <Dropdown className="lingvo-gist-elem lingvo-gist-elem_language" options={options} value={selectedLocale.shortcut} onChange={this.onChangeLocale} selection icon={<i className="lingvo-icon lingvo-icon_arrow" />} />
        </div>
        <div className="lingvo-atom-grid__delete">
          <Button icon={<i className="lingvo-icon lingvo-icon_trash" />} disabled={translations.length == 1} onClick={this.onDeleteTranslation} translationid={id} className="lingvo-button-atom-delete lingvo-button-atom-delete_disab-hidden" />
        </div>
      </div>
      ) : (
      <div className="lingvo-atom-grid" key={id}>
        <div className="lingvo-atom-grid__text">
          <Input value={this.state.content} onChange={this.onChangeContent} fluid className="lingvo-gist-elem" />
        </div>
        <div className="lingvo-atom-grid__lang">
          <Dropdown className="lingvo-gist-elem lingvo-gist-elem_language" options={options} value={selectedLocale.shortcut} onChange={this.onChangeLocale} selection icon={<i className="lingvo-icon lingvo-icon_arrow" />} />
        </div>
        <div className="lingvo-atom-grid__delete">
          <Button icon={<i className="lingvo-icon lingvo-icon_trash" />} disabled={translations.length == 1} onClick={this.onDeleteTranslation} translationid={id} className="lingvo-button-atom-delete lingvo-button-atom-delete_disab-hidden" />
        </div>
      </div>
    );
  }
}

Translation.propTypes = {
  locales: PropTypes.array.isRequired,
  usedLocaleIds: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  translation: PropTypes.object.isRequired,
  onChangeTranslations: PropTypes.func.isRequired,
  translations: PropTypes.array,
};


class Translations extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      translations: props.translations.length && props.translations || [],
    };

    this.addTranslation = this.addTranslation.bind(this);
    this.onChange2 = this.onChange2.bind(this);
    this.isAddTranslationDisabled = this.isAddTranslationDisabled.bind(this);

    if (!this.state.translations.length) {
      const lastId = 1;
      this.state = {
          translations: [...this.state.translations, { id: lastId, localeId: lastId, content: '' }],
      };
      props.onChange(this.state.translations);
    }

  }
  
  onChange2(translation) {
    const updateState = this.state.translations.map((t) => {
      if (t.id === translation.id) {
        return {
          ...t,
          localeId: translation.localeId,
          content: translation.content,
        };
      }
      return t;
    });

    this.setState(
      {
        translations: updateState,
      },
      () => this.props.onChange(this.state.translations)
    );
  }

  addTranslation() {
    const { data: { error, loading, all_locales: locales } } = this.props;
    if (!loading && !error) {
      const lastId = nth(this.state.translations.map(t => t.id), -1) + 1 || 1;

      // pick next free locale id
      const ids = locales.map(locale => locale.id);

      const usedIds = this.state.translations.map(t => t.localeId);

      const freeLocales = difference(ids, usedIds);

      if (!isEmpty(freeLocales)) {
        this.setState(
          {
            translations: [...this.state.translations, { id: lastId, localeId: head(freeLocales), content: '' }],
          },
          () => this.props.onChange(this.state.translations)
        );
      } else {
        window.logger.err(getTranslation('No more locales!'));
      }
    }
  }

  isAddTranslationDisabled() {
    return (
      !this.state.translations.length || this.state.translations.some(translation => translation.content.length === 0)
    );
  }

  render() {
    const {
      data: { error, loading, all_locales: locales },
      textArea } = this.props;

    if (loading || error) {
      return null;
    }

    const { translations } = this.state;
    
    const usedLocaleIds = translations.map(t => t.localeId);
    return (
      <div className="lingvo-translation__content">
        <List style={{marginBottom: '20px'}}>
          {translations.map(translation => (
            <List.Item
              key={translation.id}
              style={{marginBottom: '16px', paddingTop: '0', paddingBottom: '0'}}>
              <Translation
                locales={locales}
                translation={translation}
                translations={translations}
                onChangeTranslations={translations => this.setState({ translations }, () => this.props.onChange(translations))}
                usedLocaleIds={usedLocaleIds}
                onChange={this.onChange2}
                textArea={textArea}
              />
            </List.Item>
          ))}
        </List>
        <Button onClick={this.addTranslation} content={getTranslation("Add translation")} disabled={this.isAddTranslationDisabled()} className="lingvo-button-violet" />
      </div>
    );
  }
}

Translations.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    all_locales: PropTypes.array,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  translations: PropTypes.array,
};

Translations.defaultProps = {
  translations: [],
};

export default compose(graphql(localesQuery))(Translations);
