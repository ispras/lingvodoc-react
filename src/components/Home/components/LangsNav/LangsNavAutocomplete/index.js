import React, { useContext } from "react";
import Autocomplete from "react-autocomplete";
import { Container, Form, Icon, Segment } from "semantic-ui-react";
import PropTypes from "prop-types";
import { compose, lifecycle, mapProps, withHandlers, withState } from "recompose";

import { chooseTranslation as T } from "api/i18n";
import TranslationContext from "Layout/TranslationContext";
import debounce from "utils/debounce";

import { getScrollContainer, goToLanguage } from "../../../common/";

import "./styles.scss";

/* ----------- PROPS ----------- */
const autocompleteStyle = {};

const classNames = {
  substrateContainer: "langs-nav-autocomplete__substrate",
  main: "langs-nav-autocomplete langs-nav-autocomplete_search",
  item: "langs-nav-autocomplete__item",
  itemHighlighted: "langs-nav-autocomplete__item_highlighted",
  wrap: "langs-nav-autocomplete__wrap",
  wrapFixed: "langs-nav-autocomplete__wrap_fixed",
  form: "langs-nav-autocomplete__form",
  input: "langs-nav-autocomplete__input",
  disableBesideButton: "langs-nav-autocomplete__disable-beside"
};

const wrapperProps = {
  className: classNames.main
};

/* ----------- COMPONENT HELPERS ----------- */
const getComponentContainer = () => document.querySelector(`.${classNames.substrateContainer}`);

/* ----------- ENHANCERS ----------- */
const addHandlers = withHandlers({
  onLangChange:
    ({ setLanguage }) =>
    ev =>
      setLanguage(ev.target.value),
  onLangSelect:
    ({ setLanguage, langsNavAcBeside, setLangsNavAcBeside }) =>
    (value, item) => {
      if (!langsNavAcBeside) {
        setLangsNavAcBeside(true);
      }

      goToLanguage(item.id);

      return setLanguage(value);
    },
  disableLangsNavAcBeside:
    ({ setLangsNavAcBeside, setLanguage }) =>
    () => {
      setLangsNavAcBeside(false);
      setLanguage("");
    },
  onScroll: ({ setLangsNavAcFixed, langsNavAcFixed }) =>
    debounce(() => {
      const container = getComponentContainer();
      const offset = container.getBoundingClientRect().top;

      if (offset <= 0) {
        if (!langsNavAcFixed) {
          setLangsNavAcFixed(true);
        }
      } else if (langsNavAcFixed) {
        setLangsNavAcFixed(false);
      }
    }, 10)
});

const addLifeCycle = lifecycle({
  componentWillUnmount() {
    const { onScroll, scrollContainer } = this.props;

    scrollContainer.removeEventListener("scroll", onScroll);
  },
  componentDidUpdate(prevProps) {
    const { langsNavAcBeside, onScroll, scrollContainer } = this.props;

    if (!langsNavAcBeside && prevProps.langsNavAcBeside) {
      scrollContainer.removeEventListener("scroll", onScroll);
    }

    if (langsNavAcBeside && !prevProps.langsNavAcBeside) {
      scrollContainer.addEventListener("scroll", onScroll);
      onScroll();
    }
  }
});

const propsHandler = mapProps(props => ({
  ...props,
  scrollContainer: getScrollContainer()
}));

const enhance = compose(
  propsHandler,
  withState("language", "setLanguage", ""),
  withState("langsNavAcBeside", "setLangsNavAcBeside", false),
  withState("langsNavAcFixed", "setLangsNavAcFixed", false),
  addHandlers,
  addLifeCycle
);

/* ----------- LANGUAGE HELPERS ----------- */
const getLangValue = lang => T(lang.translations);

const shouldLangRender = (item, value) =>
  T(item.translations).toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1;

const renderLangItem = (item, isHighlighted) => (
  <div key={item.id} className={`${classNames.item} ${isHighlighted ? classNames.itemHighlighted : ""}`}>
    {T(item.translations)}
  </div>
);

/* ----------- COMPONENT ----------- */
const LangsNavAutocomplete = props => {
  const { data, onLangChange, onLangSelect, language, langsNavAcBeside, langsNavAcFixed, disableLangsNavAcBeside } =
    props;

  const getTranslation = useContext(TranslationContext);

  return (
    <div className={classNames.substrateContainer}>
      <Segment className={`${classNames.wrap} ${langsNavAcBeside && langsNavAcFixed ? classNames.wrapFixed : ""}`}>
        <Form className={classNames.form}>
          <Form.Field>
            <Autocomplete
              inputProps={{ placeholder: getTranslation("Start typing language name"), className: classNames.input }}
              menuStyle={autocompleteStyle}
              wrapperProps={wrapperProps}
              getItemValue={getLangValue}
              items={data}
              autoHighlight
              renderItem={renderLangItem}
              shouldItemRender={shouldLangRender}
              value={language}
              onChange={onLangChange}
              onSelect={onLangSelect}
            />
            {langsNavAcBeside && langsNavAcFixed ? (
              <button
                className={classNames.disableBesideButton}
                type="button"
                onClick={disableLangsNavAcBeside}
                aria-label={getTranslation("Закрыть ввод языка")}
              >
                <Icon name="window close outline" />
              </button>
            ) : null}
          </Form.Field>
        </Form>
      </Segment>
    </div>
  );
};

/* ----------- PROPS VALIDATION ----------- */
LangsNavAutocomplete.propTypes = {
  data: PropTypes.array.isRequired,
  onLangChange: PropTypes.func.isRequired,
  onLangSelect: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  langsNavAcBeside: PropTypes.bool.isRequired,
  langsNavAcFixed: PropTypes.bool.isRequired,
  disableLangsNavAcBeside: PropTypes.func.isRequired,
  onScroll: PropTypes.func.isRequired,
  scrollContainer: PropTypes.object.isRequired
};

export default enhance(LangsNavAutocomplete);
