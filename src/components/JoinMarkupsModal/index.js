import React, { useCallback, useContext, useState } from "react";
import { Button, Checkbox, Select, Modal, Table, Message, Icon, Confirm } from "semantic-ui-react";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { useMutation } from "hooks";
import { gql, useQuery, useApolloClient } from "@apollo/client";
import { lexicalEntryQuery } from "components/LexicalEntryCorp";

import TranslationContext from "Layout/TranslationContext";

import "./styles.scss";

// Using this query we get data for single markups and for existent groups
// We have to control broken groups and clean markups of them
const getMarkupTreeQuery = gql`
  query getMarkupTree($perspectiveId: LingvodocID!, $groupType: String, $author: Int) {
    markups(perspective_id: $perspectiveId) {
      id
      text
      offset
      field_translation
      field_position
      markup_groups(group_type: $groupType, author: $author) {
        client_id
        object_id
        type
        author_id
        author_name
        created_at
      }
    }
  }
`;

// Entities' additional metadata should be updated as well
// 'markups' has the following format: [[ entity_client_id, entity_object_id, markup_start_offset ], ... ]
const createMarkupGroupMutation = gql`
  mutation createMarkupGroup($groupType: String!, $markups: [[Int]], $perspectiveId: LingvodocID!) {
    create_markup_group(group_type: $groupType, markups: $markups, perspective_id: $perspectiveId) {
      entry_ids
      triumph
    }
  }
`;

// 'markups' has the following format: [[  ], ... ]
export const deleteMarkupGroupMutation = gql`
  mutation deleteMarkupGroup($groupIds: [[Int]]!, $markups: [[Int]], $perspectiveId: LingvodocID) {
    delete_markup_group(group_ids: $groupIds, markups: $markups, perspective_id: $perspectiveId) {
      entry_ids
      triumph
    }
  }
`;

const saveMarkupGroupsMutation = gql`
  mutation saveMarkupGroups($perspectiveId: LingvodocID!, $fieldList: [ObjectVal]!, $groupList: [ObjectVal]!) {
    save_markup_groups(perspective_id: $perspectiveId, field_list: $fieldList, group_list: $groupList) {
      xlsx_url
      message
      triumph
    }
  }
`;


export const refetchLexicalEntries = (entry_ids, client) =>
  entry_ids.forEach(le_id =>
    client.query({
      query: lexicalEntryQuery,
      variables: { id: le_id, entitiesMode: "all" },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "network-only"
    })
  );

const JoinMarkupsModal = ({ perspectiveId, onClose }) => {
  const getTranslation = useContext(TranslationContext);

  const [firstTextRelation, setFirstTextRelation] = useState(null);
  const [secondTextRelation, setSecondTextRelation] = useState(null);
  const [typeRelation, setTypeRelation] = useState(null);
  const [selectedRelations, setSelectedRelations] = useState([]);

  const [markupDict, setMarkupDict] = useState({});
  const [groupDict, setGroupDict] = useState({});
  const [groupTotal, setGroupTotal] = useState(0);
  const [selectedTotal, setSelectedTotal] = useState(0);

  const joinActive = firstTextRelation && secondTextRelation && typeRelation;
  const deleteActive = !!selectedTotal;

  const [warnMessage, setWarnMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const client = useApolloClient();

  const [createMarkupGroup] = useMutation(createMarkupGroupMutation, {
    onCompleted: data => refetchLexicalEntries(data.create_markup_group.entry_ids, client)
  });

  const [deleteMarkupGroup] = useMutation(deleteMarkupGroupMutation, {
    onCompleted: data => refetchLexicalEntries(data.delete_markup_group.entry_ids, client)
  });

  const [saveMarkupGroups] = useMutation(saveMarkupGroupsMutation, {
    onCompleted: ({save_markup_groups: result}) => {
      if (result.triumph) {
        setSuccessMessage(
          `${getTranslation("Markup groups were saved into xlsx file.")}
          ${getTranslation("Follow")} <a href=${result.xlsx_url}>${getTranslation("result url")}</a>`
        );
      } else {
        setWarnMessage(getTranslation(result.message));
      }
    }
  });

  const resetMessages = () => {
    setWarnMessage(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const setRelationDict = markups => {
    const markupDict = {};
    const groupDict = {};
    let total = 0;

    for (const markup of markups) {
      const { field_position: f_pos, field_translation: f_name, markup_groups: groups, ...markup_data } = markup;

      const f_id = `${f_pos}_${f_name}`;

      if (!(f_id in markupDict)) {
        markupDict[f_id] = [];
      }
      markupDict[f_id].push(markup_data);

      for (const group of groups) {
        const { client_id, object_id, ...group_data } = group;

        const g_id = `${client_id}_${object_id}`;

        if (!(g_id in groupDict)) {
          groupDict[g_id] = { ...group_data, markups: [] };
        }
        groupDict[g_id].markups.push(markup_data);

        if (groupDict[g_id].markups.length === 2) {
          total++;
        }
      }
    }

    if (Object.keys(markupDict).length < 2) {
      onClose();
      window.logger.warn(getTranslation("Please set markups in both fields of the table"));
    }

    setMarkupDict(markupDict);
    setGroupDict(groupDict);
    setGroupTotal(total);
  };

  const { data, error, loading, refetch } = useQuery(getMarkupTreeQuery, {
    variables: { perspectiveId },
    fetchPolicy: "network-only",
    onCompleted: data => setRelationDict(data.markups)
  });

  const onAddRelation = useCallback(() => {
    resetMessages();

    if (!firstTextRelation || !secondTextRelation || !typeRelation) {
      throw new Error("No either two markups or relation type is selected.");
    }

    for (const group of Object.values(groupDict)) {
      const ids = group.markups.map(markup => markup.id);
      if (ids.includes(firstTextRelation) && ids.includes(secondTextRelation) && group.type === typeRelation) {
        window.logger.warn(getTranslation("Such group already exists."));
        return;
      }
    }

    createMarkupGroup({
      variables: {
        groupType: typeRelation,
        markups: [firstTextRelation.split("_"), secondTextRelation.split("_")],
        perspectiveId
      }
    }).then(refetch);

    setFirstTextRelation(null);
    setSecondTextRelation(null);
    setTypeRelation(null);

    window.logger.suc(getTranslation("The group was successfully added."));
  }, [firstTextRelation, secondTextRelation, typeRelation, groupDict]);

  const onDeleteRelation = useCallback(() => {
    resetMessages();

    const groupIds = selectedRelations.map(id => id.split("_"));

    const markups = [];
    selectedRelations.forEach(id => {
      const group_markups = groupDict[id].markups.map(m => m.id.split("_"));
      markups.push(...group_markups);
    });

    deleteMarkupGroup({
      variables: { groupIds, markups }
    }).then(refetch);

    setSelectedRelations([]);
    setSelectedTotal(0);

    window.logger.suc(getTranslation("The group was successfully deleted."));
  }, [groupDict, selectedRelations]);

  const onRelationSelect = (relation_id, checked) => {
    const selectedIds = selectedRelations;

    const position = selectedIds.indexOf(relation_id);

    if (position === -1 && checked) {
      selectedIds.push(relation_id);
    } else {
      selectedIds.splice(position, 1);
    }

    const selectedTotal = selectedIds.length;
    setSelectedRelations(selectedIds);
    setSelectedTotal(selectedTotal);
  };

  const onSaveXlsx = useCallback(() => {
    const groupList = [];
    const fieldList =
      Object.keys(markupDict).map(id => id.split("_")[1]).concat([getTranslation('Type'), getTranslation('Author')]);

    for (const group of Object.values(groupDict)) {
      groupList.push({
        text: group.markups.map(m => m.text),
        type: getTranslation(group.type),
        author: group.author_name,
      });
    }

    saveMarkupGroups({variables: {perspectiveId, fieldList, groupList}});
  }, [markupDict, groupDict]);

  if (Object.keys(markupDict) < 2) {
    return;
  }

  const firstField = Object.keys(markupDict)[0];
  const secondField = Object.keys(markupDict)[1];

  const firstText = markupDict[firstField].map(m => (m.id === firstTextRelation ? m.text : ""));
  const secondText = markupDict[secondField].map(m => (m.id === secondTextRelation ? m.text : ""));

  const group_type_list = [
    "Transliteration",
    "Transcription",
    "Calque",
    "Transposition",
    "Descriptive translation",
    "Similatory translation",
    "Neologism",
    "Semi-calque",
    "Lexico-grammatical replacement",
    "Antonymous",
    "Compensation"
  ].sort().map((t, k) => ({
    key: k,
    value: t,
    text: getTranslation(t)
  }));

  return (
    <Modal className="lingvo-modal2" dimmer open closeIcon onClose={onClose} size="fullscreen">
      <Modal.Header>{getTranslation("Join markups")}</Modal.Header>
      <Modal.Content>
        {error || loading ? (
          <span>
            {`${getTranslation("Loading markups and groups data")}...`} <Icon name="spinner" loading />
          </span>
        ) : (
          <div className="join-markups-content">
            <div className="join-markups-content__markups">
              {/* Table Markups */}
              <div className="block-add-relation">
                <div className="block-add-relation__column">
                  <Table celled padded className="lingvo-perspective-table">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>
                          <div className="selected-markup">
                            {firstField.split("_")[1]}: <span className="selected-markup__text">{firstText}</span>
                          </div>
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {markupDict[firstField].map(markup => {
                        return (
                          <Table.Row key={markup.id}>
                            <Table.Cell
                              onClick={e => {
                                setFirstTextRelation(markup.id);
                                resetMessages();
                              }}
                              className={(markup.id === firstTextRelation && "selected-text-relation") || ""}
                            >
                              {markup.text}
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table>
                </div>

                <div className="block-add-relation__column">
                  <Table celled padded className="lingvo-perspective-table">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>
                          <div className="selected-markup">
                            {secondField.split("_")[1]}: <span className="selected-markup__text">{secondText}</span>
                          </div>
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {markupDict[secondField].map(markup => {
                        return (
                          <Table.Row key={markup.id}>
                            <Table.Cell
                              onClick={e => {
                                setSecondTextRelation(markup.id);
                                resetMessages();
                              }}
                              className={(markup.id === secondTextRelation && "selected-text-relation") || ""}
                            >
                              {markup.text}
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table>
                </div>
                <div className="block-add-relation__actions">
                  <Select
                    fluid
                    placeholder={getTranslation("Please select type...")}
                    value={typeRelation}
                    search
                    options={group_type_list}
                    onChange={(e, { value }) => {
                      setTypeRelation(value);
                      resetMessages();
                    }}
                  />
                  <p/>
                  <Button
                    content={getTranslation("Join markups")}
                    onClick={onAddRelation}
                    className="lingvo-button-greenest"
                    disabled={!joinActive}
                  />
                </div>
              </div>
              {/* /Table Markups */}
            </div>

            {warnMessage && (
              <Message warning style={{ minHeight: "auto", marginTop: "0" }}>
                <Message.Header>{getTranslation("Warning")}</Message.Header>
                <p>{warnMessage}</p>
              </Message>
            )}
            {successMessage && (
              <Message positive style={{ minHeight: "auto", marginTop: "0" }}>
                <Message.Header>{getTranslation("Success")}</Message.Header>
                <p dangerouslySetInnerHTML={{ __html: successMessage }}></p>
              </Message>
            )}

            <div className="join-markups-content__relations">
              {/* Table Relations */}
              <Table celled padded className="lingvo-perspective-table">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="th-checkbox">&nbsp;</Table.HeaderCell>
                    <Table.HeaderCell className="th-markup"> {firstField.split("_")[1]} </Table.HeaderCell>
                    <Table.HeaderCell className="th-markup"> {secondField.split("_")[1]} </Table.HeaderCell>
                    <Table.HeaderCell> {getTranslation("Type")} </Table.HeaderCell>
                    <Table.HeaderCell> {getTranslation("Author")} </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Object.keys(groupDict).map(
                    group_id =>
                      groupDict[group_id].markups.length > 1 && (
                        <Table.Row key={group_id}>
                          <Table.Cell>
                            <Checkbox
                              className="lingvo-checkbox"
                              //checked={selectedRelations.find(e => isEqual(e, relation.id))}
                              onChange={(e, { checked }) => onRelationSelect(group_id, checked)}
                            />
                          </Table.Cell>
                          <Table.Cell> {groupDict[group_id].markups[0].text} </Table.Cell>
                          <Table.Cell> {groupDict[group_id].markups[1].text} </Table.Cell>
                          <Table.Cell> {getTranslation(groupDict[group_id].type)} </Table.Cell>
                          <Table.Cell> {groupDict[group_id].author_name} </Table.Cell>
                        </Table.Row>
                      )
                  )}
                </Table.Body>
              </Table>
              {/* /Table Relations */}
            </div>
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button
          content={getTranslation("Delete groups") + " (" + selectedTotal + "/" + groupTotal + ")"}
          onClick={onDeleteRelation}
          className="lingvo-button-redder"
          disabled={!deleteActive}
          style={{ float: "left" }}
        />
        <Button
          content={getTranslation("Save to xlsx")}
          onClick={onSaveXlsx}
          className="lingvo-button-greenest"
          disabled={!groupTotal}
          style={{ float: "left" }}
        />
        <Button content={getTranslation("Close")} onClick={onClose} className="lingvo-button-basic-black" />
      </Modal.Actions>
      <Confirm
        open={confirmation !== null}
        header={getTranslation("Confirmation")}
        content={confirmation ? confirmation.content : null}
        onConfirm={confirmation ? confirmation.func : null}
        onCancel={() => setConfirmation(null)}
        className="lingvo-confirm"
      />
    </Modal>
  );
};

JoinMarkupsModal.propTypes = {
  perspectiveId: PropTypes.arrayOf(PropTypes.number).isRequired,
  onClose: PropTypes.func.isRequired
};

export default JoinMarkupsModal;
