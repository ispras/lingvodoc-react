import React from "react";
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

class Docx2Eaf extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      separate_flag: false,
      all_tables_flag: false,
      no_header_flag: false,
      no_parsing_flag: false,
      file: null,
      converting_flag: false,
      error_message: null,
      result: null
    };

    this.onConvert = this.onConvert.bind(this);
  }

  onConvert() {
    this.props
      .docx2eaf({
        variables: {
          docxFile: this.state.file,
          separateFlag: this.state.separate_flag,
          allTablesFlag: this.state.all_tables_flag,
          noHeaderFlag: this.state.no_header_flag,
          noParsingFlag: this.state.no_parsing_flag
        }
      })

      .then(
        ({ data: { docx2eaf } }) => {
          this.setState({
            converting_flag: false,
            result: docx2eaf
          });
        },

        error_data => {
          this.setState({
            converting_flag: false,
            error_message: error_data.message
          });
        }
      );

    this.setState({
      converting_flag: true,
      error_message: null,
      result: null
    });
  }

  render() {
    const result = this.state.result;

    return (
      <div className="background-content">
        {this.props.user.id === undefined && !this.props.loading ? (
          <Message>
            <Message.Header>{this.context("Please sign in")}</Message.Header>
            <p>{this.context("Only registered users can convert .docx to .eaf.")}</p>
          </Message>
        ) : this.props.loading ? (
          <Segment>
            <Loader active inline="centered" indeterminate>
              {this.context("Loading...")}
            </Loader>
          </Segment>
        ) : (
          <Segment>
            <List>
              <List.Item>
                <Checkbox
                  label={this.context("All tables")}
                  checked={this.state.all_tables_flag}
                  onChange={(e, { checked }) =>
                    this.setState({
                      all_tables_flag: checked,
                      error_message: null,
                      result: null
                    })
                  }
                />
              </List.Item>

              <List.Item>
                <Checkbox
                  label={this.context("Separate by paragraphs")}
                  checked={this.state.separate_flag}
                  onChange={(e, { checked }) =>
                    this.setState({
                      separate_flag: checked,
                      error_message: null,
                      result: null
                    })
                  }
                />
              </List.Item>

              <List.Item>
                <Checkbox
                  label={this.context("No header")}
                  checked={this.state.no_header_flag}
                  onChange={(e, { checked }) =>
                    this.setState({
                      no_header_flag: checked,
                      error_message: null,
                      result: null
                    })
                  }
                />
              </List.Item>

              <List.Item>
                <Checkbox
                  label={this.context("No parsing")}
                  checked={this.state.no_parsing_flag}
                  onChange={(e, { checked }) =>
                    this.setState({
                      no_parsing_flag: checked,
                      error_message: null,
                      result: null
                    })
                  }
                />
              </List.Item>

              <List.Item>
                <span>
                  {this.context(
                    this.state.file ? ".docx file for convertion:" : "Please select .docx file for convertion."
                  )}
                </span>

                {this.state.file && (
                  <Label style={{ marginLeft: "0.5em" }}>
                    <Icon name="file outline" />
                    {this.state.file.name}
                  </Label>
                )}

                <Button style={{ marginLeft: "1em" }} onClick={() => document.getElementById("file-select").click()}>
                  {`${this.context("Browse")}...`}
                </Button>

                <Input
                  id="file-select"
                  type="file"
                  style={{ display: "none" }}
                  onChange={e =>
                    this.setState({
                      file: e.target.files[0],
                      error_message: null,
                      result: null
                    })
                  }
                />
              </List.Item>

              <List.Item>
                <Button
                  color="green"
                  content={this.context("Convert")}
                  disabled={!this.state.file}
                  onClick={this.onConvert}
                />
              </List.Item>
            </List>

            {this.state.error_message && (
              <Message negative>
                <Message.Header>{this.context("Convertion error")}</Message.Header>
                <p>
                  <span>Please contact developers at </span>
                  <a href="https://t.me/lingvodoc_support" target="_blank" rel="noreferrer">
                    {this.context("Support@Telegram")}
                  </a>
                  <span> or at </span>
                  <a href="https://github.com/ispras/lingvodoc-react/issues">{this.context("Lingvodoc Github")}</a>
                  <span>.</span>
                </p>
                <p>{this.context(this.state.error_message)}</p>
              </Message>
            )}

            {this.state.converting_flag && (
              <Dimmer active inverted>
                <Loader inverted indeterminate>
                  {this.context("Converting...")}
                </Loader>
              </Dimmer>
            )}

            {result && !result.triumph && (
              <Message>
                <Message.Header>{this.context("Convertion failed")}</Message.Header>
                <p>{this.context(result.message)}</p>
              </Message>
            )}

            {result && result.triumph && (
              <Message positive>
                <Message.Header>{this.context("Converted successfully")}</Message.Header>
                <List>
                  <List.Item>
                    <a href={result.eaf_url}>{this.context(".eaf file")}</a>
                  </List.Item>

                  <List.Item>
                    <a href={result.check_txt_url}>{this.context("check .txt")}</a>
                  </List.Item>

                  {result.check_docx_url && (
                    <List.Item>
                      <a href={result.check_docx_url}>{this.context("check .docx")}</a>
                    </List.Item>
                  )}

                  {result.alignment_url && (
                    <List.Item>
                      <a href={result.alignment_url}>{this.context("alignment .docx")}</a>
                    </List.Item>
                  )}
                </List>
              </Message>
            )}
          </Segment>
        )}
      </div>
    );
  }
}

Docx2Eaf.contextType = TranslationContext;

export default compose(
  connect(state => state.user),
  graphql(docx2eafMutation, { name: "docx2eaf" })
)(Docx2Eaf);
