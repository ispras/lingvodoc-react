import React from 'react';
import { List, fromJS } from 'immutable';
import styled from 'styled-components';
import { Segment, Button, Divider, Icon, Select, Input } from 'semantic-ui-react';

const Wrapper = styled.div`
  margin-bottom: 1em;
`;

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
    margin-bottom: .5em;
    margin-top: .5em;
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

const fieldOptions = [
  { key: 'name', text: 'name', value: 'name' },
  { key: 'whatever', text: 'whatever', value: 'whatever' },
];

const matchingOptions = [
  { key: 'substring', text: 'substring', value: 'substring' },
  { key: 'regexp', text: 'regexp', value: 'regexp' },
];

function Query({ data, onFieldChange, onDelete }) {
  const field = data.get('field_name', '');
  const str = data.get('search_string', '');
  const type = data.get('matching_type', '');

  return (
    <QueryInput
      action
      type="text"
      placeholder="Search String"
      value={str}
      onChange={onFieldChange('search_string')}
    >
      <Select
        compact
        placeholder="Field"
        options={fieldOptions}
        value={field}
        onChange={onFieldChange('field_name')}
      />
      <input />
      <Select
        compact
        placeholder="Match"
        options={matchingOptions}
        value={type}
        onChange={onFieldChange('matching_type')}
      />
      <Button compact basic color="red" onClick={onDelete}>
        <Icon name="delete" />
      </Button>
    </QueryInput>
  );
}

function OrBlock({ data, onFieldChange, onAddBlock, onDeleteBlock, onDelete }) {
  return (
    <OrWrapper>
      <OrBlocks>
        {
          data.map((block, id) =>
            <Query
              key={id}
              data={block}
              onFieldChange={onFieldChange(id)}
              onDelete={onDeleteBlock(id)}
            />
          )
        }
        <Button className="add-or" primary basic animated="vertical" onClick={onAddBlock}>
          <Button.Content hidden>Add OR</Button.Content>
          <Button.Content visible>
            <Icon name="add" />
          </Button.Content>
        </Button>
      </OrBlocks>

      <Button className="delete-and" compact basic animated="vertical" onClick={onDelete}>
        <Icon name="delete" />
      </Button>
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

    this.newBlock = fromJS({
      field_name: '',
      search_string: '',
      matching_type: '',
    });

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
    const blocks = this.state.data;

    return (
      <Wrapper>
        {
          blocks.flatMap((subblocks, id) => List.of(
            <OrBlock
              key={`s_${id}`}
              data={subblocks}
              onFieldChange={this.onFieldChange(id)}
              onAddBlock={this.onAddOrBlock(id)}
              onDeleteBlock={this.onDeleteOrBlock(id)}
              onDelete={this.onDeleteAndBlock(id)}
            />,
            <Divider key={`d_${id}`} horizontal>And</Divider>
          ))
        }
        <Button primary basic fluid onClick={this.onAddAndBlock}>Add Another AND Block</Button>
      </Wrapper>
    );
  }
}

export default QueryBuilder;
