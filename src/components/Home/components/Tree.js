import React, { useContext } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Checkbox, Dropdown, Icon } from "semantic-ui-react";
import Immutable from "immutable";
import PropTypes from "prop-types";
import { compose, onlyUpdateForKeys } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import config from "config";
import { toggleDictionary } from "ducks/home";
import TranslationContext from "Layout/TranslationContext";

import "../published.scss";

let selectorStatus = false;

function toId(arr, prefix = null) {
  const joiner = prefix ? arr[prefix] : arr;
  return joiner.join("/");
}

const Perspective = ({ perspective: p }) => (
  <Dropdown.Item as={Link} to={`/dictionary/${toId(p.get("parent_id"))}/perspective/${toId(p.get("id"))}`}>
    {/* Permissions are shown in desktop or proxy version only */}
    {(config.buildType === "desktop" || config.buildType === "proxy") && (
      <span>
        {p.get("view") && <Icon name="book" />}
        {p.get("edit") && <Icon name="edit" />}
        {p.get("publish") && <Icon name="external share" />}
        {p.get("limited") && <Icon name="privacy" />}
      </span>
    )}
    <>
      <i className="lingvo-icon lingvo-icon_table" />
      {T(p.get("translations").toJS())}
    </>
  </Dropdown.Item>
);

Perspective.propTypes = {
  perspective: PropTypes.instanceOf(Immutable.Map).isRequired
};

const Dict = ({ dictionary, actions, selected, canSelectDictionaries }) => {
  const id = dictionary.get("id");
  const translations = dictionary.get("translations");
  const status = dictionary.get("status");
  let perspectives = dictionary.get("children");
  const authors = dictionary.getIn(["additional_metadata", "authors"]);
  const isDownloaded = dictionary.get("isDownloaded");
  const isChecked = selected.has(id);

  if (Array.isArray(perspectives)) {
    perspectives = Immutable.fromJS(perspectives);
  }

  const getTranslation = useContext(TranslationContext);

  return (
    <li className="dict">
      {(config.buildType === "desktop" || config.buildType === "proxy") && canSelectDictionaries && (
        <Checkbox defaultChecked={isChecked} onChange={() => actions.toggleDictionary(id.toJS())} />
      )}
      {(config.buildType === "desktop" || config.buildType === "proxy") && isDownloaded && <Icon name="download" />}

      {perspectives && !selectorStatus && perspectives.valueSeq ? (
        <Dropdown
          icon={null}
          trigger={
            <span className={(perspectives.size && "dict-name dict-name_link") || "dict-name"}>
              {translations && T(translations.toJS())} ({perspectives.size})
              {config.buildType === "server" && canSelectDictionaries && status === "Published" && (
                <Icon name="globe" />
              )}
            </span>
          }
          className="lingvo-dropdown-inline lingvo-dropdown-inline_perspectives"
        >
          <Dropdown.Menu>
            {perspectives.valueSeq().map(pers => (
              <Perspective key={pers.get("id")} perspective={pers} />
            ))}
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <span className="dict-name">
          {translations && T(translations.toJS())}{" "}
          {config.buildType === "server" && canSelectDictionaries && status === "Published" && <Icon name="globe" />}
        </span>
      )}

      {authors && authors.size != 0 && <span className="dict-authors">({authors.toArray().join(", ")})</span>}

      {selectorStatus && (
        <Link to="/distance_map/selected_languages" state={{ mainPerspectives: perspectives.toJS() }}>
          <Button style={{ margin: "0 0 3px 0" }} className="lingvo-button-green2">
            {getTranslation("Select")}
          </Button>
        </Link>
      )}
    </li>
  );
};

Dict.propTypes = {
  dictionary: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: PropTypes.shape({
    toggleDictionary: PropTypes.func.isRequired
  }).isRequired,
  selected: PropTypes.instanceOf(Immutable.Set).isRequired,
  canSelectDictionaries: PropTypes.bool.isRequired
};

const Dictionary = compose(
  connect(
    state => state.home,
    dispatch => ({ actions: bindActionCreators({ toggleDictionary }, dispatch) })
  ),
  onlyUpdateForKeys(["selected"])
)(Dict);

const Language = ({ language, canSelectDictionaries }) => {
  const translations = language.get("translations");
  const children = language.get("children");
  const id = language.get("id").toJS().toString();
  const parent_id = language.get("parent_id");
  const metadata = language.get("additional_metadata");
  let langClass = "lang-name";
  if (parent_id == null) {
    langClass = "root-lang-name";
  } else if (language.get("in_toc")) {
    langClass = "confirmed-lang-name";
  }

  return (
    <li className="lang" id={`lang_${id}`}>
      <span className={langClass}>{translations && T(translations.toJS())}</span>
      <ul>
        {children.map(n => (
          <Node key={n.get("id")} node={n} canSelectDictionaries={canSelectDictionaries} />
        ))}
      </ul>
    </li>
  );
};

Language.propTypes = {
  language: PropTypes.instanceOf(Immutable.Map).isRequired,
  canSelectDictionaries: PropTypes.bool
};

Language.defaultProps = {
  canSelectDictionaries: false
};

const Node = ({ node, canSelectDictionaries }) => {
  switch (node.get("type")) {
    case "language":
      return <Language language={node} canSelectDictionaries={canSelectDictionaries} />;
    case "dictionary":
      return <Dictionary dictionary={node} canSelectDictionaries={canSelectDictionaries} />;
    default:
      return <div>Unknown type</div>;
  }
};

Node.propTypes = {
  node: PropTypes.instanceOf(Immutable.Map).isRequired,
  canSelectDictionaries: PropTypes.bool.isRequired
};

const Tree = ({ tree, canSelectDictionaries, selectorMode }) => {
  selectorStatus = selectorMode;

  return (
    <ul className="tree">
      {tree.map(e => (
        <Node key={e.get("id")} node={e} canSelectDictionaries={canSelectDictionaries} />
      ))}
    </ul>
  );
};

Tree.propTypes = {
  tree: PropTypes.instanceOf(Immutable.List).isRequired,
  canSelectDictionaries: PropTypes.bool,
  selectorMode: PropTypes.bool
};

Tree.defaultProps = {
  canSelectDictionaries: false,
  selectorMode: false
};

export default compose()(Tree);
