import React, { useContext, useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { Button, Modal, Table } from "semantic-ui-react";
import { RangesMarker } from "react-mark.js";
import PropTypes from "prop-types";
import { chooseTranslation as T } from "api/i18n";

import TranslationContext from "Layout/TranslationContext";

import "./styles.scss";

const getTwinsDiff = gql`
  query twinsDiff(
    $mainTranslation: [LingvodocID]!
    $twinTranslation: [[LingvodocID]]!
    $entriesId: [LingvodocID]!
  ) {
    twins_diff (
      main_translation: $mainTranslation
      twin_translation: $twinTranslation
      entries_id: $entriesId
    ),
  }
`;

const CompareModal = ({ columns, entries, onClose }) => {
  const getTranslation = useContext(TranslationContext);

  /* временно!!!!!! */
  const colums_temp = [columns[2], columns[2], columns[2], columns[2]];

  columns = Object.assign([], colums_temp);

  entries = entries.map((entry, i) => {
    let entry_temp = Object.assign({}, entry);

    const entities_temp = [
      entry_temp.entities[2],
      entry_temp.entities.at(-1),
      entry_temp.entities.at(-1),
      entry_temp.entities.at(-1)
    ];

    entry_temp.entities = Object.assign([], entities_temp);

    entry = Object.assign({}, entry_temp);

    return entry;
  });
  /* /временно!!!!!! */

  const { data, error, loading } = useQuery(getTwinsDiff, {
    variables: {
      mainTranslation: entries.map(le => le.entities[0]?.id),
      twinTranslation: entries.map(le => le.entities.slice(1).map(e => e?.id)),
      entriesId: entries.map(le => le?.id)
    }
  });

  let markedFalse = [];
  let markedTrue = [];
  columns.forEach((el, i) => {
    if (i > 0) {
      markedFalse[i] = false;
      markedTrue[i] = true;
    }
  });

  const [markedAddAll, setMarkedAddAll] = useState(markedFalse);
  const [markedDelAll, setMarkedDelAll] = useState(markedFalse);
  const [markedReplaceAll, setMarkedReplaceAll] = useState(markedFalse);

  const markAdd = column => {
    if (column === undefined) {
      if (markedAddAll.includes(false, 1)) {
        setMarkedAddAll(markedTrue);
      } else {
        setMarkedAddAll(markedFalse);
      }
    } else {
      const markedAdd = Object.assign([], markedAddAll);

      markedAdd[column] = !markedAddAll[column];

      setMarkedAddAll(markedAdd);
    }
  };

  const markDel = column => {
    if (column === undefined) {
      if (markedDelAll.includes(false, 1)) {
        setMarkedDelAll(markedTrue);
      } else {
        setMarkedDelAll(markedFalse);
      }
    } else {
      const markedDel = Object.assign([], markedDelAll);

      markedDel[column] = !markedDelAll[column];

      setMarkedDelAll(markedDel);
    }
  };

  const markReplace = column => {
    if (column === undefined) {
      if (markedReplaceAll.includes(false, 1)) {
        setMarkedReplaceAll(markedTrue);
      } else {
        setMarkedReplaceAll(markedFalse);
      }
    } else {
      const markedReplace = Object.assign([], markedReplaceAll);

      markedReplace[column] = !markedReplaceAll[column];

      setMarkedReplaceAll(markedReplace);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      columns.forEach((el, column) => {
        const tds = document.getElementsByClassName("column-" + column);

        Array.from(tds).forEach(el => {
          Array.from(el.getElementsByClassName("lingvo-marker-green")).forEach(mark => {
            if (markedAddAll[column]) {
              mark.setAttribute("title", "Title GREEN!!!!!");
            } else {
              mark.removeAttribute("title");
            }
          });

          Array.from(el.getElementsByClassName("lingvo-marker-red")).forEach(mark => {
            if (markedDelAll[column]) {
              mark.setAttribute("title", "Title RED!!!!!");
            } else {
              mark.removeAttribute("title");
            }
          });

          Array.from(el.getElementsByClassName("lingvo-marker-yellow")).forEach(mark => {
            if (markedReplaceAll[column]) {
              mark.setAttribute("title", "Title YELLOW!!!!!");
            } else {
              mark.removeAttribute("title");
            }
          });
        });
      });
    }, 500);
  }, [markedAddAll, markedDelAll, markedReplaceAll]);

  let className = [];
  columns.forEach((el, i) => {
    className[i] =
      "column-" +
      i +
      ""
        .concat(markedAddAll[i] ? " marked-add-all" : "")
        .concat(markedDelAll[i] ? " marked-del-all" : "")
        .concat(markedReplaceAll[i] ? " marked-replace-all" : "");
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const highlightsRed = [
    {
      start: 0,
      length: 8
    }
  ];

  const highlightsGreen = [
    {
      start: 9,
      length: 5
    }
  ];

  const highlightsYellow = [
    {
      start: 16,
      length: 18
    }
  ];

  return (
    <Modal className="lingvo-modal2" dimmer open closeIcon onClose={onClose} size="fullscreen">
      <Modal.Header>{getTranslation("Compare")}</Modal.Header>
      <Modal.Content>
        <div className="compare-content">
          <div className="compare-content__table">
            <Table celled padded className="lingvo-perspective-table">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell className="th-markup">
                    {T(columns[0].translations)}
                    <div className="" style={{ whiteSpace: "nowrap" }}>
                      <Button
                        icon={<i className="lingvo-icon lingvo-icon_add" />}
                        content={getTranslation("All added")}
                        onClick={() => markAdd()}
                        className={
                          (markedAddAll.includes(false, 1) && "compare-button-added") || "compare-button-added active"
                        }
                      />
                      <Button
                        icon={<i className="lingvo-icon lingvo-icon_delete" />}
                        content={getTranslation("All removed")}
                        onClick={() => markDel()}
                        className={
                          (markedDelAll.includes(false, 1) && "compare-button-removed") ||
                          "compare-button-removed active"
                        }
                      />
                      <Button
                        icon={<i className="lingvo-icon lingvo-icon_check" />}
                        content={getTranslation("All replaced")}
                        onClick={() => markReplace()}
                        className={
                          (markedReplaceAll.includes(false, 1) && "compare-button-replaced") ||
                          "compare-button-replaced active"
                        }
                      />
                    </div>
                  </Table.HeaderCell>
                  {columns.map((column, i) => {
                    return (
                      (i > 0 && (
                        <Table.HeaderCell className="th-markup" key={`column${i}`}>
                          {T(columns[i].translations)} {i}
                          <div className="" style={{ whiteSpace: "nowrap" }}>
                            <Button
                              icon={<i className="lingvo-icon lingvo-icon_add" />}
                              content={getTranslation("Added")}
                              onClick={() => markAdd(i)}
                              className={(markedAddAll[i] && "compare-button-added active") || "compare-button-added"}
                            />
                            <Button
                              icon={<i className="lingvo-icon lingvo-icon_delete" />}
                              content={getTranslation("Removed")}
                              onClick={() => markDel(i)}
                              className={
                                (markedDelAll[i] && "compare-button-removed active") || "compare-button-removed"
                              }
                            />
                            <Button
                              icon={<i className="lingvo-icon lingvo-icon_check" />}
                              content={getTranslation("Replaced")}
                              onClick={() => markReplace(i)}
                              className={
                                (markedReplaceAll[i] && "compare-button-replaced active") || "compare-button-replaced"
                              }
                            />
                          </div>
                        </Table.HeaderCell>
                      )) ||
                      null
                    );
                  })}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {entries.map(entry => {
                  return (
                    <Table.Row key={entry.id}>
                      <Table.Cell>{entry.entities[0] && entry.entities[0].content}</Table.Cell>
                      {entry.entities.map((column, i) => {
                        return (
                          (i > 0 && (
                            <Table.Cell className={className[i]} key={`${entry.id}column${i}`}>
                              <RangesMarker
                                mark={highlightsRed}
                                options={{
                                  className: "lingvo-marker-red"
                                }}
                              >
                                <RangesMarker
                                  mark={highlightsGreen}
                                  options={{
                                    className: "lingvo-marker-green"
                                  }}
                                >
                                  <RangesMarker
                                    mark={highlightsYellow}
                                    options={{
                                      className: "lingvo-marker-yellow"
                                    }}
                                  >
                                    {entry.entities[i] && entry.entities[i].content}
                                  </RangesMarker>
                                </RangesMarker>
                              </RangesMarker>
                            </Table.Cell>
                          )) ||
                          null
                        );
                      })}
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button content={getTranslation("Close")} onClick={onClose} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

CompareModal.propTypes = {
  columns: PropTypes.array.isRequired,
  entries: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired
};

export default CompareModal;
