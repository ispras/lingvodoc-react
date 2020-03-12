import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure, withReducer } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { sortBy, reverse } from 'lodash';
import { Table, Button, Dropdown, Icon, Input } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';
import { getTranslation } from 'api/i18n';

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
      <Table.Cell>
        <a href={blob.content}>{blob.name}</a>
      </Table.Cell>
      <Table.Cell>{blob.data_type}</Table.Cell>
      <Table.Cell>{new Date(blob.created_at * 1e3).toLocaleString()}</Table.Cell>
      <Table.Cell>
        <Button basic content={getTranslation('Remove')} onClick={remove} />
      </Table.Cell>
    </Table.Row>
  );
};

Blob.propTypes = {
  blob: PropTypes.object.isRequired,
  deleteBlob: PropTypes.func.isRequired,
};

const SortableColumnHeader = ({ children, onSortModeChange }) => (
  <Table.HeaderCell>
    {children}
    <span>
      <Icon fitted size="large" name="caret up" onClick={() => onSortModeChange('a')} />
      <Icon fitted size="large" name="caret down" onClick={() => onSortModeChange('d')} />
    </span>
  </Table.HeaderCell>
);

const BlobWithData = compose(graphql(deleteBlobMutation, { name: 'deleteBlob' }), pure)(Blob);

const fileTypes = [
  {
    text: getTranslation('PDF file'),
    value: 'pdf',
    icon: 'file pdf outline',
  },
  {
    text: getTranslation('Dialeqt file'),
    value: 'dialeqt_dictionary',
    icon: 'conversation',
  },
  {
    text: 'Starling',
    value: 'starling/csv',
    icon: 'conversation',
  },
  {
    text: getTranslation('Image'),
    value: 'image',
    icon: 'file outline',
  }
];

function sortFiles(files, sortByField) {
  const { prop, order } = sortByField;
  const sortedFiles = sortBy(files, file => file[prop]);
  return order === 'a' ? sortedFiles : reverse(sortedFiles);
}

class Files extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileType: fileTypes[0].value,
      file: undefined,
      trigger: true
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
      refetchQueries: [
        {
          query: userBlobsQuery,
        }
      ],
    }).then(() => {
      const { trigger } = this.state;
      window.logger.suc(getTranslation('Upload successful'));
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
    const blobs = sortByField ? sortFiles(userBlobs, sortByField) : userBlobs;
    const { file, trigger } = this.state;

    return (
      <Table celled compact definition>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="5">
              <Input key={trigger} type="file" transparent onChange={this.onFileChange} />
              <Dropdown button basic options={fileTypes} value={this.state.fileType} onChange={this.onFileTypeChange} />
              <Button color="green" content={getTranslation('Upload')} disabled={file === undefined} onClick={this.uploadBlob} />
            </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <SortableColumnHeader
              onSortModeChange={order => dispatch({ type: 'SET_SORT_MODE', payload: { prop: 'name', order } })}
            >
              {getTranslation('Name')}
            </SortableColumnHeader>
            <SortableColumnHeader
              onSortModeChange={order => dispatch({ type: 'SET_SORT_MODE', payload: { prop: 'data_type', order } })}
            >
              {getTranslation('Type')}
            </SortableColumnHeader>
            <SortableColumnHeader
              onSortModeChange={order => dispatch({ type: 'SET_SORT_MODE', payload: { prop: 'created_at', order } })}
            >
              {getTranslation('Created')}
            </SortableColumnHeader>
            <Table.HeaderCell>{getTranslation('Actions')}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {blobs
            .filter(b => !b.marked_for_deletion)
            .map(blob => <BlobWithData key={compositeIdToString(blob.id)} blob={blob} />)}
        </Table.Body>
      </Table>
    );
  }
}

Files.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.object,
    user_blobs: PropTypes.array,
  }).isRequired,
  createBlob: PropTypes.func.isRequired,
  sortByField: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

Files.defaultProps = {
  sortByField: null,
};

function sortByFieldReducer(state, { type, payload }) {
  switch (type) {
    case 'SET_SORT_MODE':
      return payload;
    case 'RESET_SORT_MODE':
      return null;
    default:
      return state;
  }
}

export default compose(
  graphql(userBlobsQuery),
  graphql(createBlobMutation, { name: 'createBlob' }),
  withReducer('sortByField', 'dispatch', sortByFieldReducer, null)
)(Files);
