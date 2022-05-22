import React from "react";
import { Button, Form, Icon, Input, List, Message, Select } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { difference, head, isEmpty, nth } from "lodash";
import PropTypes from "prop-types";
import { compose } from "recompose";

import TranslationContext from "Layout/TranslationContext";

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
  }

  onChangeContent(_event, data) {
    const { onChange } = this.props;
    this.setState({ content: data.value }, () => onChange(this.state));
  }

  onChangeLocale(_event, data) {
    const { locales } = this.props;
    const { onChange } = this.props;
    const locale = locales.find(l => l.shortcut === data.value);
    if (locale) {
      this.setState({ localeId: locale.id }, () => onChange(this.state));
    }
  }

  render() {
    const { locales, usedLocaleIds, textArea } = this.props;

    const options = locales
      .filter(locale => usedLocaleIds.indexOf(locale.id) < 0 || locale.id === this.state.localeId)
      .map(locale => ({ key: locale.shortcut, text: locale.intl_name, value: locale.shortcut }));

    const selectedLocale = locales.find(locale => locale.id === this.state.localeId);

    return textArea ? (
      <div>
        <Form>
          <Form.Select value={selectedLocale.shortcut} options={options} onChange={this.onChangeLocale} />
          <Form.TextArea placeholder="" value={this.state.content} onChange={this.onChangeContent} />
        </Form>
      </div>
    ) : (
      <Input
        placeholder=""
        value={this.state.content}
        onChange={this.onChangeContent}
        action
        className="label-input-adaptive"
      >
        <input />
        <Select value={selectedLocale.shortcut} options={options} onChange={this.onChangeLocale} />
      </Input>
    );
  }
}

Translation.propTypes = {
  locales: PropTypes.array.isRequired,
  usedLocaleIds: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  translation: PropTypes.object.isRequired,
  textArea: PropTypes.bool
};

class Translations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      translations: props.translations || [],
      initialize: props.initialize
    };
    this.checkInit = this.checkInit.bind(this);
    this.addTranslation = this.addTranslation.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  checkInit() {
    if (!this.state.initialize) {
      return;
    }

    const { loading, error } = this.props.data;

    if (loading || error) {
      return;
    }

    this.state.initialize = false;

    if (this.state.translations.length > 0) {
      return;
    }

    this.addTranslation();
  }

  componentDidMount() {
    this.checkInit();
  }

  componentDidUpdate() {
    this.checkInit();
  }

  onChange(translation) {
    const updateState = this.state.translations.map(t => {
      if (t.id === translation.id) {
        return {
          ...t,
          localeId: translation.localeId,
          content: translation.content
        };
      }
      return t;
    });

    this.setState(
      {
        translations: updateState
      },
      () => this.props.onChange(this.state.translations)
    );
  }

  addTranslation() {
    const {
      data: { error, loading, all_locales: locales }
    } = this.props;
    if (!loading && !error) {
      const lastId =
        nth(
          this.state.translations.map(t => t.id),
          -1
        ) + 1 || 1;
      // pick next free locale id
      const ids = locales.map(locale => locale.id);
      const usedIds = this.state.translations.map(t => t.localeId);
      const freeLocales = difference(ids, usedIds);
      if (!isEmpty(freeLocales)) {
        this.setState(
          {
            translations: [...this.state.translations, { id: lastId, localeId: head(freeLocales), content: "" }]
          },
          () => this.props.onChange(this.state.translations)
        );
      } else {
        window.logger.err(this.context("No more locales!"));
      }
    }
  }

  render() {
    const {
      data: { error, loading, all_locales: locales },
      textArea
    } = this.props;

    if (error) {
      return (
        <Message negative compact>
          <Message.Header>{this.context("Locale data loading error")}</Message.Header>
          <div style={{ marginTop: "0.25em" }}>
            {this.context("Try reloading the page; if the error persists, please contact administrators.")}
          </div>
        </Message>
      );
    }

    if (loading) {
      return (
        <span>
          {this.context("Loading locale data")}... <Icon name="spinner" loading />
        </span>
      );
    }

    const { translations } = this.state;

    const usedLocaleIds = translations.map(t => t.localeId);
    return (
      <div>
        <List>
          {translations.map(translation => (
            <List.Item key={translation.id} style={{ marginBottom: "1em", paddingTop: "0em", paddingBottom: "0em" }}>
              <Translation
                locales={locales}
                translation={translation}
                usedLocaleIds={usedLocaleIds}
                onChange={this.onChange}
                textArea={textArea}
              />
            </List.Item>
          ))}
        </List>
        <Button basic onClick={this.addTranslation} icon="plus" content={this.context("Add")} />
      </div>
    );
  }
}

Translations.contextType = TranslationContext;

Translations.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object,
    all_locales: PropTypes.array
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  translations: PropTypes.array,
  textArea: PropTypes.bool
};

Translations.defaultProps = {
  translations: []
};

export default compose(graphql(localesQuery))(Translations);
