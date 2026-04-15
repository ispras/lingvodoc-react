import React, { useContext, useState } from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Dimmer, Icon, Input, Label, List, Loader, Message, Segment } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { compose } from "recompose";

import TranslationContext from "Layout/TranslationContext";

const docx2eafMutation = gql`
  mutation docx2eaf(
    $docxFile: Upload
    $separateFlag: Boolean
    $allTablesFlag: Boolean
    $noHeaderFlag: Boolean
    $noParsingFlag: Boolean
  ) {
    docx2eaf(
      docx_file: $docxFile
      separate_flag: $separateFlag
      all_tables_flag: $allTablesFlag
      no_header_flag: $noHeaderFlag
      no_parsing_flag: $noParsingFlag
    ) {
      triumph
      eaf_url
      alignment_url
      check_txt_url
      check_docx_url
      message
    }
  }
`;

const Docx2Eaf = ({ docx2eaf, loading, user }) => {
  const getTranslation = useContext(TranslationContext);

  const [separate_flag, setSeparate_flag] = useState(false);
  const [all_tables_flag, setAll_tables_flag] = useState(false);
  const [no_header_flag, setNo_header_flag] = useState(false);
  const [no_parsing_flag, setNo_parsing_flag] = useState(false);
  const [file, setFile] = useState(null);
  const [converting_flag, setConverting_flag] = useState(false);
  const [error_message, setError_message] = useState(null);
  const [result, setResult] = useState(null);

  const onConvert = () => {
    docx2eaf({
      variables: {
        docxFile: file,
        separateFlag: separate_flag,
        allTablesFlag: all_tables_flag,
        noHeaderFlag: no_header_flag,
        noParsingFlag: no_parsing_flag
      }
    }).then(
      ({ data: { docx2eaf } }) => {
        setConverting_flag(false);
        setResult(docx2eaf);
      },

      error_data => {
        setConverting_flag(false);
        setError_message(error_data.message);
      }
    );

    setConverting_flag(true);
    setError_message(null);
    setResult(null);
  };

  return (
    <div className="background-content">
      {user.id === undefined && !loading ? (
        <Message>
          <Message.Header>{getTranslation("Please sign in")}</Message.Header>
          <p>{getTranslation("Only registered users can convert .docx to .eaf.")}</p>
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
                label={getTranslation("All tables")}
                checked={all_tables_flag}
                onChange={(e, { checked }) => {
                  setAll_tables_flag(checked);
                  setError_message(null);
                  setResult(null);
                }}
              />
            </List.Item>

            <List.Item>
              <Checkbox
                label={getTranslation("Separate by paragraphs")}
                checked={separate_flag}
                onChange={(e, { checked }) => {
                  setSeparate_flag(checked);
                  setError_message(null);
                  setResult(null);
                }}
              />
            </List.Item>

            <List.Item>
              <Checkbox
                label={getTranslation("No header")}
                checked={no_header_flag}
                onChange={(e, { checked }) => {
                  setNo_header_flag(checked);
                  setError_message(null);
                  setResult(null);
                }}
              />
            </List.Item>

            <List.Item>
              <Checkbox
                label={getTranslation("No parsing")}
                checked={no_parsing_flag}
                onChange={(e, { checked }) => {
                  setNo_parsing_flag(checked);
                  setError_message(null);
                  setResult(null);
                }}
              />
            </List.Item>

            <List.Item>
              <span>
                {getTranslation(file ? ".docx file for convertion:" : "Please select .docx file for convertion.")}
              </span>

              {file && (
                <Label style={{ marginLeft: "0.5em" }}>
                  <Icon name="file outline" />
                  {file.name}
                </Label>
              )}

              <Button style={{ marginLeft: "1em" }} onClick={() => document.getElementById("file-select").click()}>
                {`${getTranslation("Browse")}...`}
              </Button>

              <Input
                id="file-select"
                type="file"
                style={{ display: "none" }}
                onChange={e => {
                  setFile(e.target.files[0]);
                  setError_message(null);
                  setResult(null);
                }}
              />
            </List.Item>

            <List.Item>
              <Button color="green" content={getTranslation("Convert")} disabled={!file} onClick={onConvert} />
            </List.Item>
          </List>

          {error_message && (
            <Message negative>
              <Message.Header>{getTranslation("Convertion error")}</Message.Header>
              <p>
                <span>{getTranslation("Please contact developers at")} </span>
                <a href="https://t.me/lingvodoc_support" target="_blank" rel="noreferrer">
                  {getTranslation("Support@Telegram")}
                </a>
                <span> {getTranslation("or at")} </span>
                <a href="https://github.com/ispras/lingvodoc-react/issues">{getTranslation("Lingvodoc Github")}</a>
                <span>.</span>
              </p>
              <p>{error_message}</p>
            </Message>
          )}

          {converting_flag && (
            <Dimmer active inverted>
              <Loader inverted indeterminate>
                {getTranslation("Converting")}...
              </Loader>
            </Dimmer>
          )}

          {result && !result.triumph && (
            <Message>
              <Message.Header>{getTranslation("Convertion failed")}</Message.Header>
              <p>{getTranslation(result.message)}</p>
            </Message>
          )}

          {result && result.triumph && (
            <Message positive>
              <Message.Header>{getTranslation("Converted successfully")}</Message.Header>
              <List>
                <List.Item>
                  <a href={result.eaf_url}>{getTranslation(".eaf file")}</a>
                </List.Item>

                <List.Item>
                  <a href={result.check_txt_url}>{getTranslation("check .txt")}</a>
                </List.Item>

                {result.check_docx_url && (
                  <List.Item>
                    <a href={result.check_docx_url}>{getTranslation("check .docx")}</a>
                  </List.Item>
                )}

                {result.alignment_url && (
                  <List.Item>
                    <a href={result.alignment_url}>{getTranslation("alignment .docx")}</a>
                  </List.Item>
                )}
              </List>
            </Message>
          )}
        </Segment>
      )}
    </div>
  );
};

export default compose(
  connect(state => state.user),
  graphql(docx2eafMutation, { name: "docx2eaf" })
)(Docx2Eaf);
