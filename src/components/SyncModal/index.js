import React, { useContext, useState, useEffect, useMemo } from "react";
import { useMutation } from "hooks";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import { Button, Dimmer, Header, Icon, Message, Modal, Popup, Table } from "semantic-ui-react";
import PropTypes from "prop-types";
import { chooseTranslation as T } from "api/i18n";
import { isEqual } from "lodash";
import { applySyncMutation, queryListChanges } from "backend";
import config from "config";

import TranslationContext from "Layout/TranslationContext";

import "./styles.scss";

const SyncModal = ({ perspectiveId, perspectiveName, onClose, silentMode, action }) => {
  const getTranslation = useContext(TranslationContext);
  const [ applied, setApplied ] = useState(false);
  const [ errorMessage, setErrorMessage ] = useState(null);
  const debugFlag = true;

  const { data: ispSyncData, error: ispSyncError, loading: ispSyncLoading } = useQuery(queryListChanges, {
    variables: { remote: 'isp', syncBetween: ['isp','xal'], perspectiveId, action, debugFlag },
    onCompleted: ({list_changes: {triumph, message, warns}}) => {
      if (message) {
        setErrorMessage(message);
        //window.logger.warn(message);
      }
      if (warns) {
        console.log(`Possible errors: ${warns}`);
      }
    },
    fetchPolicy: "network-only"
  });

  const { data: xalSyncData, error: xalSyncError, loading: xalSyncLoading } = useQuery(queryListChanges, {
    variables: { remote: 'xal', syncBetween: ['isp','xal'], perspectiveId, action, debugFlag },
    onCompleted: ({list_changes: {triumph, message, warns}}) => {
      if (message) {
        setErrorMessage(message);
        //window.logger.warn(message);
      }
      if (warns) {
        console.log(`Possible errors: ${warns}`);
      }
    },
    fetchPolicy: "network-only"
  });

  const [applySync, { data: dataApply, error: errorApply, loading: loadingApply }] = useMutation(
    applySyncMutation, {
      variables: { perspectiveId, perspectiveName, syncBetween: ['isp','xal'], action, debugFlag },
      onCompleted: ({apply_sync: {triumph, message}}) => {
        if (message) {
          setErrorMessage(message);
          console.log(message);
        }
        setApplied(triumph);
      }
  });

  useEffect(() => {
    if (applied &&
        !loadingApply && !errorApply) {

      window.logger.suc(
        `${getTranslation("Started writing")}
        "${perspectiveName}".
        ${getTranslation("Please look at sidepanel with tasks")}.`);

      onClose();
    }
  }, [applied, loadingApply]);

  useEffect(() => {
    if (silentMode &&
        !ispSyncLoading && !ispSyncError &&
        !xalSyncLoading && !xalSyncError) {
      applySync();
    }
  }, [ispSyncData, ispSyncLoading, xalSyncData, xalSyncLoading]);

  const reportData = useMemo(() => {

    if(!ispSyncLoading && !ispSyncError &&
       !xalSyncLoading && !xalSyncError) {

      const inIsp = (config.buildType === "server");
      const {list_changes: localChanges} = inIsp ? ispSyncData : xalSyncData;
      const {list_changes: foreignChanges} = inIsp ? xalSyncData : ispSyncData;
      const syncPoint = localChanges.sync_point * 1000;

      for (const changes of [localChanges, foreignChanges]) {
        changes.report = {'entities': []};

        if (!changes.Entity) {
          continue;
        }

        for (const [id, entity] of Object.entries(changes.Entity)) {
          changes.report.entities.push({
            id,
            text: entity.content,
            updated: entity.updated_at * 1000,
            deleted: entity.marked_for_deletion
          });
        }
      }

      Object.keys(localChanges.report).forEach(key => {
        localChanges.report[key].forEach(localItem => {
          const remote = foreignChanges.report[key].find(remoteItem => isEqual(remoteItem.id, localItem.id));

          localItem.timeSynced = syncPoint;
          localItem.textRemote = remote?.text || "";
          localItem.timeRemote = remote?.updated || 0;
          localItem.deletedRemote = remote?.deleted;
        });

        foreignChanges.report[key].forEach(remoteItem => {
          const local = localChanges.report[key].find(localItem => isEqual(localItem.id, remoteItem.id));

          if (!local) {
            const elem = {};

            elem.id = remoteItem.id;
            elem.text = "";
            elem.updated = 0;
            elem.timeSynced = syncPoint;
            elem.textRemote = remoteItem.text;
            elem.timeRemote = remoteItem.updated;
            elem.deletedRemote = remoteItem.deleted;

            localChanges.report[key].push(elem);
          }
        });
      });

      return localChanges.report;

    }
  }, [ispSyncData, ispSyncLoading, xalSyncData, xalSyncLoading]);

  const getDate = (stamp) => {
    if (!stamp) {
      return "-"; //getTranslation("never");
    }
    const date = new Date(stamp);
    return date.toLocaleDateString('ru-RU');
  }

  return (
    <Modal className="lingvo-modal2" dimmer open closeIcon onClose={onClose} size="fullscreen">
      <Modal.Header>{`${getTranslation("Synchronize")} "${perspectiveName}"`}</Modal.Header>
      <Modal.Content>
        <div className="sync-content">
          <div className="sync-content__table">
            {(ispSyncLoading || xalSyncLoading || loadingApply) ? (
              <Dimmer active style={{ background: "none" }}>
                <Header as="h2" icon>
                  <Icon name="spinner" loading className="lingvo-spinner" />
                </Header>
              </Dimmer>
            ) : (
              ispSyncError ||
              xalSyncError ||
              errorApply ||
              !ispSyncData?.list_changes.triumph ||
              !xalSyncData?.list_changes.triumph ||
              dataApply && !applied
            ) ? (
              <Message negative>
                <Message.Header>{getTranslation("Synchronize data loading error")}</Message.Header>
                <div style={{ marginTop: "0.25em" }}>
                  {getTranslation(errorMessage ? errorMessage :
                    "Try reloading the page; if the error persists, please contact administrators.")}
                </div>
              </Message>
            ) : (
              <Table celled padded className="lingvo-perspective-table">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="th-type">&nbsp;</Table.HeaderCell>
                    <Table.HeaderCell className="th-name">{getTranslation("Local")}</Table.HeaderCell>
                    <Table.HeaderCell className="th-date">{getTranslation("Local Update")}</Table.HeaderCell>
                    <Table.HeaderCell className="th-date">{getTranslation("Synced")}</Table.HeaderCell>
                    <Table.HeaderCell className="th-date">{getTranslation("Remote Update")}</Table.HeaderCell>
                    <Table.HeaderCell className="th-name">{getTranslation("Remote")}</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Object.keys(reportData).map(key => {
                    return reportData[key]?.map(item => {
                      return (
                        <Table.Row key={item.id}>
                          <Table.Cell className="td-type">
                            {key === "languages" ? (
                              <Popup
                                inverted
                                content={getTranslation("language")}
                                trigger={<span className="lingvo-sync-type">L</span>}
                              />
                            ) : key === "dictionaries" ? (
                              <Popup
                                inverted
                                content={getTranslation("dictionary")}
                                trigger={<span className="lingvo-sync-type">D</span>}
                              />
                            ) : key === "perspectives" ? (
                              <Popup
                                inverted
                                content={getTranslation("perspective")}
                                trigger={<span className="lingvo-sync-type">P</span>}
                              />
                            ) : key === "entities" ? (
                              <Popup
                                inverted
                                content={getTranslation("entity")}
                                trigger={<span className="lingvo-sync-type">E</span>}
                              />
                            ) : null}
                          </Table.Cell>
                          <Table.Cell
                            className={
                              (item.updated > item.timeSynced &&
                                item.updated > item.timeRemote &&
                                (!item.deleted && "td-color-green" || "td-color-red")) ||
                              ""
                            }
                          >
                            {item.text}
                          </Table.Cell>
                          <Table.Cell
                            className={
                              (item.updated > item.timeSynced &&
                                item.updated > item.timeRemote &&
                                (!item.deleted && "td-date td-color-green" || "td-date td-color-red")) ||
                              "td-date"
                            }
                          >
                            {getDate(item.updated)}
                          </Table.Cell>
                          <Table.Cell className="td-date td-date-sync">{getDate(item.timeSynced)}</Table.Cell>
                          <Table.Cell
                            className={
                              (item.timeRemote > item.timeSynced &&
                                item.timeRemote > item.updated &&
                                (!item.deletedRemote && "td-date td-color-green" || "td-date td-color-red")) ||
                              "td-date"
                            }
                          >
                            {getDate(item.timeRemote)}
                          </Table.Cell>
                          <Table.Cell
                            className={
                              (item.timeRemote > item.timeSynced &&
                                item.timeRemote > item.updated &&
                                (!item.deletedRemote && "td-color-green" || "td-color-red")) ||
                              ""
                            }
                          >
                            {item.textRemote}
                          </Table.Cell>
                        </Table.Row>
                      );
                    });
                  })}
                </Table.Body>
              </Table>
            )}
          </div>
        </div>
      </Modal.Content>
      <Modal.Actions>
        {/*<div className="sync-transcript">
          <div className="sync-transcript__block">
            <p>
              <span className="sync-transcript__type">L</span> &mdash; {getTranslation("language")}
            </p>
            <p>
              <span className="sync-transcript__type">D</span> &mdash; {getTranslation("dictionary")}
            </p>
          </div>
          <div className="sync-transcript__block">
            <p>
              <span className="sync-transcript__type">P</span> &mdash; {getTranslation("perspective")}
            </p>
            <p>
              <span className="sync-transcript__type">E</span> &mdash; {getTranslation("entity")}
            </p>
          </div>
        </div>*/}
        <Button
          content={
            (ispSyncLoading || xalSyncLoading) ? (
              <span>
                {getTranslation("Loading")}... <Icon name="spinner" loading />
              </span>
            ) : loadingApply ? (
              <span>
                {getTranslation("Applying")}... <Icon name="spinner" loading />
              </span>
            ) : getTranslation("Apply")
          }
          onClick={() => applySync()}
          //loading={loadingApply}
          disabled={
            ispSyncLoading ||
            xalSyncLoading ||
            ispSyncError ||
            xalSyncError ||
            loadingApply ||
            errorApply ||
            errorMessage
          }
          className="lingvo-button-greenest lingvo-button-greenest_sync"
        />

        <Button content={getTranslation("Close")} onClick={onClose} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

SyncModal.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  perspectiveName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  silentMode: PropTypes.bool,
  action: PropTypes.string,
  debugFlag: PropTypes.bool,
};

export default SyncModal;
