import React, { useState, useEffect } from "react";
import { connect, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Checkbox, Dropdown, Header, Icon, Popup } from "semantic-ui-react";
import { bindActionCreators } from "redux";

// eslint-disable-next-line import/no-unresolved
import config from "config";
import { useTranslations } from "hooks";
import { compositeIdToString } from "utils/compositeId";
import SyncModal from "components/SyncModal";

import { openModal, closeModal } from "ducks/modals";
import { openModal as openConfirmModal } from "ducks/confirm";

/** Language tree node of a language. */

const LangNode = ({
  node,
  languageMap,
  dictionaryIdSet,
  dictionaryIdSetReverse,
  selected,
  setSelected,
  proxyData,
  refreshLangTree,
  openConfirmModal,
  openModal: openNewModal,
  closeModal,
  localPermission
}) => {
  const { getTranslation, chooseTranslation } = useTranslations();
  const user = useSelector(state => state.user.user);
  const [modalCount, setModalCount] = useState(0);

  const signedIn = user.id !== undefined;
  const allowedSync = user.id === 1 || user.allowed_sync;
  const publishedStr = getTranslation("Published");

  const languageId = compositeIdToString(node[0]);
  const language = languageMap[languageId];
  const proxyLang = language.single === "proxy";

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

  const onSynchronize = ({ id, silentMode, action, refetching=true }) => {
    // +1 or no any change
    setModalCount(modalCount + refetching);
    openNewModal(SyncModal, {
      perspectiveId: id,
      silentMode,
      action,
      onClose: () => {
        closeModal();
        // -1 or no any change
        setModalCount(modalCount - refetching);
      }
    });
  };

  useEffect(() => {
    if (modalCount <= 0) {
      refreshLangTree();
    }
  }, [modalCount]);

  const proxy = config.buildType === "desktop" || config.buildType === "proxy";
  const permissions = proxy ? proxyData?.permission_lists : undefined;

  return (
    <li className="node_lang" id={`language_${languageId}`}>
      <span className={langClass}>
        {allowedSync && proxyLang && language.translations && (
          <span
            className="lang-name-remote"
            onClick={() =>
              openConfirmModal(
                `${getTranslation("Language")} "${chooseTranslation(language.translations)}" -> "${chooseTranslation(
                  language.translations
                )}" ${getTranslation("will be downloaded from another server")}?`,
                () => {
                  console.log("Загружаем язык");
                  // Probably we should check every dictionary for permissions
                  // User can synchronize a dictionary if he has 'edit' permissions
                  language.dictionaries.forEach(dictionary => {
                    dictionary.perspectives.forEach(perspective => {
                      onSynchronize({
                        id: perspective.id,
                        silentMode: true,
                        action: 'create'
                      });
                    });
                  });
                },
                getTranslation("Yes"),
                getTranslation("No")
              )
            }
          >
            {chooseTranslation(language.translations)}
          </span>
        ) ||
          (language.translations && chooseTranslation(language.translations))}
      </span>
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
              proxyData={proxyData}
              refreshLangTree={refreshLangTree}
              localPermission={localPermission}
            />
          ))}
        {dictionaries.map((dictionary, index) => {
          const dictionaryId = compositeIdToString(dictionary.id);
          const proxyDict = dictionary.single === "proxy";
          const commonDict = dictionary.single !== "local" && dictionary.single !== "proxy";

          const isDownloaded = proxyData
            ? proxyData.dictionaries.find(d => d.id.toString() === dictionary.id.toString()) !== undefined
            : false;
          const authors = dictionary.additional_metadata.authors;
          const perspectives = dictionary.perspectives;
          return (
            <li
              key={index}
              className={`node_dict${allowedSync && proxyDict ? " node_dict_remote" : ""}`}
            >
              {/* This elements went from old realization and not actual now */
              /*
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
              */}

              {allowedSync && proxyDict ? (
                <span
                  className="dict-name dict-name_link"
                  onClick={() =>
                    openConfirmModal(
                      `${getTranslation("Dictionary")} "${chooseTranslation(
                        dictionary.translations
                      )}" -> "${chooseTranslation(dictionary.translations)}" ${getTranslation(
                        "will be downloaded from another server"
                      )}?`,
                      () => {
                        console.log("Загружаем словарь");
                        perspectives.forEach(perspective => {
                          onSynchronize({
                            id: perspective.id,
                            silentMode: true,
                            action: 'create'
                          });
                        });
                      },
                      getTranslation("Yes"),
                      getTranslation("No")
                    )
                  }
                >
                  {dictionary.translations && chooseTranslation(dictionary.translations)}
                </span>
              ) : !perspectives || perspectives.length <= 0 ? (
                <span className="dict-name">
                  {dictionary.translations && chooseTranslation(dictionary.translations)}{" "}
                </span>
              ) : (
                <Dropdown
                  icon={null}
                  trigger={
                    <span className={(perspectives.length && "dict-name dict-name_link") || "dict-name"}>
                      {dictionary.translations && chooseTranslation(dictionary.translations)} ({perspectives.length})
                    </span>
                  }
                  className="lingvo-dropdown-inline lingvo-dropdown-inline_perspectives"
                >
                  <Dropdown.Menu>
                    {perspectives.map((perspective, index) => {

                      if (!perspective.translations || !chooseTranslation(perspective.translations)) {
                        return;
                      }

                      const perspectiveId = compositeIdToString(perspective.id);

                      const view = !!permissions?.view.find(
                        p => compositeIdToString(p.id) === perspectiveId
                      );
                      const edit = !!permissions?.edit.find(
                        p => compositeIdToString(p.id) === perspectiveId
                      );
                      const publish = !!permissions?.publish.find(
                        p => compositeIdToString(p.id) === perspectiveId
                      );
                      const limited = !!permissions?.limited.find(
                        p => compositeIdToString(p.id) === perspectiveId
                      );

                      const proxyPers = perspective.single === "proxy";
                      const commonPers = perspective.single !== "local" && perspective.single !== "proxy";

                      if (
                        user.id !== 1 && (proxyPers || commonPers) &&
                        permissions && !(view || edit || publish || limited)
                      ) {
                        return;
                      }

                      return (
                        <Dropdown.Item
                          key={perspectiveId}
                          as={allowedSync && proxyPers ? "span" : Link}
                          to={
                            !proxyPers
                              ? `/dictionary/${dictionary.id.join("/")}/perspective/${perspective.id.join("/")}`
                              : null
                          }
                          className={allowedSync && proxyPers ? "item_remote" : ""}
                          onClick={
                            (allowedSync && proxyPers &&
                              perspective.translations &&
                              (() =>
                                openConfirmModal(
                                  `${getTranslation("Perspective")} "${chooseTranslation(
                                    perspective.translations
                                  )}" -> "${chooseTranslation(perspective.translations)}" ${getTranslation(
                                    "will be downloaded from another server"
                                  )}?`,
                                  () => {
                                    console.log("Загружаем перспективу");
                                    onSynchronize({
                                      id: perspective.id,
                                      silentMode: true,
                                      action: 'create'
                                    });
                                  },
                                  getTranslation("Yes"),
                                  getTranslation("No")
                                ))) ||
                            null
                          }
                        >
                          {permissions && (
                            <span>
                              {view && <Icon name="book" />}
                              {edit && <Icon name="edit" />}
                              {publish && <Icon name="external share" />}
                              {limited && <Icon name="privacy" />}
                            </span>
                          )}

                          {perspective.translations && (
                            <>
                              <i className="lingvo-icon lingvo-icon_table" />
                              {chooseTranslation(perspective.translations)}
                            </>
                          )}

                          {allowedSync && commonPers && (
                            <Button
                              icon={<i className="lingvo-icon lingvo-icon_refresh" />}
                              onClick={event => {
                                console.log("Обновляем перспективу");
                                onSynchronize({
                                  id: perspective.id,
                                  refetching: false
                                });
                                event.preventDefault();
                              }}
                              disabled={
                                !localPermission ||
                                !localPermission[compositeIdToString(perspective.id)]
                              }
                              className="lingvo-button-green lingvo-lang-tree-button"
                            />
                          )}
                        </Dropdown.Item>
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              )}

              {authors && authors.length !== 0 && <span className="dict-authors">({authors.join(", ")})</span>}
              {config.buildType === "server" && signedIn && dictionary.english_status === "Published" && (
                <Popup
                  trigger={<i className="lingvo-icon lingvo-icon_published" />}
                  content={publishedStr}
                  className="lingvo-popup lingvo-popup_published"
                  hideOnScroll={true}
                />
              )}

              {allowedSync && commonDict && (
                <Button
                  icon={<i className="lingvo-icon lingvo-icon_refresh" />}
                  onClick={() => {
                    console.log("Обновляем словарь");
                    perspectives.forEach(perspective => {
                      onSynchronize({
                        id: perspective.id,
                        silentMode: true,
                        refetching: false,
                        action: perspective.single === "proxy" ? 'create' : 'edit'
                      });
                    });
                  }}
                  disabled={
                    !localPermission ||
                    perspectives.every(
                      perspective => !localPermission[compositeIdToString(perspective.id)])
                  }
                  className="lingvo-button-green lingvo-lang-tree-button"
                />
              )}
            </li>
          );
        })}
      </ul>
    </li>
  );
};

export const LanguageNode = connect(null, dispatch => bindActionCreators({ openModal, openConfirmModal, closeModal }, dispatch))(
  LangNode
);

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
