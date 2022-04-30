import React, { useContext, useState } from "react";
import { connect } from "react-redux";
import { Button, Confirm, Dropdown, Icon, Input, Loader, Message, Segment, Table } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { reverse, sortBy } from "lodash";
import PropTypes from "prop-types";
import { compose, pure, withReducer } from "recompose";

import TranslationContext from "Layout/TranslationContext";
import { fieldsQuery } from "pages/DictImport";
import { compositeIdToString } from "utils/compositeId";

const userBlobsQuery = gql`
  query userBlobs {
    user_blobs {
      id
      name
      data_type
      content
      created_at
      marked_for_deletion
    }
  }
`;

const createBlobMutation = gql`
  mutation createBlob($data_type: String!, $content: Upload) {
    create_userblob(data_type: $data_type, file1: $content) {
      triumph
    }
  }
`;

const deleteBlobMutation = gql`
  mutation deleteBlob($id: LingvodocID!) {
    delete_userblob(id: $id) {
      triumph
    }
  }
`;

const Blob = ({ blob, user_is_active, deleteBlob }) => {
  const [confirmation, setConfirmation] = useState(false);
  const getTranslation = useContext(TranslationContext);

  const remove = () => {
    setConfirmation(false);
    deleteBlob({
      variables: { id: blob.id },
      refetchQueries: [
        {
          query: userBlobsQuery
        }
      ]
    }).then(
      () => {
        window.logger.suc(getTranslation("Remove successful"));
      },
      () => {
        window.logger.err(getTranslation("Remove failed"));
      }
    );
  };

  return (
    <Table.Row>
      <Table.Cell>
        <a href={blob.content}>{blob.name}</a>
      </Table.Cell>
      <Table.Cell>{blob.data_type}</Table.Cell>
      <Table.Cell>{new Date(blob.created_at * 1e3).toLocaleString()}</Table.Cell>
      <Table.Cell>
        {user_is_active && <Button basic content={getTranslation("Remove")} onClick={() => setConfirmation(true)} />}
      </Table.Cell>
      <Confirm
        open={confirmation}
        header={getTranslation("Confirmation")}
        content={`${getTranslation("Are you sure you want to delete file")} '${blob.name}'?`}
        onConfirm={remove}
        onCancel={() => setConfirmation(false)}
        className="lingvo-confirm"
      />
    </Table.Row>
  );
};

Blob.propTypes = {
  blob: PropTypes.object.isRequired,
  deleteBlob: PropTypes.func.isRequired
};

const SortableColumnHeader = ({ children, onSortModeChange }) => (
  <Table.HeaderCell>
    {children}
    <span>
      <Icon fitted size="large" name="caret up" onClick={() => onSortModeChange("a")} />
      <Icon fitted size="large" name="caret down" onClick={() => onSortModeChange("d")} />
    </span>
  </Table.HeaderCell>
);

const BlobWithData = compose(graphql(deleteBlobMutation, { name: "deleteBlob" }), pure)(Blob);

function sortFiles(files, sortByField) {
  const { prop, order } = sortByField;
  const sortedFiles = sortBy(files, file => file[prop]);
  return order === "a" ? sortedFiles : reverse(sortedFiles);
}

class Files extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileType: "pdf",
      file: undefined,
      trigger: true,
      filter: ""
    };
    this.uploadBlob = this.uploadBlob.bind(this);
    this.onFileTypeChange = this.onFileTypeChange.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
  }

  onFileTypeChange(event, target) {
    this.setState({ fileType: target.value });
  }

  onFileChange(e) {
    this.setState({ file: e.target.files[0] });
  }

  uploadBlob() {
    const { createBlob } = this.props;
    createBlob({
      variables: { data_type: this.state.fileType, content: this.state.file },
      refetchQueries: [{ query: userBlobsQuery }, { query: fieldsQuery }]
    }).then(
      () => {
        const { trigger } = this.state;
        window.logger.suc(this.context("Upload successful"));
        this.setState({ file: undefined, trigger: !trigger });
      },
      () => {
        window.logger.err(this.context("Upload failed"));
      }
    );
  }

  render() {
    if (this.props.error) {
      return (
        <div className="background-content">
          <Message compact negative>
            {this.context("User sign-in error, please sign in; if not successful, please contact administrators.")}
          </Message>
        </div>
      );
    } else if (this.props.data.error) {
      return (
        <div className="background-content">
          <Message compact negative>
            {this.context("General error, please contact administrators.")}
          </Message>
        </div>
      );
    } else if (this.props.loading || this.props.data.loading) {
      return (
        <div className="background-content">
          <Segment>
            <Loader active inline="centered" indeterminate>
              {`${this.context("Loading")}...`}
            </Loader>
          </Segment>
        </div>
      );
    } else if (this.props.user.id === undefined) {
      return (
        <div className="background-content">
          <Message>
            <Message.Header>{this.context("Please sign in")}</Message.Header>
            <p>{this.context("Only registered users can work with files.")}</p>
          </Message>
        </div>
      );
    }

    const { data, sortByField, dispatch } = this.props;

    const { user_blobs: userBlobs } = data;
    const { file, trigger, filter } = this.state;
    let blobs = userBlobs.filter(b => !b.marked_for_deletion);
    if (filter !== "") {
      blobs = blobs.filter(b => b.name.includes(filter));
    }
    if (sortByField) {
      blobs = sortFiles(blobs, sortByField);
    }

    const fileTypes = [
      {
        text: this.context("PDF file"),
        value: "pdf",
        icon: "file pdf outline"
      },
      {
        text: this.context("Dialeqt file"),
        value: "dialeqt_dictionary",
        icon: "conversation"
      },
      {
        text: this.context("Starling"),
        value: "starling/csv",
        icon: "conversation"
      },
      {
        text: this.context("Image"),
        value: "image",
        icon: "file outline"
      }
    ];

    const user_is_active = this.props.user.is_active;

    return (
      <div className="background-content">
        <Table celled compact definition>
          <Table.Header fullWidth>
            <Table.Row>
              <Table.HeaderCell colSpan="5">
                {user_is_active && (
                  <>
                    <Button
                      onClick={() => document.getElementById("file-select").click()}
                      style={{ marginRight: "1rem" }}
                    >
                      {`${this.context("Browse")}...`}
                    </Button>
                    {file === undefined ? this.context("No file selected") : file.name}
                    <Input
                      id="file-select"
                      key={trigger}
                      type="file"
                      onChange={this.onFileChange}
                      style={{ display: "none" }}
                    />
                    <Dropdown
                      button
                      basic
                      options={fileTypes}
                      value={this.state.fileType}
                      onChange={this.onFileTypeChange}
                      style={{ margin: "0 1rem 0 1rem" }}
                    />
                    <Button
                      color="green"
                      content={this.context("Upload")}
                      disabled={file === undefined}
                      onClick={this.uploadBlob}
                    />
                  </>
                )}
                <Input
                  icon={{ name: "search" }}
                  placeholder={this.context("Search")}
                  onChange={event => this.setState({ filter: event.target.value })}
                  style={{ float: "right", width: "300px" }}
                />
              </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <SortableColumnHeader
                onSortModeChange={order => dispatch({ type: "SET_SORT_MODE", payload: { prop: "name", order } })}
              >
                {this.context("Name")}
              </SortableColumnHeader>
              <SortableColumnHeader
                onSortModeChange={order => dispatch({ type: "SET_SORT_MODE", payload: { prop: "data_type", order } })}
              >
                {this.context("Type")}
              </SortableColumnHeader>
              <SortableColumnHeader
                onSortModeChange={order => dispatch({ type: "SET_SORT_MODE", payload: { prop: "created_at", order } })}
              >
                {this.context("Created")}
              </SortableColumnHeader>
              <Table.HeaderCell>{this.context("Actions")}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {blobs
              .filter(b => !b.marked_for_deletion)
              .map(blob => (
                <BlobWithData key={compositeIdToString(blob.id)} blob={blob} user_is_active={user_is_active} />
              ))}
          </Table.Body>
        </Table>
      </div>
    );
  }
}

Files.contextType = TranslationContext;

Files.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.object,
    user_blobs: PropTypes.array
  }).isRequired,
  createBlob: PropTypes.func.isRequired,
  sortByField: PropTypes.object,
  dispatch: PropTypes.func.isRequired
};

Files.defaultProps = {
  sortByField: null
};

function sortByFieldReducer(state, { type, payload }) {
  switch (type) {
    case "SET_SORT_MODE":
      return payload;
    case "RESET_SORT_MODE":
      return null;
    default:
      return state;
  }
}

export default compose(
  connect(state => state.user),
  graphql(userBlobsQuery),
  graphql(createBlobMutation, { name: "createBlob" }),
  withReducer("sortByField", "dispatch", sortByFieldReducer, null)
)(Files);
