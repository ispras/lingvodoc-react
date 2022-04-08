import React, { useState } from "react";
import { Button, Confirm, Dropdown, Icon, Input, Table } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { getTranslation } from "api/i18n";
import { reverse, sortBy } from "lodash";
import PropTypes from "prop-types";
import { compose, pure, withReducer } from "recompose";

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

const Blob = ({ blob, deleteBlob }) => {
  const [confirmation, setConfirmation] = useState(false);

  const remove = () => {
    setConfirmation(false);
    deleteBlob({
      variables: { id: blob.id },
      refetchQueries: [
        {
          query: userBlobsQuery
        }
      ]
    });
  };

  return (
    <Table.Row>
      <Table.Cell>
        <a href={blob.content}>{blob.name}</a>
      </Table.Cell>
      <Table.Cell>{blob.data_type}</Table.Cell>
      <Table.Cell>{new Date(blob.created_at * 1e3).toLocaleString()}</Table.Cell>
      <Table.Cell>
        <Button basic content={getTranslation("Remove")} onClick={() => setConfirmation(true)} />
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
    }).then(() => {
      const { trigger } = this.state;
      window.logger.suc(getTranslation("Upload successful"));
      this.setState({ file: undefined, trigger: !trigger });
    });
  }

  render() {
    const { data, sortByField, dispatch } = this.props;
    const { loading, error } = data;
    if (loading || error) {
      return null;
    }

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
        text: getTranslation("PDF file"),
        value: "pdf",
        icon: "file pdf outline"
      },
      {
        text: getTranslation("Dialeqt file"),
        value: "dialeqt_dictionary",
        icon: "conversation"
      },
      {
        text: getTranslation("Starling"),
        value: "starling/csv",
        icon: "conversation"
      },
      {
        text: getTranslation("Image"),
        value: "image",
        icon: "file outline"
      }
    ];

    return (
      <div className="background-content">
        <Table celled compact definition>
          <Table.Header fullWidth>
            <Table.Row>
              <Table.HeaderCell colSpan="5">
                <Button onClick={() => document.getElementById("file-select").click()} style={{ marginRight: "1rem" }}>
                  {`${getTranslation("Browse")}...`}
                </Button>
                {file === undefined ? getTranslation("No file selected") : file.name}
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
                  content={getTranslation("Upload")}
                  disabled={file === undefined}
                  onClick={this.uploadBlob}
                />
                <Input
                  icon={{ name: "search" }}
                  placeholder={getTranslation("Search")}
                  onChange={event => this.setState({ filter: event.target.value })}
                  style={{ float: "right", width: "300px" }}
                />
              </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <SortableColumnHeader
                onSortModeChange={order => dispatch({ type: "SET_SORT_MODE", payload: { prop: "name", order } })}
              >
                {getTranslation("Name")}
              </SortableColumnHeader>
              <SortableColumnHeader
                onSortModeChange={order => dispatch({ type: "SET_SORT_MODE", payload: { prop: "data_type", order } })}
              >
                {getTranslation("Type")}
              </SortableColumnHeader>
              <SortableColumnHeader
                onSortModeChange={order => dispatch({ type: "SET_SORT_MODE", payload: { prop: "created_at", order } })}
              >
                {getTranslation("Created")}
              </SortableColumnHeader>
              <Table.HeaderCell>{getTranslation("Actions")}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {blobs
              .filter(b => !b.marked_for_deletion)
              .map(blob => (
                <BlobWithData key={compositeIdToString(blob.id)} blob={blob} />
              ))}
          </Table.Body>
        </Table>
      </div>
    );
  }
}

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
  graphql(userBlobsQuery),
  graphql(createBlobMutation, { name: "createBlob" }),
  withReducer("sortByField", "dispatch", sortByFieldReducer, null)
)(Files);
