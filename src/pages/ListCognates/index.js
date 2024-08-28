import { connect } from "react-redux";
import { Button, Checkbox, Dimmer, Icon, Input, Label, List, Loader, Message, Segment } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
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

const ListCognates = ({user, loading, perspectivesTree}) => {

  const [onlyInToc, setOnlyInToc] = useState(false);
  const [convertingFlag, setConvertingFlag] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const getTranslation = useContext(TranslationContext);

  const onConvert = () => {
    perspectivesTree({
      variables: {
        onlyInToc
      }
    })

    .then(
      ({ data: { languages } }) => {
        setConvertingFlag(false);
        setResult(languages);
      },

      error_data => {
        setConvertingFlag(false);
        setErrorMessage(error_data.message);
      }
    );
  };

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
                setErrorMessage(null);
                setResult(null);
              }}
            />
          </List.Item>
          <List.Item>
            <Button
              color="green"
              content={getTranslation("Get languages tree")}
              onClick={onConvert}
            />
          </List.Item>
        </List>
        {errorMessage && (
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
            <p>{getTranslation(errorMessage)}</p>
          </Message>
        )}
        {convertingFlag && (
          <Dimmer active inverted>
            <Loader inverted indeterminate>
              {getTranslation("Scanning")}...
            </Loader>
          </Dimmer>
        )}
        {result && !result.triumph && (
          <Message>
            <Message.Header>{getTranslation("Request failed")}</Message.Header>
            <p>{getTranslation(result.message)}</p>
          </Message>
        )}
        {result && result.triumph && (
          <Message positive>
            <Message.Header>{getTranslation("Scanned successfully")}</Message.Header>
            <List>
              <List.Item>
                <a href={result.json_url}>{getTranslation(".json file")}</a>
              </List.Item>
            </List>
          </Message>
        )}
      </Segment>
    )}
    </div>
  );
}

ListCognates.contextType = TranslationContext;

export default compose(
  connect(state => state.user),
  graphql(perspectivesTreeQuery, { name: "perspectivesTree" })
)(ListCognates);
