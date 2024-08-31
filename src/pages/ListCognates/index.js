import { connect } from "react-redux";
import { Button, Checkbox, Dimmer, Icon, Input, Label, List, Loader, Message, Segment } from "semantic-ui-react";
import { gql, useLazyQuery } from "@apollo/client";
import { compose } from "recompose";
import React, { useContext, useState, useEffect } from "react";

import TranslationContext from "Layout/TranslationContext";

const perspectivesTreeQuery = gql`
  query PerspectivesTree (
    $onlyInToc: Boolean!
  ) {
    lexicalentry {
      entities(mode: "published", xfields: true, only_in_toc: $onlyInToc) {
        content
      }
    }
  }
`;

const ListCognates = ({user}) => {

  const [onlyInToc, setOnlyInToc] = useState(false);
  const [cleanResult, setCleanResult] = useState(false);
  const getTranslation = useContext(TranslationContext);
  const [getPerspectives, { loading, data, error }] = useLazyQuery(perspectivesTreeQuery);
  useEffect(() => setCleanResult(false), [loading, data]);

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
                setCleanResult(true);
              }}
            />
          </List.Item>
          <List.Item>
            <Button
              color="green"
              content={getTranslation("Get languages tree")}
              onClick={ () => {
                getPerspectives({ variables: { onlyInToc } });
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
            <p> {data.entities.length} </p>
            <p> {JSON.stringify(data.entities)} </p>
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
