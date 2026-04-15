import React, { useState, useEffect, useMemo } from "react";
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

  const proxy = config.buildType === "desktop" || config.buildType === "proxy";
  const proxyPermission = proxy ? proxyData?.permission_lists : undefined;

  const user = useSelector(state => state.user.user);
  const signedIn = user.id !== undefined;
  const allowedSync = user.id === 1 || user.allowed_sync;

  const languageId = compositeIdToString(node[0]);
  const language = languageMap[languageId];

  /* Function to calculate permissions */
  const permissionSet = useMemo(() => {
    const permissions = {};

    language.dictionaries.forEach(dictionary => dictionary.perspectives.forEach(perspective => {
      const perspectiveId = compositeIdToString(perspective.id);

      /* Define various permissions */

      const proxyPers = allowedSync && perspective.single === "proxy";
      const commonPers = allowedSync && perspective.single !== "local" && perspective.single !== "proxy";
      const localPers = perspective.single === "local";

      const view = !localPers && !!proxyPermission?.view.find(p => compositeIdToString(p.id) === perspectiveId);
      const edit = !localPers && !!proxyPermission?.edit.find(p => compositeIdToString(p.id) === perspectiveId);
      const publish = !localPers && !!proxyPermission?.publish.find(p => compositeIdToString(p.id) === perspectiveId);
      const limited = !localPers && !!proxyPermission?.limited.find(p => compositeIdToString(p.id) === perspectiveId);

      const available = localPers || !proxyPermission || view || edit || publish || limited || user.id === 1;
      const writable = localPermission && localPermission[perspectiveId] || user.id === 1;

      const canBeAdded = available && proxyPers;
      const canBeSynced = available && writable && commonPers;
      const syncable = canBeAdded || canBeSynced;

      permissions[perspective.id] = {
        proxyPers,
        commonPers,
        available,
        view,
        edit,
        publish,
        limited,
        canBeAdded,
        canBeSynced,
        syncable
      };
    }));

    return permissions;

  }, [language, allowedSync, localPermission, proxyPermission]);

  const { getTranslation, chooseTranslation } = useTranslations();
  const [modalCount, setModalCount] = useState(0);
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
    const permissions = permissionSet[perspective.id];
    const action = permissions.proxyPers ? 'create' : 'edit';
    const refetching = permissions.proxyPers;

    if (action === 'create' && !permissions.canBeAdded ||
        action === 'edit' && !permissions.canBeSynced
    ) {
      const message = `${getTranslation(
        "Not enough permissions to download or update perspective")} "${chooseTranslation(perspective.translations)}"`;
      console.log(message);
      window.logger.warn(message);
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
          const perspectives = dictionary.perspectives.filter(p => permissionSet[p.id].available);
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

                      const permissions = permissionSet[perspective.id];

                      return (
                        <Dropdown.Item
                          key={compositeIdToString(perspective.id)}
                          as={permissions.proxyPers ? "span" : Link}
                          to={
                            !permissions.proxyPers
                              ? `/dictionary/${dictionary.id.join("/")}/perspective/${perspective.id.join("/")}`
                              : null
                          }
                          className={permissions.proxyPers ? "item_remote" : ""}
                          onClick={
                            (permissions.proxyPers && perspective.translations &&
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
                            {permissions.view && <Icon name="book" />}
                            {permissions.edit && <Icon name="edit" />}
                            {permissions.publish && <Icon name="external share" />}
                            {permissions.limited && <Icon name="privacy" />}
                          </span>

                          {perspective.translations && (
                            <>
                              <i className="lingvo-icon lingvo-icon_table" />
                              {chooseTranslation(perspective.translations)}
                            </>
                          )}

                          {permissions.commonPers && (
                            <Button
                              icon={<i className="lingvo-icon lingvo-icon_refresh" />}
                              onClick={event => {
                                console.log("Обновляем перспективу");
                                onSynchronize({
                                  perspective
                                });
                                event.preventDefault();
                              }}
                              disabled={!permissions.canBeSynced}
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
                  onClick={() =>
                    openConfirmModal(
                      `${getTranslation(
                      "Dictionary")} "${chooseTranslation(dictionary.translations)}" ${getTranslation(
                      "with own perspectives")} ${getTranslation("will be renewed")}?`,
                      () => {
                        console.log("Обновляем словарь");
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
                  disabled={!perspectives.some(p => permissionSet[p.id].syncable)}
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
