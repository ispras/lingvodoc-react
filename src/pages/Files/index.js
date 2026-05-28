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

const Files = ({ error, loading, user, data, sortByField, dispatch, createBlob }) => {
  const getTranslation = useContext(TranslationContext);

  const [fileType, setFileType] = useState("pdf");
  const [mimeType, setMimeType] = useState(".pdf");
  const [file, setFile] = useState(undefined);
  const [trigger, setTrigger] = useState(true);
  const [filter, setFilter] = useState("");

  const onFileTypeChange = (_event, target) => {
    let mimeType;
    switch (target.value) {
      case "pdf":
        mimeType = ".pdf";
        break;
      case "dialeqt_dictionary":
        mimeType = ".sqlite";
        break;
      case "starling/csv":
        mimeType = ".csv,.txt";
        break;
      case "txt":
        mimeType = ".txt";
        break;
      case "json":
        mimeType = ".json";
        break;
      case "image":
        mimeType = "image/*";
        break;
    }
    setFileType(target.value);
    setMimeType(mimeType);
  };

  const onFileChange = e => {
    setFile(e.target.files[0]);
  };

  const uploadBlob = () => {
    createBlob({
      variables: { data_type: fileType, content: file },
      refetchQueries: [{ query: userBlobsQuery }, { query: fieldsQuery }]
    }).then(
      () => {
        window.logger.suc(getTranslation("Upload successful"));
        setFile(undefined);
        setTrigger(!trigger);
      },
      () => {
        window.logger.err(getTranslation("Upload failed"));
      }
    );
  };

  if (error) {
    return (
      <div className="background-content">
        <Message compact negative>
          {getTranslation("User sign-in error, please sign in; if not successful, please contact administrators.")}
        </Message>
      </div>
    );
  } else if (loading) {
    return (
      <div className="background-content">
        <Segment>
          <Loader active inline="centered" indeterminate>
            {`${getTranslation("Loading sign-in data")}...`}
          </Loader>
        </Segment>
      </div>
    );
  } else if (user.id === undefined) {
    return (
      <div className="background-content">
        <Message>
          <Message.Header>{getTranslation("Please sign in")}</Message.Header>
          <p>{getTranslation("Only registered users can work with files.")}</p>
        </Message>
      </div>
    );
  } else if (data.error) {
    return (
      <div className="background-content">
        <Message compact negative>
          {getTranslation("General error, please contact administrators.")}
        </Message>
      </div>
    );
  } else if (data.loading) {
    return (
      <div className="background-content">
        <Segment>
          <Loader active inline="centered" indeterminate>
            {`${getTranslation("Loading file data")}...`}
          </Loader>
        </Segment>
      </div>
    );
  }

  const { user_blobs: userBlobs } = data;

  let blobs = userBlobs.filter(b => !b.marked_for_deletion);
  if (filter !== "") {
    blobs = blobs.filter(b => b.name.includes(filter));
  }
  if (sortByField) {
    blobs = sortFiles(blobs, sortByField);
  }

  const fileTypes = [
    {
      text: getTranslation("PDF"),
      value: "pdf",
      icon: "file pdf outline"
    },
    {
      text: getTranslation("Dialeqt"),
      value: "dialeqt_dictionary",
      icon: "conversation"
    },
    {
      text: getTranslation("Starling/CSV"),
      value: "starling/csv",
      icon: "conversation"
    },
    {
      text: getTranslation("Txt"),
      value: "txt",
      icon: "conversation"
    },
    {
      text: getTranslation("Json"),
      value: "json",
      icon: "conversation"
    },
    {
      text: getTranslation("Image"),
      value: "image",
      icon: "file outline"
    }
  ];

  const user_is_active = user.is_active;

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
                    {`${getTranslation("Browse")}...`}
                  </Button>
                  {file === undefined ? getTranslation("No file selected") : file.name}
                  <Input
                    id="file-select"
                    key={trigger}
                    type="file"
                    accept={mimeType}
                    onChange={onFileChange}
                    style={{ display: "none" }}
                  />
                  <Dropdown
                    button
                    basic
                    options={fileTypes}
                    value={fileType}
                    onChange={onFileTypeChange}
                    style={{ margin: "0 1rem 0 1rem" }}
                  />
                  <Button
                    color="green"
                    content={getTranslation("Upload")}
                    disabled={file === undefined}
                    onClick={uploadBlob}
                  />
                </>
              )}
              <Input
                icon={{ name: "search" }}
                placeholder={getTranslation("Search")}
                onChange={event => setFilter(event.target.value)}
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
              <BlobWithData key={compositeIdToString(blob.id)} blob={blob} user_is_active={user_is_active} />
            ))}
        </Table.Body>
      </Table>
    </div>
  );
};

Files.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.object,
    user_blobs: PropTypes.array
  }),
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
  graphql(userBlobsQuery, { skip: ({ user }) => user.id === undefined }),
  graphql(createBlobMutation, { name: "createBlob" }),
  withReducer("sortByField", "dispatch", sortByFieldReducer, null)
)(Files);
