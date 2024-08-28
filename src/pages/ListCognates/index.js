import { connect } from "react-redux";
import { Button, Checkbox, Dimmer, Icon, Input, Label, List, Loader, Message, Segment } from "semantic-ui-react";
import { gql, useLazyQuery } from "@apollo/client";
import { compose } from "recompose";
import React, { useContext, useState } from "react";

import TranslationContext from "Layout/TranslationContext";

const perspectivesTreeQuery = gql`
  query PerspectivesTree (
    $onlyInToc: Boolean!
    ) {
    languages(
      only_in_toc: $onlyInToc
      only_with_dictionaries_recursive: true
      in_tree_order: true
    ) {
      id
      parent_id
      translations
      created_at
      dictionaries(deleted: false, published: true) {
        id
        parent_id
        translations
        category
        additional_metadata {
          authors
          location
        }
        perspectives {
          id
          translations
          columns {
            field_id
          }
        }
      }
      additional_metadata {
        speakersAmount
      }
    }
    is_authenticated
  }
`;

const ListCognates = ({user}) => {

  const [onlyInToc, setOnlyInToc] = useState(false);
  const getTranslation = useContext(TranslationContext);
  const [getPerspectives, { loading, data, error, called }] = useLazyQuery(perspectivesTreeQuery);

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
              onChange={(e, { checked }) => setOnlyInToc(checked) }
            />
          </List.Item>
          <List.Item>
            <Button
              color="green"
              content={getTranslation("Get languages tree")}
              onClick={ () => getPerspectives({ variables: { onlyInToc } }) }
            />
          </List.Item>
        </List>
        { error && (
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
        { called && data && !error && (
          <Message positive>
            <Message.Header>{getTranslation("Scanned successfully")}</Message.Header>
            <p> {JSON.stringify(data.languages)} </p>
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
