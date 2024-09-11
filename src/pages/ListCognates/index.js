import { connect } from "react-redux";
import { Button, Checkbox, Dimmer, Icon, Input, Label, Loader, Message, Segment } from "semantic-ui-react";
import { gql, useMutation } from "@apollo/client";
import React, { useContext, useState, useEffect } from "react";

import TranslationContext from "Layout/TranslationContext";

const cognatesSummaryMutation = gql`
  mutation cognatesSummary (
    $onlyInToc: Boolean!
    $languageGroup: String
    $languageTitle: String
    $perspectiveOffset: Int
    $perspectiveLimit: Int
    $debugFlag: Boolean
  ) {
    cognates_summary(
      only_in_toc: $onlyInToc
      group: $languageGroup
      title: $languageTitle
      offset: $perspectiveOffset
      limit: $perspectiveLimit
      debug_flag: $debugFlag
    ) {
      json_url
      language_list
      message
      triumph
    }
  }
`;

const ListCognates = connect(state => state.user)(({user}) => {

  const [onlyInToc, setOnlyInToc] = useState(false);
  const [cleanResult, setCleanResult] = useState(false);
  const [languageGroup, setLanguageGroup] = useState(null);
  const [languageTitle, setLanguageTitle] = useState(null);
  const [perspectiveOffset, setPerspectiveOffset] = useState(0);
  const [perspectiveLimit, setPerspectiveLimit] = useState(10);
  const [shownParentGroup, showParentGroup] = useState(false);
  const [shownLanguagePosition, showLanguagePosition] = useState(false);
  const [getCognatesSummary, { data, error, loading }] = useMutation(cognatesSummaryMutation);

  useEffect(() => setCleanResult(false), [loading, data]);
  const getTranslation = useContext(TranslationContext);

  const debugFlag = false;

  const runMutation = () => {
    getCognatesSummary(
      { variables:
        {
          onlyInToc,
          languageGroup,
          languageTitle,
          perspectiveOffset,
          perspectiveLimit,
          debugFlag
        }
      }
    );
  }

  return (
    <div className="background-content">
    {(user.id === undefined) && !loading ? (
      <Message>
        <Message.Header>{getTranslation("Please sign in")}</Message.Header>
        <p>{getTranslation("This page is available for registered users only")}</p>
      </Message>
    ) : loading ? (
      <Segment>
        <Loader active inline="centered" indeterminate>
          {getTranslation("Loading")}...
        </Loader>
      </Segment>
    ) : (
      <Segment onKeyDown = {(e) => { if (e.key === 'Enter') runMutation(); }} tabIndex="0">
        <Checkbox
          label={getTranslation("Set parent group as well")}
          checked={shownParentGroup}
          onChange={(e, { checked }) => {
            showParentGroup(checked);
            setCleanResult(!data);
          }}
        />
        <p/>
        { shownParentGroup && (
          <Input
            label={getTranslation("Language(s) closest parent group")}
            type='text'
            value={languageGroup}
            placeholder={getTranslation("Set group name or leave empty")}
            onChange={(e, { value }) => {
              setLanguageGroup(value);
              setCleanResult(!data);
            }}
            //className="lingvo-labeled-input"
            style={{ width: 500, maxWidth: "80%" }}
          />
        )}
        <p/>
        <Input
          label={getTranslation("Language(s) group or title")}
          type='text'
          value={languageTitle}
          placeholder={getTranslation("Set title or leave empty")}
          onChange={(e, { value }) => {
            setLanguageTitle(value);
            setCleanResult(!data);
          }}
          //className="lingvo-labeled-input"
          style={{ width: 500, maxWidth: "80%" }}
        />
        <p/>
        <Checkbox
          label={getTranslation("Adjust perspectives set")}
          checked={shownLanguagePosition}
          onChange={(e, { checked }) => {
            showLanguagePosition(checked);
            setCleanResult(!data);
          }}
        />
        <p/>
        { shownLanguagePosition && (
          <div style={{ border: "gray solid", borderRadius: 15, width: 300, padding: 10, maxWidth: "80%" }}>
            <Checkbox
              label={getTranslation("Only high-order languages")}
              checked={onlyInToc}
              onChange={(e, { checked }) => {
                setOnlyInToc(checked);
                setCleanResult(!data);
              }}
            />
            <p/>
            <Input
              label={getTranslation("Perspectives offset")}
              type='number'
              min='0'
              value={perspectiveOffset}
              onChange={(e, { value }) => {
                setPerspectiveOffset(value);
                setCleanResult(!data);
              }}
              //className="lingvo-labeled-input"
              style={{ width: 150, maxWidth: "40%" }}
            />
            <p/>
            <Input
              label={getTranslation("Perspectives limit")}
              type='number'
              min='1'
              value={perspectiveLimit}
              onChange={(e, { value }) => {
                setPerspectiveLimit(value);
                setCleanResult(!data);
              }}
              //className="lingvo-labeled-input"
              style={{ width: 150, maxWidth: "40%" }}
            />
            <p/>
          </div>
        )}
        <p/>
        <Button
          color="green"
          content={getTranslation("Get cognates summary")}
          onClick={runMutation}
        />
        { error && !cleanResult && (
          <Message negative>
            <Message.Header>{getTranslation("Request error")}</Message.Header>
            <p>
              <span>{getTranslation("Please contact developers at")} </span>
              <a href="https://t.me/lingvodoc_support" target="_blank" rel="noreferrer">
                {getTranslation("Support@Telegram")}
              </a>
              <span> {getTranslation("or at")} </span>
              <a href="https://github.com/ispras/lingvodoc-react/issues">{getTranslation("Lingvodoc Github")}</a>
              <span>.</span>
            </p>
            <p> {error.message} </p>
          </Message>
        )}
        { data && !error && !cleanResult && (
          <Message positive>
            <Message.Header>{getTranslation("Scanned successfully")}</Message.Header>
            <p/>
            <a href={data.cognates_summary.json_url}> Result JSON </a>
            <h4> List of processed languages: </h4>
            { data.cognates_summary.language_list.map(lang =>
              <p> {lang} </p>
            )}
          </Message>
        )}
      </Segment>
    )}
    </div>
  );
})

ListCognates.contextType = TranslationContext;

export default ListCognates;
