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

  const user = useSelector(state => state.user.user);
  const signedIn = user.id !== undefined;
  const allowedSync = user.id === 1 || user.allowed_sync;

  const permissionSet = (perspective) => {

    const permissions = new Set();
    const perspectiveId = compositeIdToString(perspective.id);
    const proxy = config.buildType === "desktop" || config.buildType === "proxy";
    const proxyPermissions = proxy ? proxyData?.permission_lists : undefined;

    switch (true) {
      // Perspective has a twin for synchronization
      case allowedSync && perspective.single === "proxy":
        permissions.add('proxyPers');

      case allowedSync && perspective.single !== "local" && perspective.single !== "proxy":
        permissions.add('commonPers');

      // Perspective is locally writable
      case localPermission && localPermission[perspectiveId] || user.id !== 1:
        permissions.add('writable');

      // Perspective has no twin for synchronization or proxyPermissions is undefined
      case perspective.single === "local" || !proxyPermissions || user.id !== 1:
        permissions.add('available');
        break;

      // Perspective has proxyPermissions for current user and can be shown locally
      case !!proxyPermissions?.view.find(p => compositeIdToString(p.id) === perspectiveId):
        permissions.add('view').add('available');

      case !!proxyPermissions?.edit.find(p => compositeIdToString(p.id) === perspectiveId):
        permissions.add('edit').add('available');

      case !!proxyPermissions?.publish.find(p => compositeIdToString(p.id) === perspectiveId):
        permissions.add('publish').add('available');

      case !!proxyPermissions?.limited.find(p => compositeIdToString(p.id) === perspectiveId):
        permissions.add('limited').add('available');
    }

    switch (true) {
      case !permissions.has('available'):
        break;

      case permissions.has('proxyPers'):
        permissions.add('canBeAdded');

      case permissions.has('commonPers') && permissions.has('writable'):
        permissions.add('canBeSynced');

      case permissions.has('canBeAdded') || permissions.has('canBeSynced'):
        permissions.add('syncable');
    }

    return permissions;
  }

  const { getTranslation, chooseTranslation } = useTranslations();
  const [modalCount, setModalCount] = useState(0);

  const languageId = compositeIdToString(node[0]);
  const language = languageMap[languageId];
  const proxyLang = allowedSync && language.single === "proxy";

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

  const onSynchronize = ({ perspective, silentMode }) => {
    const action = (perspective.single === 'proxy') ? 'create' : 'edit';
    const refetching = (action === 'create');
    const permissions = permissionSet(perspective);

    if (action === 'create' && !permissions.has('canBeAdded') ||
        action === 'edit' && !permissions.has('canBeSynced')) {
      console.log("Недостаточно прав на загрузку или обновление перспективы!");
      return;
    }

    // +1 or no any change
    setModalCount(modalCount + refetching);
    openNewModal(SyncModal, {
      perspectiveId: perspective.id,
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

  return (
    <li className="node_lang" id={`language_${languageId}`}>
      <span className={langClass}>
        {proxyLang && language.translations && (
          <span
            className="lang-name-remote"
            onClick={() =>
              openConfirmModal(
                `${getTranslation(
                "Language")} "${chooseTranslation(language.translations)}" ${getTranslation(
                "with own dictionaries and perspectives")} ${getTranslation(
                "will be downloaded from another server")}?`,
                () => {
                  console.log("Загружаем язык");
                  // Probably we should check every dictionary for permissions
                  // User can synchronize a dictionary if he has 'edit' permissions
                  language.dictionaries.forEach(dictionary => {
                    dictionary.perspectives.forEach(perspective => {
                      onSynchronize({
                        perspective,
                        silentMode: true
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
          const proxyDict = allowedSync && dictionary.single === "proxy";
          const commonDict = allowedSync && dictionary.single !== "local" && dictionary.single !== "proxy";

          const isDownloaded = proxyData
            ? proxyData.dictionaries.find(d => d.id.toString() === dictionary.id.toString()) !== undefined
            : false;
          const authors = dictionary.additional_metadata.authors;
          const perspectives = dictionary.perspectives;
          return (
            <li
              key={index}
              className={`node_dict${proxyDict ? " node_dict_remote" : ""}`}
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

              {proxyDict ? (
                <span
                  className="dict-name dict-name_link"
                  onClick={() =>
                    openConfirmModal(
                      `${getTranslation(
                      "Dictionary")} "${chooseTranslation(dictionary.translations)}" ${getTranslation(
                      "with own perspectives")} ${getTranslation("will be downloaded from another server")}?`,
                      () => {
                        console.log("Загружаем словарь");
                        perspectives.forEach(perspective => {
                          onSynchronize({
                            perspective,
                            silentMode: true
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

                      const permissions = permissionSet(perspective);
                      const proxyPers = permissions.has('proxyPers');
                      const commonPers = permissions.has('commonPers');
                      const canBeSynced = permissions.has('canBeSynced');

                      if (!permissions.has('available')) {
                        return;
                      }

                      return (
                        <Dropdown.Item
                          key={compositeIdToString(perspective.id)}
                          as={proxyPers ? "span" : Link}
                          to={
                            !proxyPers
                              ? `/dictionary/${dictionary.id.join("/")}/perspective/${perspective.id.join("/")}`
                              : null
                          }
                          className={proxyPers ? "item_remote" : ""}
                          onClick={
                            (proxyPers && perspective.translations &&
                              (() =>
                                openConfirmModal(
                                  `${getTranslation(
                                    "Perspective")} "${chooseTranslation(perspective.translations)}" ${getTranslation(
                                    "will be downloaded from another server")}?`,
                                  () => {
                                    console.log("Загружаем перспективу");
                                    onSynchronize({
                                      perspective,
                                      silentMode: true
                                    });
                                  },
                                  getTranslation("Yes"),
                                  getTranslation("No")
                                ))) ||
                            null
                          }
                        >
                          <span>
                            {permissions.has('view') && <Icon name="book" />}
                            {permissions.has('edit') && <Icon name="edit" />}
                            {permissions.has('publish') && <Icon name="external share" />}
                            {permissions.has('limited') && <Icon name="privacy" />}
                          </span>

                          {perspective.translations && (
                            <>
                              <i className="lingvo-icon lingvo-icon_table" />
                              {chooseTranslation(perspective.translations)}
                            </>
                          )}

                          {commonPers && (
                            <Button
                              icon={<i className="lingvo-icon lingvo-icon_refresh" />}
                              onClick={event => {
                                console.log("Обновляем перспективу");
                                onSynchronize({
                                  perspective
                                });
                                event.preventDefault();
                              }}
                              disabled={!canBeSynced}
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
                  content={getTranslation("Published")}
                  className="lingvo-popup lingvo-popup_published"
                  hideOnScroll={true}
                />
              )}

              {commonDict && (
                <Button
                  icon={<i className="lingvo-icon lingvo-icon_refresh" />}
                  onClick={() => {
                    console.log("Обновляем словарь");
                    perspectives.forEach(perspective => {
                      onSynchronize({
                        perspective,
                        silentMode: true
                      });
                    });
                  }}
                  disabled={!perspectives.some(p => permissionSet(p).has('syncable'))}
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
