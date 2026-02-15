import React, { useContext, useState, useEffect } from "react";
import { useMutation } from "hooks";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import { Button, Dimmer, Header, Icon, Message, Modal, Popup, Table } from "semantic-ui-react";
import PropTypes from "prop-types";
import { chooseTranslation as T } from "api/i18n";
import { isEqual } from "lodash";
import { applySyncMutation, queryListChanges } from "backend";

import TranslationContext from "Layout/TranslationContext";

import "./styles.scss";

const SyncModal = ({ columns, onClose, perspectiveId, foreignChanges }) => {
  const getTranslation = useContext(TranslationContext);

  const [ ispSyncData, setIspSyncData ] = useState(null);
  const [ xalSyncData, setXalSyncData ] = useState(null);
  const [ applied, setApplied ] = useState(false);
  const debugFlag = false;

  const { error: ispSyncError, loading: ispSyncLoading } = useQuery(queryListChanges, {
    variables: { remote: "isp", perspectiveId, debugFlag },
    onCompleted: ({ list_changes: ispSyncData }) => {
      setIspSyncData(ispSyncData);
      console.log(`Possible errors: ${ispSyncData.errors}`);
    },
    fetchPolicy: "network-only"
  });

  const { error: xalSyncError, loading: xalSyncLoading } = useQuery(queryListChanges, {
    variables: { remote: "xal", perspectiveId, debugFlag },
    onCompleted: ({ list_changes: xalSyncData }) => {
      setXalSyncData(xalSyncData);
      console.log(`Possible errors: ${xalSyncData.errors}`);
    },
    fetchPolicy: "network-only"
  });

  const [applySync, { error: errorApply, loading: loadingApply }] = useMutation(
    applySyncMutation, {
      variables: { perspectiveId, remote: 'xal', debugFlag: true },
      onCompleted: ({data: {apply_sync: {triumph, message} }}) => {
        if (message)
          console.log(message)
      }
  });

  useEffect(() => {
    if (applied && !loadingApply && !errorApply) {
      onClose();
    }
  }, [applied, loadingApply, errorApply]);

  const dataCore = {
    languages: [
      ["2025-11-15", "2025-11-16", { id: "1", text: "Some text" }],
      ["2025-11-15", "2025-11-15", { id: "2", text: "Some text 2" }]
    ],
    dictionaries: [
      ["2025-11-15", "2025-11-21", { id: "3", text: "Local dictionary name" }],
      ["2025-11-15", "2025-11-22", { id: "4", text: "Local dictionary name 2" }],
      ["2025-11-15", "2025-11-23", { id: "5", text: "Local dictionary name 3" }]
    ],
    perspectives: [
      ["2025-11-15", "2025-11-15", { id: "6", text: "Common perspective name" }],
      ["2025-11-15", "2025-11-21", { id: "11", text: "Common perspective name 2" }], // нет в dataSatellite
      ["2025-11-15", "2025-11-15", { id: "12", text: "Common perspective name 3" }] // нет в dataSatellite
    ],
    entities: [
      ["2025-11-15", "2025-11-15", { id: "7", text: "Old text" }],
      ["2025-11-15", "2025-11-19", { id: "8", text: "Locally edited text" }],
      [null, null, { id: "9", text: "" }],
      [null, "2025-11-20", { id: "10", text: "Some locally added entity" }]
    ]
  };

  const dataSatellite = {
    languages: [
      ["2025-11-15", "2025-11-17", { id: "1", text: "Some new text" }],
      ["2025-11-15", "2025-11-17", { id: "2", text: "Some new text 2" }]
    ],
    dictionaries: [
      ["2025-11-15", "2025-11-15", { id: "3", text: "Remote dictionary name" }],
      ["2025-11-15", "2025-11-15", { id: "4", text: "Remote dictionary name 2" }],
      ["2025-11-15", "2025-11-15", { id: "5", text: "Remote dictionary name 3" }],
      ["2025-11-15", "2025-11-15", { id: "13", text: "Remote dictionary name 4" }], // нет в dataCore
      ["2025-11-15", "2025-12-01", { id: "14", text: "Remote dictionary name 5" }] // нет в dataCore
    ],
    perspectives: [["2025-11-15", "2025-11-15", { id: "6", text: "Common perspective name" }]],
    entities: [
      ["2025-11-15", "2025-11-17", { id: "7", text: "Remotely edited text" }],
      ["2025-11-15", "2025-11-17", { id: "8", text: "Old text" }],
      [null, "2025-11-18", { id: "9", text: "Some remotely added entity" }],
      [null, null, { id: "10", text: "" }]
    ]
  };

  const keysData = Object.keys(dataCore);

  console.log("keysData=====");
  console.log(keysData);

  keysData.forEach(key => {
    dataCore[key].map(item => {
      const satellite = dataSatellite[key].filter(item2 => isEqual(item2[2].id, item[2].id))[0];

      item[2].textRemote = (satellite && satellite[2]?.text) || "";

      const dateSynced = (item[0] && new Date(item[0])) || null;
      const dateLocal = (item[1] && new Date(item[1])) || null;
      const dateRemote = (satellite && satellite[1] && new Date(satellite[1])) || null;

      item[2].dateSynced =
        (dateSynced && dateSynced.getDate() + "." + (dateSynced.getMonth() + 1) + "." + dateSynced.getFullYear()) ||
        "never";

      item[2].dateLocal =
        (dateLocal && dateLocal.getDate() + "." + (dateLocal.getMonth() + 1) + "." + dateLocal.getFullYear()) ||
        "never";

      item[2].dateRemote =
        (dateRemote && dateRemote.getDate() + "." + (dateRemote.getMonth() + 1) + "." + dateRemote.getFullYear()) ||
        "never";

      item[2].timeSynced = (dateSynced && dateSynced.getTime()) || 0;
      item[2].timeLocal = (dateLocal && dateLocal.getTime()) || 0;
      item[2].timeRemote = (dateRemote && dateRemote.getTime()) || 0;

      return item;
    });

    dataSatellite[key].forEach(item => {
      const core = dataCore[key].filter(item2 => isEqual(item2[2].id, item[2].id))[0];

      if (!core) {
        const elem = [null, null, {}];

        elem[2].id = item[2].id;
        elem[2].text = "";
        elem[2].textRemote = item[2].text;

        const dateRemote = (item[1] && new Date(item[1])) || null;

        elem[2].dateSynced = "never";

        elem[2].dateLocal = "never";

        elem[2].dateRemote =
          (dateRemote && dateRemote.getDate() + "." + (dateRemote.getMonth() + 1) + "." + dateRemote.getFullYear()) ||
          "never";

        elem[2].timeSynced = 0;
        elem[2].timeLocal = 0;
        elem[2].timeRemote = (dateRemote && dateRemote.getTime()) || 0;

        dataCore[key].push(elem);
      }
    });
  });

  console.log("dataCore=====");
  console.log(dataCore);

  return (
    <Modal className="lingvo-modal2" dimmer open closeIcon onClose={onClose} size="fullscreen">
      <Modal.Header>{getTranslation("Synchronize")}</Modal.Header>
      <Modal.Content>
        <div className="sync-content">
          <div className="sync-content__table">
            {(ispSyncLoading || xalSyncLoading || loadingApply) ? (
              <Dimmer active style={{ background: "none" }}>
                <Header as="h2" icon>
                  <Icon name="spinner" loading className="lingvo-spinner" />
                </Header>
              </Dimmer>
            ) : (ispSyncError || xalSyncError || errorApply) ? (
              <Message negative>
                <Message.Header>{getTranslation("Synchronize data loading error")}</Message.Header>
                <div style={{ marginTop: "0.25em" }}>
                  {getTranslation("Try reloading the page; if the error persists, please contact administrators.")}
                </div>
              </Message>
            ) : (
              <Table celled padded className="lingvo-perspective-table">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="th-type">&nbsp;</Table.HeaderCell>
                    <Table.HeaderCell className="th-name">{getTranslation("Core")}</Table.HeaderCell>
                    <Table.HeaderCell className="th-date">{getTranslation("Local Update")}</Table.HeaderCell>
                    <Table.HeaderCell className="th-date">{getTranslation("Synced")}</Table.HeaderCell>
                    <Table.HeaderCell className="th-date">{getTranslation("Remote Update")}</Table.HeaderCell>
                    <Table.HeaderCell className="th-name">{getTranslation("Satellite")}</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {keysData?.map(key => {
                    return dataCore[key]?.map(item => {
                      return (
                        <Table.Row key={item[2].id}>
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
                              (item[2].timeLocal > item[2].timeSynced &&
                                item[2].timeLocal > item[2].timeRemote &&
                                "td-color") ||
                              ""
                            }
                          >
                            {item[2].text}
                          </Table.Cell>
                          <Table.Cell
                            className={
                              (item[2].timeLocal > item[2].timeSynced &&
                                item[2].timeLocal > item[2].timeRemote &&
                                "td-date td-color") ||
                              "td-date"
                            }
                          >
                            {item[2].dateLocal}
                          </Table.Cell>
                          <Table.Cell className="td-date td-date-sync">{item[2].dateSynced}</Table.Cell>
                          <Table.Cell
                            className={
                              (item[2].timeRemote > item[2].timeSynced &&
                                item[2].timeRemote > item[2].timeLocal &&
                                "td-date td-color") ||
                              "td-date"
                            }
                          >
                            {item[2].dateRemote}
                          </Table.Cell>
                          <Table.Cell
                            className={
                              (item[2].timeRemote > item[2].timeSynced &&
                                item[2].timeRemote > item[2].timeLocal &&
                                "td-color") ||
                              ""
                            }
                          >
                            {item[2].textRemote}
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
        <div className="sync-transcript">
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
        </div>
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
          onClick={
            () => {
              applySync();
              setApplied(true);
            }
          }
          //loading={loadingApply}
          disabled={
            ispSyncLoading ||
            xalSyncLoading ||
            ispSyncError ||
            xalSyncError ||
            loadingApply ||
            errorApply
          }
          className="lingvo-button-greenest lingvo-button-greenest_sync"
        />

        <Button content={getTranslation("Close")} onClick={onClose} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

SyncModal.propTypes = {
  columns: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  perspectiveId: PropTypes.array.isRequired
};

export default SyncModal;
