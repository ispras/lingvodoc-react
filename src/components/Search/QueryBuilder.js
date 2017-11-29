import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { gql, graphql } from 'react-apollo';
import { compose, pure, onlyUpdateForKeys } from 'recompose';
import { List, fromJS } from 'immutable';
import styled from 'styled-components';
import { Segment, Button, Divider, Select, Input } from 'semantic-ui-react';
import { setQuery } from 'ducks/search';

import { compositeIdToString } from '../../utils/compositeId';

const Wrapper = styled.div`margin-bottom: 1em;`;

const OrWrapper = styled(Segment)`
  .delete-and {
    box-shadow: none !important;
    position: absolute !important;
    padding: 10px !important;
    margin: 0;
    right: 0;
    top: 0;
  }
`;

const OrBlocks = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .ui.action.input {
    margin-right: 2em;
    margin-bottom: 0.5em;
    margin-top: 0.5em;
  }
`;

const QueryInput = styled(Input)`
  & > .dropdown:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: transparent;
  }

  & > input {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }
`;

const matchingOptions = [
  { key: 'fullstring', text: 'Full string', value: 'full_string' },
  { key: 'substring', text: 'Sub string', value: 'substring' },
  { key: 'regexp', text: 'Regexp', value: 'regexp' },
];

const newBlock = {
  search_string: '',
  matching_type: 'full_string',
};

const fieldsQuery = gql`
  query searchBootstrapQuery {
    all_fields {
      id
      translation
    }
  }
`;

function Query({
  data, query, onFieldChange, onDelete,
}) {
  const fieldId = query.get('field_id', '');
  const str = query.get('search_string', '');
  const type = query.get('matching_type', '');

  if (data.loading) {
    return null;
  }

  const { all_fields: fields } = data;
  const fieldOptions = fields.map(field => ({
    key: compositeIdToString(field.id),
    text: field.translation,
    value: compositeIdToString(field.id),
  }));

  // wrapper functions to map str field ids to array ids.
  const fieldById = compositeId => fields.find(f => compositeId === compositeIdToString(f.id));
  const onChange = (event, { value }) => {
    const field = fieldById(value);
    onFieldChange('field_id')(event, { value: field.id });
  };

  return (
    <QueryInput action type="text" placeholder="Search String" value={str} onChange={onFieldChange('search_string')}>
      <Select placeholder="Field" options={fieldOptions} value={compositeIdToString(fieldId)} onChange={onChange} />
      <input />
      <Select
        compact
        placeholder="Match"
        options={matchingOptions}
        value={type}
        onChange={onFieldChange('matching_type')}
      />
      <Button compact basic color="red" icon="delete" onClick={onDelete} />
    </QueryInput>
  );
}

const QueryWithData = graphql(fieldsQuery)(Query);

function OrBlock({
  data, onFieldChange, onAddBlock, onDeleteBlock, onDelete,
}) {
  return (
    <OrWrapper>
      <OrBlocks>
        {data.map((block, id) => (
          <QueryWithData key={id} query={block} onFieldChange={onFieldChange(id)} onDelete={onDeleteBlock(id)} />
        ))}
        <Button primary basic icon="add" onClick={onAddBlock} />
      </OrBlocks>

      <Button className="delete-and" compact basic icon="delete" onClick={onDelete} />
    </OrWrapper>
  );
}

class QueryBuilder extends React.Component {
  constructor(props) {
    super(props);

    this.onAddAndBlock = this.onAddAndBlock.bind(this);
    this.onAddOrBlock = this.onAddOrBlock.bind(this);
    this.onDeleteAndBlock = this.onDeleteAndBlock.bind(this);
    this.onDeleteOrBlock = this.onDeleteOrBlock.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);

    this.newBlock = fromJS(newBlock);

    this.state = {
      data: fromJS(props.data),
    };
  }

  onAddAndBlock() {
    const { data } = this.state;
    this.setState({ data: data.push(List.of(this.newBlock)) });
  }

  onAddOrBlock(id) {
    return () => {
      const { data } = this.state;
      this.setState({ data: data.update(id, v => v.push(this.newBlock)) });
    };
  }

  onDeleteAndBlock(id) {
    return () => {
      const { data } = this.state;
      this.setState({ data: data.delete(id) });
    };
  }

  onDeleteOrBlock(id) {
    return subid => () => {
      const { data } = this.state;
      this.setState({ data: data.deleteIn([id, subid]) });
    };
  }

  onFieldChange(id) {
    return subid => field => (event, { value }) => {
      const { data } = this.state;
      this.setState({ data: data.setIn([id, subid, field], value) });
    };
  }

  render() {
    const { actions } = this.props;
    const blocks = this.state.data;
    return (
      <Wrapper>
        {blocks.flatMap((subblocks, id) =>
          List.of(
            <OrBlock
              key={`s_${id}`}
              data={subblocks}
              onFieldChange={this.onFieldChange(id)}
              onAddBlock={this.onAddOrBlock(id)}
              onDeleteBlock={this.onDeleteOrBlock(id)}
              onDelete={this.onDeleteAndBlock(id)}
            />,
            <Divider key={`d_${id}`} horizontal>
              And
            </Divider>
          ))}
        <Button primary basic fluid onClick={this.onAddAndBlock}>
          Add Another AND Block
        </Button>

        <Divider />

        <Button primary basic onClick={() => actions.setQuery(this.state.data.toJS())}>
          Search
        </Button>
      </Wrapper>
    );
  }
}

QueryBuilder.propTypes = {
  data: PropTypes.array,
  actions: PropTypes.shape({
    setQuery: PropTypes.func.isRequired,
  }).isRequired,
};

QueryBuilder.defaultProps = {
  data: [[newBlock]],
};

export default compose(
  connect(
    state => state.search,
    dispatch => ({
      actions: bindActionCreators({ setQuery }, dispatch),
    })
  ),
  pure
)(QueryBuilder);
