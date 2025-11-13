import React, { useContext, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { Button, Dimmer, Header, Icon, Message, Modal, Popup, Table } from "semantic-ui-react";
import { RangesMarker } from "react-mark.js";
import PropTypes from "prop-types";
import { chooseTranslation as T } from "api/i18n";

import TranslationContext from "Layout/TranslationContext";

import "./styles.scss";

const getTwinsDiff = gql`
  query twinsDiff(
    $mainIds: [LingvodocID]!
    $twinIds: [[LingvodocID]]!
    $entryIds: [LingvodocID]!
    $fieldNames: [String]!
  ) {
    twins_diff(main_ids: $mainIds, twin_ids: $twinIds, entry_ids: $entryIds, field_names: $fieldNames)
  }
`;

const CompareModal = ({ columns, entries, onClose }) => {
  const getTranslation = useContext(TranslationContext);

  /* временно!!!!!! */
  //const colums_temp = [columns[2], columns[3], columns[3], columns[3]];
  const colums_temp = columns.slice(2);

  columns = Object.assign([], colums_temp);

  entries = entries.map((entry, i) => {
    let entry_temp = Object.assign({}, entry);

    /*const entities_temp = [
      entry_temp.entities[2],
      entry_temp.entities[3],
      entry_temp.entities[3]
      //entry_temp.entities[3]
    ];*/
    const entities_temp = entry_temp.entities.slice(2);

    entry_temp.entities = Object.assign([], entities_temp);

    entry = Object.assign({}, entry_temp);

    return entry;
  });
  /* /временно!!!!!! */

  console.log("entries=====");
  console.log(entries);

  let markedFalse = [];
  let markedTrue = [];
  columns.forEach((el, i) => {
    markedFalse[i] = false;
    markedTrue[i] = true;
  });

  const [markedAddAll, setMarkedAddAll] = useState(markedFalse);
  const [markedDelAll, setMarkedDelAll] = useState([false]);
  const [markedReplaceAll, setMarkedReplaceAll] = useState(markedFalse);

  const [highlights, setHighlights] = useState({});

  const highlightMarkers = data => {
    const highlights = {};
    const mainFields = mainIds.map(id => id?.join(","));

    Object.entries(data.twins_diff.diffs).forEach(([entryId, value1], i1) => {
      const red = {};
      const green = {};
      const yellow = {};

      Object.entries(value1).forEach(([masterId, value2], i2) => {
        const isMainField = mainFields.includes(masterId);

        red[masterId] = [];
        green[masterId] = [];
        yellow[masterId] = [];

        Object.entries(value2).forEach(([key, value3], i3) => {
          const [start, length] = key.split(",");

          Object.entries(value3).forEach(([twinId, value4], i4) => {
            //For MainField twinFieldNumber starts from 1, because 0 is MainField itself
            //For other fields only MainField is a TwinField so we start from 0
            const twinFieldNumber = i4 + Number(isMainField);
            const twinFieldName = T(columns[twinFieldNumber].translations);
            const marker = { start, length, twinId, twinFieldNumber, twinFieldName };

            if (value4 === null) {
              if (isMainField) {
                red[masterId].push(marker);
              } else {
                green[masterId].push(marker);
              }
            } else {
              const [twinStart, twinWord, twinDist, twinDiff, origWord] = value4;

              yellow[masterId].push({
                ...marker,
                twinStart,
                twinWord,
                twinDist,
                twinDiff
              });
            }
          });
        });
      });
      // Here a condition can be
      highlights[entryId] = { red, green, yellow };
    });

    setHighlights(highlights);
  };

  const mainIds = entries.map(le => le.entities[0]?.id);
  const twinIds = entries.map(le => le.entities.slice(1).map(e => e?.id));
  const entryIds = entries.map(le => le?.id);
  const fieldNames = columns.map(cl => T(cl.translations));

  const { data, error, loading } = useQuery(getTwinsDiff, {
    variables: {
      mainIds,
      twinIds,
      entryIds,
      fieldNames
    },
    onCompleted: data => highlightMarkers(data)
  });

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
    const markedDel = Object.assign([], markedDelAll);

    markedDel[column] = !markedDelAll[column];

    setMarkedDelAll(markedDel);
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

  /* new!!!!! */
  document.addEventListener(
    "mouseover",
    e => {
      if (e.target.classList.contains("lingvo-marker-green")) {
        const td = e.target.closest(".marked-add-all");
        if (td) {
          e.target.classList.add("marked-add-hover");
          e.target.setAttribute(
            "title",
            JSON.stringify(highlights[td.getAttribute("data-row")]?.green[td.getAttribute("data-column")])
          );
          e.target.closest(".lingvo-perspective-table").classList.add("mark-hover");
          e.stopPropagation();
        }
      }

      if (e.target.classList.contains("lingvo-marker-red")) {
        const td = e.target.closest(".marked-del-all");
        const content = e.target.closest(".lingvo-column-content");
        const table = e.target.closest(".lingvo-perspective-table");

        if (td) {
          e.target.classList.add("marked-del-hover");

          const contentMark = e.target.innerHTML;
          if (!contentMark.includes("$$$")) {
            e.target.innerHTML = '<span class="hidden">$$$</span>' + contentMark;
          }

          const position = content.textContent.indexOf("$$$");
          console.log("position=====");
          console.log(position);

          const rowId = td.getAttribute("data-row");
          const columnId = td.getAttribute("data-column");

          const highlightsAll = highlights[rowId]?.red[columnId];
          console.log("highlightsAll=====");
          console.log(highlightsAll);

          const highlightsMark = highlightsAll?.filter(elem => {
            return Number(elem.start) === position;
          });
          console.log("highlightsMark=====");
          console.log(highlightsMark);

          // In field ${twinFieldName}: removed
          let text = "";
          highlightsMark?.forEach(elem => {
            text =
              text +
              ((text !== "" && "<br />") || "") +
              getTranslation("In field") +
              " «" +
              elem?.twinFieldName +
              "»: " +
              getTranslation("removed");
          });

          e.target.setAttribute("title", text?.replace(/<br \/>/g, `\n`));

          setTimeout(() => {
            const popup = document.getElementsByClassName("lingvo-popup-parallel-compare");
            if (popup.length) {
              if (highlightsMark && highlightsMark.length) {
                popup[0].getElementsByClassName("content")[0].innerHTML = text;
              }
              popup[0].classList.add("lingvo-popup-parallel-compare_visible");
            }
          }, 500);

          table.classList.add("mark-hover");
          e.stopPropagation();
        }
      }

      if (e.target.classList.contains("lingvo-marker-yellow")) {
        const td = e.target.closest(".marked-replace-all");
        const content = e.target.closest(".lingvo-column-content");
        const table = e.target.closest(".lingvo-perspective-table");
        const row = e.target.closest("tr");

        if (td) {
          e.target.classList.add("marked-replace-hover");

          const contentMark = e.target.innerHTML;
          if (!contentMark.includes("$$$")) {
            e.target.innerHTML = '<span class="hidden">$$$</span>' + contentMark;
          }

          const position = content.textContent.indexOf("$$$");
          console.log("position=====");
          console.log(position);

          const rowId = td.getAttribute("data-row");
          const columnId = td.getAttribute("data-column");

          const highlightsAll = highlights[rowId]?.yellow[columnId];
          console.log("highlightsAll=====");
          console.log(highlightsAll);

          const highlightsMark = highlightsAll?.filter(elem => {
            return Number(elem.start) === position;
          });
          console.log("highlightsMark=====");
          console.log(highlightsMark);

          const twinTds = Array.from(row.getElementsByClassName("marked-replace-all")).filter(elem => {
            const columnId = elem.getAttribute("data-column");

            const twin = highlightsMark?.find(el => {
              return el.twinId === columnId;
            });

            return twin;
          });

          console.log("twinTds=====");
          console.log(twinTds);

          Array.from(twinTds).forEach(elem => {
            const columnId = elem.getAttribute("data-column");

            const twin = highlightsMark?.find(el => {
              return el.twinId === columnId;
            });

            Array.from(elem.getElementsByClassName("lingvo-marker-yellow")).forEach(mark => {
              if (mark.innerHTML == twin?.twinWord) {
                //mark.classList.add("marked-replace-hover");

                /* new!!!!! */
                const contentMark = mark.innerHTML;
                if (!contentMark.includes("$$$")) {
                  mark.innerHTML = '<span class="hidden">$$$</span>' + contentMark; // new!!!!!
                }

                const position = mark.closest(".lingvo-column-content").textContent.indexOf("$$$");
                console.log("position Mark =====");
                console.log(position);

                if (position === twin?.twinStart) {
                  mark.classList.add("marked-replace-hover");
                }
                const contentMarkTemp = mark.innerHTML;
                const contentMarkNew = contentMarkTemp.replace('<span class="hidden">$$$</span>', "");
                mark.innerHTML = contentMarkNew;
                /* /new!!!!! */
              }
            });
          });

          // In field ${twinFieldName}: moved on ${twinDist}, changed at ${twinDiff}
          let text = "";
          highlightsMark?.forEach(elem => {
            text =
              text +
              ((text !== "" && "<br />") || "") +
              getTranslation("In field") +
              " «" +
              elem?.twinFieldName +
              "»: " +
              getTranslation("moved on") +
              " " +
              elem?.twinDist +
              ", " +
              ((elem?.twinDiff && getTranslation("changed at") + " " + elem?.twinDiff) ||
                getTranslation("not changed"));
          });

          e.target.setAttribute("title", text?.replace(/<br \/>/g, `\n`));

          setTimeout(() => {
            const popup = document.getElementsByClassName("lingvo-popup-parallel-compare");
            if (popup.length) {
              if (highlightsMark && highlightsMark.length) {
                popup[0].getElementsByClassName("content")[0].innerHTML = text;
              }
              popup[0].classList.add("lingvo-popup-parallel-compare_visible");
            }
          }, 500);

          table.classList.add("mark-hover");
          e.stopPropagation();
        }
      }
    },
    false
  );

  document.addEventListener(
    "mouseout",
    e => {
      if (e.target.classList.contains("lingvo-marker-green")) {
        const td = e.target.closest(".marked-add-all");
        if (td) {
          e.target.classList.remove("marked-add-hover");
          e.target.removeAttribute("title");
          e.target.closest(".lingvo-perspective-table").classList.remove("mark-hover");
          e.stopPropagation();
        }
      }

      if (e.target.classList.contains("lingvo-marker-red")) {
        const td = e.target.closest(".marked-del-all");
        if (td) {
          e.target.classList.remove("marked-del-hover");

          const contentMark = e.target.innerHTML;
          const contentMarkNew = contentMark.replace('<span class="hidden">$$$</span>', "");
          e.target.innerHTML = contentMarkNew;

          e.target.removeAttribute("title");

          setTimeout(() => {
            const popup = document.getElementsByClassName("lingvo-popup-parallel-compare");
            if (popup.length) {
              popup[0].classList.remove("lingvo-popup-parallel-compare_visible");
              popup[0].getElementsByClassName("content")[0].innerHTML = "";
            }
          }, 500);

          e.target.closest(".lingvo-perspective-table").classList.remove("mark-hover");
          e.stopPropagation();
        }
      }

      if (e.target.classList.contains("lingvo-marker-yellow")) {
        const td = e.target.closest(".marked-replace-all");
        const row = e.target.closest("tr");
        if (td) {
          Array.from(row.getElementsByClassName("lingvo-marker-yellow")).forEach(mark => {
            mark.classList.remove("marked-replace-hover");
          });

          const contentMark = e.target.innerHTML;
          const contentMarkNew = contentMark.replace('<span class="hidden">$$$</span>', "");
          e.target.innerHTML = contentMarkNew;

          e.target.removeAttribute("title");

          setTimeout(() => {
            const popup = document.getElementsByClassName("lingvo-popup-parallel-compare");
            if (popup.length) {
              popup[0].classList.remove("lingvo-popup-parallel-compare_visible");
              popup[0].getElementsByClassName("content")[0].innerHTML = "";
            }
          }, 500);

          e.target.closest(".lingvo-perspective-table").classList.remove("mark-hover");
          e.stopPropagation();
        }
      }
    },
    false
  );
  /* /new!!!!! */

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

  return (
    <Modal className="lingvo-modal2" dimmer open closeIcon onClose={onClose} size="fullscreen">
      <Modal.Header>{getTranslation("Compare")}</Modal.Header>
      <Modal.Content>
        <div className="compare-content">
          <div className="compare-content__table">
            {loading ? (
              <Dimmer active style={{ background: "none" }}>
                <Header as="h2" icon>
                  <Icon name="spinner" loading className="lingvo-spinner" />
                </Header>
              </Dimmer>
            ) : error ? (
              <Message negative>
                <Message.Header>{getTranslation("Compare data loading error")}</Message.Header>
                <div style={{ marginTop: "0.25em" }}>
                  {getTranslation("Try reloading the page; if the error persists, please contact administrators.")}
                </div>
              </Message>
            ) : (
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
                          onClick={() => markDel(0)}
                          className={(markedDelAll[0] && "compare-button-removed active") || "compare-button-removed"}
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
                            {T(column.translations)}
                            <div className="" style={{ whiteSpace: "nowrap" }}>
                              <Button
                                icon={<i className="lingvo-icon lingvo-icon_add" />}
                                content={getTranslation("Added")}
                                onClick={() => markAdd(i)}
                                className={(markedAddAll[i] && "compare-button-added active") || "compare-button-added"}
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
                        {entry.entities.map((entity, i) => {
                          return (
                            <Table.Cell
                              className={className[i]}
                              key={`${entry.id}column${i}`}
                              data-row={entry.id} /* new!!!!! */
                              data-column={entity?.id} /* new!!!!! */
                            >
                              <RangesMarker
                                mark={highlights[entry?.id]?.red[entity?.id] ?? []}
                                options={{
                                  className: "lingvo-marker-red"
                                }}
                              >
                                <RangesMarker
                                  mark={highlights[entry?.id]?.green[entity?.id] ?? []}
                                  options={{
                                    className: "lingvo-marker-green"
                                  }}
                                >
                                  <RangesMarker
                                    mark={highlights[entry?.id]?.yellow[entity?.id] ?? []}
                                    options={{
                                      className: "lingvo-marker-yellow"
                                    }}
                                  >
                                    <Popup
                                      className="lingvo-popup-parallel-compare"
                                      basic
                                      inverted
                                      //on="click"
                                      //popper
                                      //offset
                                      //position="top left"
                                      //popper={<marker />}
                                      //hideOnScroll={true}
                                      content=""
                                      trigger={<span className="lingvo-column-content">{entity?.content}</span>}
                                    />
                                  </RangesMarker>
                                </RangesMarker>
                              </RangesMarker>
                            </Table.Cell>
                          );
                        })}
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            )}
          </div>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content={getTranslation("Save to XLSX")}
          //onClick={onSaveXlsx}
          className="lingvo-button-greenest"
          style={{ float: "left" }}
        />
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
