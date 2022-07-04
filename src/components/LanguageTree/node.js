import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Checkbox, Dropdown, Header, Icon, Popup } from "semantic-ui-react";
import PropTypes from "prop-types";

import { chooseTranslation } from "api/i18n";
// eslint-disable-next-line import/no-unresolved
import config from "config";
import { useTranslations } from "hooks";
import { compositeIdToString } from "utils/compositeId";

/** Language tree node of a language. */
export const LanguageNode = ({
  node,
  languageMap,
  dictionaryIdSet,
  dictionaryIdSetReverse,
  selected,
  setSelected,
  proxyData
}) => {
  const { getTranslation, chooseTranslation } = useTranslations();
  const user = useSelector(state => state.user.user);

  const signedIn = user.id !== undefined;
  const publishedStr = getTranslation("Published");

  const languageId = compositeIdToString(node[0]);
  const language = languageMap[languageId];

  let langClass = "lang-name";
  if (!language.parent_id) {
    langClass = "root-lang-name";
  } else if (language.in_toc) {
    langClass = "confirmed-lang-name";
  }

  const dictionaries = dictionaryIdSet
    ? language.dictionaries.filter(dictionary => {
        const check = dictionaryIdSet.has(compositeIdToString(dictionary.id));
        return dictionaryIdSetReverse ? !check : check;
      })
    : language.dictionaries;

  return (
    <li className="node_lang" id={`language_${languageId}`}>
      <span className={langClass}>{language.translations && chooseTranslation(language.translations)}</span>
      <ul>
        {node[1] &&
          node[1].map((node, index) => (
            <LanguageNode
              key={index}
              node={node}
              languageMap={languageMap}
              dictionaryIdSet={dictionaryIdSet}
              dictionaryIdSetReverse={dictionaryIdSetReverse}
              selected={selected}
              setSelected={setSelected}
            />
          ))}
        {dictionaries.map((dictionary, index) => {
          const isDownloaded = proxyData
            ? proxyData.dictionaries.find(d => d.id.toString() === dictionary.id.toString()) !== undefined
            : false;
          const authors = dictionary.additional_metadata.authors;
          const perspectives = dictionary.perspectives;
          return (
            <li key={index} className="node_dict">
              {(config.buildType === "desktop" || config.buildType === "proxy") && signedIn && (
                <Checkbox
                  defaultChecked={selected.includes(dictionary.id)}
                  onChange={() => {
                    const newSelected = selected.slice();
                    const idx = newSelected.indexOf(dictionary.id);
                    if (idx === -1) {
                      newSelected.push(dictionary.id);
                    } else {
                      newSelected.splice(idx, 1);
                    }
                    setSelected(newSelected);
                  }}
                />
              )}
              {isDownloaded && <Icon name="download" />}
              {!perspectives || perspectives.length <= 0 ? (
                <span className="dict-name">
                  {dictionary.translations && chooseTranslation(dictionary.translations)}{" "}
                </span>
              ) : (
                <Dropdown
                  inline
                  icon={null}
                  trigger={
                    <span className="dict-name">
                      {dictionary.translations && chooseTranslation(dictionary.translations)} ({perspectives.length})
                    </span>
                  }
                >
                  <Dropdown.Menu>
                    {perspectives.map(perspective => {
                      const permissions = proxyData ? proxyData.permission_lists : undefined;
                      return (
                        <Dropdown.Item
                          key={compositeIdToString(perspective.id)}
                          as={Link}
                          to={`/dictionary/${dictionary.id.join("/")}/perspective/${perspective.id.join("/")}`}
                        >
                          {(config.buildType === "desktop" || config.buildType === "proxy") && (
                            <span>
                              {permissions.view.find(
                                p => compositeIdToString(p.id) !== compositeIdToString(perspective.id)
                              ) !== undefined && <Icon name="book" />}
                              {permissions.edit.find(
                                p => compositeIdToString(p.id) !== compositeIdToString(perspective.id)
                              ) !== undefined && <Icon name="edit" />}
                              {permissions.publish.find(
                                p => compositeIdToString(p.id) !== compositeIdToString(perspective.id)
                              ) !== undefined && <Icon name="external share" />}
                              {permissions.limited.find(
                                p => compositeIdToString(p.id) !== compositeIdToString(perspective.id)
                              ) !== undefined && <Icon name="privacy" />}
                            </span>
                          )}
                          {perspective.translations && chooseTranslation(perspective.translations)}
                        </Dropdown.Item>
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              )}
              {authors && authors.length !== 0 && <span className="dict-authors">({authors.join(", ")})</span>}
              {config.buildType === "server" && signedIn && dictionary.english_status === "Published" && (
                <Popup
                  trigger={
                    <i className="lingvo-icon lingvo-icon_published" />
                  }
                  content={publishedStr}
                  className="lingvo-popup lingvo-popup_published"
                  hideOnScroll={true}
                />
              )}
            </li>
          );
        })}
      </ul>
    </li>
  );
};

/** Language tree node of a grant. */
export const GrantNode = ({
  node,
  groupMap: grantMap,
  dictionaryIdSet,
  languageMap,
  selected,
  setSelected,
  proxyData
}) => {
  const { getTranslation, chooseTranslation } = useTranslations();

  const grantId = String(node[0]);
  const grant = grantMap[grantId];

  return (
    <div id={`grant_${grantId}`} className="node_grant">
      <Header>
        {chooseTranslation(grant.translations)} ({chooseTranslation(grant.issuer_translations)} {grant.grant_number})
      </Header>
      {node[1].map((node, index) => (
        <LanguageNode
          key={index}
          node={node}
          languageMap={languageMap}
          dictionaryIdSet={dictionaryIdSet}
          selected={selected}
          setSelected={setSelected}
          proxyData={proxyData}
        />
      ))}
    </div>
  );
};

/** Language tree node of an organization. */
export const OrganizationNode = ({
  node,
  groupMap: organizationMap,
  dictionaryIdSet,
  languageMap,
  selected,
  setSelected,
  proxyData
}) => {
  const { getTranslation, chooseTranslation } = useTranslations();

  const organizationId = String(node[0]);
  const organization = organizationMap[organizationId];

  return (
    <div id={`organization_${organizationId}`} className="node_grant">
      <Header>{chooseTranslation(organization.translations)}</Header>
      {node[1].map((node, index) => (
        <LanguageNode
          key={index}
          node={node}
          languageMap={languageMap}
          dictionaryIdSet={dictionaryIdSet}
          selected={selected}
          setSelected={setSelected}
          proxyData={proxyData}
        />
      ))}
    </div>
  );
};

/** Language tree node of languages with dictionaries outside any grant / any organization. */
export const IndividualNode = ({ node, languageMap, dictionaryIdSet, selected, setSelected, proxyData }) => {
  const { getTranslation, chooseTranslation } = useTranslations();

  return (
    <div className="node_grant">
      <div className="grant-title">{getTranslation("Individual work")}</div>
      {node[1].map((node, index) => (
        <LanguageNode
          key={index}
          node={node}
          languageMap={languageMap}
          dictionaryIdSet={dictionaryIdSet}
          dictionaryIdSetReverse={true}
          selected={selected}
          setSelected={setSelected}
          proxyData={proxyData}
        />
      ))}
    </div>
  );
};
