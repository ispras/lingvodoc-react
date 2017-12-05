import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { gql, graphql } from 'react-apollo';
import { Table, Button, Dropdown } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';

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
  mutation createBlob($data_type: String!) {
    create_userblob(data_type: $data_type) {
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
  const remove = () => {
    deleteBlob({
      variables: { id: blob.id },
      refetchQueries: [
        {
          query: userBlobsQuery,
        },
      ],
    });
  };

  return (
    <Table.Row>
      <Table.Cell>{blob.name}</Table.Cell>
      <Table.Cell>{blob.data_type}</Table.Cell>
      <Table.Cell>{blob.content}</Table.Cell>
      <Table.Cell>{blob.created_at}</Table.Cell>
      <Table.Cell>
        <Button basic content="Remove" onClick={remove} />
      </Table.Cell>
    </Table.Row>
  );
};

Blob.propTypes = {
  blob: PropTypes.object.isRequired,
  deleteBlob: PropTypes.func.isRequired,
};

const BlobWithData = compose(graphql(deleteBlobMutation, { name: 'deleteBlob' }), pure)(Blob);

const fileTypes = [
  {
    text: 'PDF file',
    value: 'pdf',
    icon: 'conversation',
  },
  {
    text: 'Dialeqt file',
    value: 'dialeqt_dictionary',
    icon: 'conversation',
  },
  {
    text: 'Starling',
    value: 'starling/csv',
    icon: 'conversation',
  },
];

class Files extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileType: fileTypes[0].value,
      file: null,
    };
    this.uploadBlob = this.uploadBlob.bind(this);
    this.onFileTypeChange = this.onFileTypeChange.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
  }

  onFileTypeChange(event, target) {
    this.setState({
      fileType: target.value,
    });
  }

  onFileChange(e) {
    this.setState({
      file: e.target.files[0],
    });
  }

  uploadBlob() {
    const { createBlob } = this.props;
    createBlob({
      variables: { data_type: this.state.fileType, content: this.state.file },
      refetchQueries: [
        {
          query: userBlobsQuery,
        },
      ],
    });
  }

  render() {
    const { data } = this.props;
    const { loading, error } = data;
    if (loading || error) {
      return null;
    }

    const { user_blobs: blobs } = data;

    return (
      <Table celled compact definition>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Link</Table.HeaderCell>
            <Table.HeaderCell>Created</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {blobs
            .filter(b => !b.marked_for_deletion)
            .map(blob => <BlobWithData key={compositeIdToString(blob.id)} blob={blob} />)}
        </Table.Body>

        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="5">
              <input type="file" multiple="false" onChange={this.onFileChange} />
              <Dropdown button basic options={fileTypes} value={this.state.fileType} onChange={this.onFileTypeChange} />
              <Button basic content="Upload" onClick={this.uploadBlob} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

Files.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.bool,
    user_blobs: PropTypes.array,
  }).isRequired,
  createBlob: PropTypes.func.isRequired,
};

export default compose(graphql(userBlobsQuery), graphql(createBlobMutation, { name: 'createBlob' }))(Files);
