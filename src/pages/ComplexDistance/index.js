import { connect } from "react-redux";
import { Button, Dimmer, Icon, Input, Label, Loader, Message, Segment } from "semantic-ui-react";
import { gql, useMutation } from "@apollo/client";
import React, { useContext, useState, useEffect } from "react";

import TranslationContext from "Layout/TranslationContext";

const complexDistanceMutation = gql`
  mutation complexDistance (
    $resultPool: [ObjectVal]!
    $debugFlag: Boolean
  ) {
    complex_distance(
      result_pool: $resultPool
      debug_flag: $debugFlag
    ) {
      result
      minimum_spanning_tree
      embedding_2d
      embedding_3d
      language_name_list
      message
      triumph
    }
  }
`;

const ComplexDistance = connect(state => state.user)(({user}) => {

  const [cleanResult, setCleanResult] = useState(false);
  const [fileSuite, setFileSuite] = useState(null);
  const [getComplexDistance, { data, error, loading }] = useMutation(complexDistanceMutation);

  useEffect(() => setCleanResult(false), [loading, data]);
  const getTranslation = useContext(TranslationContext);

  const debugFlag = false;

  const runMutation = () => {

    if (loading)
      return;

    const resultPool = [];

    for (const file of fileSuite) {
      const reader = new FileReader();
      reader.onload = () => { resultPool.push(JSON.parse(reader.result)); }
      reader.readAsText(file);
    };

    if (resultPool.length > 0) {
      getComplexDistance(
        { variables:
          {
            resultPool,
            debugFlag
          }
        }
      );
    }
  }

  const fail = !data || !data.complex_distance.triumph;

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
        <span>
          { getTranslation(
              fileSuite ? "Json file(s) for complex result:" : "Please select result file(s) for calculating."
          )}
        </span>

        { fileSuite && fileSuite.map(({ name: fileName }) => (
          <Label style={{ marginLeft: "0.5em" }}>
            <Icon name="file outline" />
              { fileName }
          </Label>
        ))}

        <Button style={{ marginLeft: "1em" }} onClick={() => document.getElementById("file-select").click()}>
          {`${getTranslation("Browse")}...`}
        </Button>

        <Input
          id="file-select"
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={e => setFileSuite(Array.from(e.target.files))}
        />
        <p/>
        <Button
          color={fileSuite ? "green" : "gray"}
          disabled={!fileSuite}
          content={getTranslation("Get complex distance")}
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
        { data && !data.complex_distance.triumph && !error && !cleanResult && (
          <Message negative>
            <Message.Header>{getTranslation("Request error")}</Message.Header>
            <p> {data.complex_distance.message} </p>
          </Message>
        )}
        { data && data.complex_distance.triumph && !error && !cleanResult && (
          <Message positive>
            <Message.Header>{getTranslation("Summary distance matrix grouped and merged by languages:")}</Message.Header>
            <div dangerouslySetInnerHTML={{ __html: data.complex_distance.result }}></div>
          </Message>
        )}
      </Segment>
    )}
    </div>
  );
})

ComplexDistance.contextType = TranslationContext;

export default ComplexDistance;
