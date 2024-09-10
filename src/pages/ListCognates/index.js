import { connect } from "react-redux";
import { Button, Checkbox, Dimmer, Icon, Input, Label, List, Loader, Message, Segment } from "semantic-ui-react";
import { gql, useMutation } from "@apollo/client";
import { compose } from "recompose";
import React, { useContext, useState, useEffect } from "react";

import TranslationContext from "Layout/TranslationContext";

const cognatesSummaryMutation = gql`
  mutation cognatesSummary (
    $onlyInToc: Boolean!
    $languageGroup: String
    $languageTitle: String
    $languageOffset: Int
    $languageLimit: Int
    $debugFlag: Boolean
  ) {
    cognates_summary(
      only_in_toc: $onlyInToc
      group: $languageGroup
      title: $languageTitle
      offset: $languageOffset
      limit: $languageLimit
      debug_flag: $debugFlag
    ) {
      json_url
      language_list
      triumph
    }
  }
`;

const ListCognates = ({user}) => {

  const [onlyInToc, setOnlyInToc] = useState(false);
  const [cleanResult, setCleanResult] = useState(false);
  const [languageGroup, setLanguageGroup] = useState(null);
  const [languageTitle, setLanguageTitle] = useState(null);
  const [languageOffset, setLanguageOffset] = useState(0);
  const [languageLimit, setLanguageLimit] = useState(10);
  const [getCognatesSummary, { data, error, loading }] = useMutation(cognatesSummaryMutation);

  useEffect(() => setCleanResult(false), [loading, data]);
  const getTranslation = useContext(TranslationContext);

  const debugFlag = false;

  return (
    <div className="background-content">
    {(user.id === undefined || user.id !== 1) && !loading ? (
      <Message>
        <Message.Header>{getTranslation("Please sign in")}</Message.Header>
        <p>{getTranslation("This page is available for administrator only")}</p>
      </Message>
    ) : loading ? (
      <Segment>
        <Loader active inline="centered" indeterminate>
          {getTranslation("Loading")}...
        </Loader>
      </Segment>
    ) : (
      <Segment>
        <List>
          <List.Item>
            <Checkbox
              label={getTranslation("Only high-order languages")}
              checked={onlyInToc}
              onChange={(e, { checked }) => {
                setOnlyInToc(checked);
                setCleanResult(!data);
              }}
            />
          </List.Item>
          <List.Item>
            <Input
              label={getTranslation("Language group name")}
              type='text'
              value={languageGroup}
              placeholder={getTranslation("Set group name or leave empty")}
              onChange={(e, { value }) => {
                setLanguageGroup(value);
                setCleanResult(!data);
              }}
              className="lingvo-labeled-input"
            />
          </List.Item>
          <List.Item>
            <Input
              label={getTranslation("Language sub-group or title")}
              type='text'
              value={languageTitle}
              placeholder={getTranslation("Set title or leave empty")}
              onChange={(e, { value }) => {
                setLanguageTitle(value);
                setCleanResult(!data);
              }}
              className="lingvo-labeled-input"
            />
          </List.Item>
          <List.Item>
            <Input
              label={getTranslation("Languages offset")}
              type='number'
              min='0'
              value={languageOffset}
              onChange={(e, { value }) => {
                setLanguageOffset(value);
                setCleanResult(!data);
              }}
              className="lingvo-labeled-input"
            />
          </List.Item>
          <List.Item>
            <Input
              label={getTranslation("Languages limit")}
              type='number'
              min='1'
              value={languageLimit}
              onChange={(e, { value }) => {
                setLanguageLimit(value);
                setCleanResult(!data);
              }}
              className="lingvo-labeled-input"
            />
          </List.Item>
          <List.Item>
            <Button
              color="green"
              content={getTranslation("Get cognates summary")}
              onClick={ () => {
                getCognatesSummary(
                  { variables:
                    {
                      onlyInToc,
                      languageGroup,
                      languageTitle,
                      languageOffset,
                      languageLimit,
                      debugFlag
                    }
                  }
                );
                setCleanResult(true);
              }}
            />
          </List.Item>
        </List>
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
}

ListCognates.contextType = TranslationContext;

export default compose(
  connect(state => state.user)
)(ListCognates);
