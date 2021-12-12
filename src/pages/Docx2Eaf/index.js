import React from 'react';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Checkbox, Dimmer, Input, List, Loader, Message, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { getTranslation } from 'api/i18n';

const docx2eafMutation = gql`
  mutation docx2eaf(
    $docxFile: Upload,
    $separateFlag: Boolean,
    $allTablesFlag: Boolean)
  {
    docx2eaf(
      docx_file: $docxFile,
      separate_flag: $separateFlag,
      all_tables_flag: $allTablesFlag)
    {
      triumph
      eaf_url
      alignment_url
      check_txt_url
      check_docx_url
      message
    }
  }
`;

class Docx2Eaf extends React.Component
{
  constructor(props)
  {  
    super(props);

    this.state = {
      separate_flag: false,
      all_tables_flag: false,
      converting_flag: false,
      error_message: null, 
      result: null
    };

    this.onFileChange = this.onFileChange.bind(this);
  }

  onFileChange(e)
  {
    this.props.docx2eaf({
      variables: {
        docxFile: e.target.files[0],
        separateFlag: this.state.separate_flag,
        allTablesFlag: this.state.all_tables_flag },
    })

    .then(

      ({ data: { docx2eaf }}) => {

        this.setState({
          converting_flag: false,
          result: docx2eaf });

      },

      (error_data) => {

        this.setState({
          converting_flag: false,
          error_message: error_data.message });

      }

    );

    this.setState({
      converting_flag: true,
      error_message: null,
      result: null });
  }

  render()
  {
    const result = this.state.result;

    return (
      <div className="background-content">

      {this.props.user.id === undefined && !this.props.loading

        ?

        <Message>
          <Message.Header>
            {getTranslation('Please sign in')}
          </Message.Header>
          <p>
            {getTranslation('Only registered users can convert .docx to .eaf.')}
          </p>
        </Message>

        :

        this.props.loading

        ?

        <Segment>
          <Loader active inline='centered' indeterminate>{getTranslation('Loading...')}</Loader>
        </Segment>

        :

        <Segment>

          <List>
          <List.Item>
          <Checkbox
            label={getTranslation('All tables')}
            checked={this.state.all_tables_flag}
            onChange={(e, { checked }) => {
              this.setState({ all_tables_flag: checked });}}
          />
          </List.Item>

          <List.Item>
          <Checkbox
            label={getTranslation('Separate by paragraphs')}
            checked={this.state.separate_flag}
            onChange={(e, { checked }) => {
              this.setState({ separate_flag: checked });}}
          />
          </List.Item>

          <List.Item>
          <span>{getTranslation('.docx file for convertion:')}</span>
          <Button onClick={() => document.getElementById('file-select').click()} style={{ marginLeft: '1rem' }}>
            {`${getTranslation('Browse')}...`}
          </Button>
          <Input id="file-select" type="file" onChange={this.onFileChange} style={{ display: 'none' }}/>
          </List.Item>
          </List>

          {this.state.error_message && (
            <Message negative>
              <Message.Header>
                {getTranslation('Convertion error')}
              </Message.Header>
              <p>
                <span>Please contact developers at </span>
                <a href="https://t.me/lingvodoc_support" target="_blank">{getTranslation('Support@Telegram')}</a>
                <span> or at </span>
                <a href="https://github.com/ispras/lingvodoc-react/issues">{getTranslation('Lingvodoc Github')}</a>
                <span>.</span>
              </p>
              <p>
                {getTranslation(this.state.error_message)}
              </p>
            </Message>
          )}

          {this.state.converting_flag && (
            <Dimmer active inverted>
              <Loader inverted indeterminate>{getTranslation('Converting...')}</Loader>
            </Dimmer>
          )}

          {result && !result.triumph && (
            <Message>
              <Message.Header>
                {getTranslation('Convertion failed')}
              </Message.Header>
              <p>
                {getTranslation(result.message)}
              </p>
            </Message>
          )}

          {result && result.triumph && (
            <Message positive>
              <Message.Header>
                {getTranslation('Converted successfully')}
              </Message.Header>
              <List>

                <List.Item>
                  <a href={result.eaf_url}>{getTranslation('.eaf file')}</a>
                </List.Item>

                <List.Item>
                  <a href={result.check_txt_url}>{getTranslation('check .txt')}</a>
                </List.Item>

                {result.check_docx_url && (
                  <List.Item>
                    <a href={result.check_docx_url}>{getTranslation('check .docx')}</a>
                  </List.Item>)}

                {result.alignment_url && (
                  <List.Item>
                    <a href={result.alignment_url}>{getTranslation('alignment .docx')}</a>
                  </List.Item>)}

              </List>
            </Message>
          )}

        </Segment>}

      </div>
    );
  }
}

export default compose(
  connect(state => state.user),
  graphql(docx2eafMutation, { name: 'docx2eaf' }),
)(Docx2Eaf);
