import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { compose, pure } from 'recompose';
import { List, fromJS } from 'immutable';
import styled from 'styled-components';
import { Checkbox, Grid, Radio, Segment, Button, Divider, Select, Input } from 'semantic-ui-react';
import { setQuery } from 'ducks/search';
import AdditionalFilter from 'components/Search/AdditionalFilter';
import { getTranslation } from 'api/i18n';

import { compositeIdToString } from 'utils/compositeId';
import './index.scss';

const mode2bool = (value) => {
  switch (value) {
    case 'ignore':
      return null;
    case 'include':
      return true;
    case 'exclude':
      return false;
    default:
      return null;
  }
};

const modeBlocksBool = (value) => {
  switch (value) {
    case 'and':
      return true;
    case 'or':
      return false;
    default:
      return false;
  }
};

const bool2category = (dicts, corpora) => {
  if (dicts && corpora) {
    return null;
  }
  if (dicts) {
    return 0;
  }
  if (corpora) {
    return 1;
  }

  return null;
};

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

const InnerSearchBlocks = styled.div`
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
    all_fields(common:true) {
      id
      translation
    }
  }
`;

function Query({
  data, query, onFieldChange, onDelete,
}) {
  const fieldId = query.get('field_id', fromJS([]));
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
    onFieldChange('field_id')(event, { value: fromJS(field.id) });
  };

  return (
    <QueryInput action type="text" placeholder="Search String" value={str} onChange={onFieldChange('search_string')}>
      <Select
        placeholder="Field"
        options={fieldOptions}
        value={compositeIdToString(fieldId.toJS())}
        onChange={onChange}
      />
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

function SearchBlock({
  data, subBlocksMode, onFieldChange, onAddInnerSearchBlock, onDeleteInnerSearchBlock, onDeleteSearchBlock,
}) {
  const subBlocksModeText = subBlocksMode.toUpperCase();
  return (
    <OrWrapper>
      <div>{subBlocksModeText} block</div>
      <InnerSearchBlocks>
        {data.map((block, id) => (
          <QueryWithData key={id} query={block} onFieldChange={onFieldChange(id)} onDelete={onDeleteInnerSearchBlock(id)} />
        ))}
        <div>
          <Button primary basic onClick={onAddInnerSearchBlock}>
            Add {subBlocksModeText} condition
          </Button>
        </div>
      </InnerSearchBlocks>

      <Button className="delete-and" compact basic icon="delete" onClick={onDeleteSearchBlock} />
    </OrWrapper>
  );
}

class QueryBuilder extends React.Component {
  constructor(props) {
    super(props);

    this.onAddInnerSearchBlock = this.onAddInnerSearchBlock.bind(this);
    this.onAddSearchBlock = this.onAddSearchBlock.bind(this);
    this.onDeleteSearchBlock = this.onDeleteSearchBlock.bind(this);
    this.onDeleteInnerSearchBlock = this.onDeleteInnerSearchBlock.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onAdditionalFieldsChange = this.onAdditionalFieldsChange.bind(this);
    this.onSearchButtonClick = this.onSearchButtonClick.bind(this);
    this.changeSource = this.changeSource.bind(this);
    this.changeMode = this.changeMode.bind(this);

    this.newBlock = fromJS(newBlock);
    const {
      langs, dicts, searchMetadata, grammaticalSigns: gramSigns, languageVulnerability: langVulnerability,
    } = this.props;
    const languages = langs || [];
    const dictionaries = dicts || [];
    const grammaticalSigns = gramSigns || {};
    const languageVulnerability = langVulnerability || [];
    let hasAudio = null;
    let kind = false;
    let years = [];
    let humanSettlement = [];
    let authors = [];

    if (searchMetadata) {
      if (typeof searchMetadata.hasAudio === 'boolean') {
        hasAudio = searchMetadata.hasAudio;
      }

      if (typeof searchMetadata.kind === 'boolean') {
        kind = searchMetadata.kind;
      } else {
        kind = searchMetadata.kind || kind;
      }

      years = searchMetadata.years || years;
      humanSettlement = searchMetadata.humanSettlement || humanSettlement;
      authors = searchMetadata.authors || authors;
    }

    this.additionalFields = {
      languages,
      dictionaries,
      hasAudio,
      kind,
      years,
      humanSettlement,
      authors,
      languageVulnerability,
      grammaticalSigns,
    };

    this.state = {
      data: fromJS(props.data),
      source: {
        dictionaries: true,
        corpora: true,
      },
      mode: {
        adopted: 'ignore',
        etymology: 'ignore',
        blocks: 'or',
      },
      allLangsDictsChecked: !this.props.langs && !this.props.dicts,
      xlsxExport: false,
    };
  }

  onAddSearchBlock() {
    const { data } = this.state;
    this.setState({ data: data.push(List.of(this.newBlock)) });
  }

  onAddInnerSearchBlock(id) {
    return () => {
      const { data } = this.state;
      this.setState({ data: data.update(id, v => v.push(this.newBlock)) });
    };
  }

  onDeleteSearchBlock(id) {
    return () => {
      const { data } = this.state;
      this.setState({ data: data.delete(id) });
    };
  }

  onDeleteInnerSearchBlock(id) {
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

  onAdditionalFieldsChange(data) {
    this.additionalFields = {
      ...this.additionalFields,
      ...data,
    };
  }

  onSearchButtonClick() {
    const { searchId, actions } = this.props;
    const {
      languages: langsToFilter, dictionaries: dictsToFilter,
      hasAudio, kind, years, humanSettlement, authors,
      grammaticalSigns, languageVulnerability,
    } = this.additionalFields;

    const adopted = mode2bool(this.state.mode.adopted);
    const etymology = mode2bool(this.state.mode.etymology);
    const category = bool2category(this.state.source.dictionaries, this.state.source.corpora);
    const blocks = modeBlocksBool(this.state.mode.blocks);
    const searchMetadata = {
      hasAudio,
      kind: kind || null,
      years,
      humanSettlement,
      authors,
    };
    const query = this.addGrammaticalSigns(this.state.data.toJS());

    actions.setQuery(
      searchId,
      query,
      category,
      adopted,
      etymology,
      langsToFilter,
      dictsToFilter,
      searchMetadata,
      grammaticalSigns,
      languageVulnerability,
      blocks,
      this.state.xlsxExport);
  }

  getBlocksText() {
    const { blocks } = this.state.mode;

    return blocks.toUpperCase();
  }

  getSubBlocksMode() {
    const { blocks } = this.state.mode;

    if (blocks === 'or') {
      return 'and';
    } else if (blocks === 'and') {
      return 'or';
    }

    return '';
  }

  addGrammaticalSigns(query) {
    const { grammaticalSigns } = this.additionalFields;
    const grammaticalGroupNames = Object.keys(grammaticalSigns);

    if (grammaticalGroupNames.length === 0) {
      return query;
    }

    const addGrammaticalSigns = [];

    grammaticalGroupNames.forEach((name) => {
      const values = Object.values(grammaticalSigns[name]);

      values.forEach((value) => {
        addGrammaticalSigns.push({
          search_string: `.*[.-]${value}`,
          matching_type: 'regexp',
        });
      });
    });

    if (addGrammaticalSigns.length === 0) {
      return query;
    }

    const resultQuery = [];

    query.forEach((q) => {
      const innerQuery = [...q];
      if (innerQuery[0].search_string === '') {
        innerQuery.shift();
      }

      addGrammaticalSigns.forEach(sign => innerQuery.push(sign));
      resultQuery.push(innerQuery);
    });

    return resultQuery;

    /* возможно, нужно будет использовать при переключении режима на AND */
    // query.forEach((q) => {
    //   addGrammaticalSigns.forEach(sign => q.push(sign));
    // });

    // return query;
  }

  changeSource(searchSourceType) {
    const newSource = {
      ...this.state.source,
    };

    newSource[searchSourceType] = !newSource[searchSourceType];

    this.setState({
      source: newSource,
    });
  }

  changeMode(modeType, value) {
    const newMode = {
      ...this.state.mode,
    };

    newMode[modeType] = value;

    this.setState({
      mode: newMode,
    });
  }

  render() {
    const blocks = this.state.data;
    const { showCreateSearchButton } = this.props;
    const { allLangsDictsChecked } = this.state;
    const blocksText = this.getBlocksText();
    const subBlocksMode = this.getSubBlocksMode();

    return (
      <div>
        <Segment.Group className="search-group">
          <Segment>Search in</Segment>
          <Segment.Group>
            <Segment>
              <Grid columns="equal">
                <Grid.Column>
                  <Checkbox
                    label="Dictionaries"
                    checked={this.state.source.dictionaries}
                    onChange={() => this.changeSource('dictionaries')}
                  />
                </Grid.Column>
                <Grid.Column>
                  <Checkbox
                    label="Corpora"
                    checked={this.state.source.corpora}
                    onChange={() => this.changeSource('corpora')}
                  />
                </Grid.Column>
                {showCreateSearchButton ?
                  <Grid.Column>
                    <Button primary basic onClick={this.props.createSearchWithAdditionalFields}>
                      {getTranslation('Search in found')}
                    </Button>
                  </Grid.Column> :
                  null
                }
              </Grid>
            </Segment>
          </Segment.Group>
        </Segment.Group>

        <AdditionalFilter
          onChange={this.onAdditionalFieldsChange}
          data={this.additionalFields}
          allLangsDictsChecked={allLangsDictsChecked}
        />

        <Segment.Group className="search-group">
          <Segment>Search options</Segment>
          <Segment.Group>
            <Segment>
              <Grid columns="equal" divided>
                <Grid.Column>
                  <Radio
                    label="Ignore adoptions"
                    name="adoptedMode"
                    value="ignore"
                    checked={this.state.mode.adopted === 'ignore'}
                    onChange={(e, { value }) => this.changeMode('adopted', value)}
                  />
                  <Radio
                    label="Search for adoptions"
                    name="adoptedMode"
                    value="include"
                    checked={this.state.mode.adopted === 'include'}
                    onChange={(e, { value }) => this.changeMode('adopted', value)}
                  />
                  <Radio
                    label="Exclude adoptions"
                    name="adoptedMode"
                    value="exclude"
                    checked={this.state.mode.adopted === 'exclude'}
                    onChange={(e, { value }) => this.changeMode('adopted', value)}
                  />
                </Grid.Column>
                <Grid.Column>
                  <Radio
                    label="Ignore etymology"
                    name="etymologyMode"
                    value="ignore"
                    checked={this.state.mode.etymology === 'ignore'}
                    onChange={(e, { value }) => this.changeMode('etymology', value)}
                  />
                  <Radio
                    label="Has etymology"
                    name="etymologyMode"
                    value="include"
                    checked={this.state.mode.etymology === 'include'}
                    onChange={(e, { value }) => this.changeMode('etymology', value)}
                  />
                  <Radio
                    label="Doesn't have etymology"
                    name="etymologyMode"
                    value="exclude"
                    checked={this.state.mode.etymology === 'exclude'}
                    onChange={(e, { value }) => this.changeMode('etymology', value)}
                  />
                </Grid.Column>
              </Grid>
            </Segment>
          </Segment.Group>
        </Segment.Group>
        <Segment.Group className="search-group">
          <Segment>
            <div>{getTranslation('OR/AND mode')}</div>
            <Segment.Group>
              <Segment>
                <Radio
                  label="AND"
                  name="blocksMode"
                  value="and"
                  checked={this.state.mode.blocks === 'and'}
                  onChange={(e, { value }) => this.changeMode('blocks', value)}
                />
                <Radio
                  label="OR"
                  name="blocksMode"
                  value="or"
                  checked={this.state.mode.blocks === 'or'}
                  onChange={(e, { value }) => this.changeMode('blocks', value)}
                />
              </Segment>
            </Segment.Group>
          </Segment>
        </Segment.Group>
        <Wrapper>
          {blocks.flatMap((subBlocks, id) =>
          List.of(
            <SearchBlock
              key={`s_${id}`}
              data={subBlocks}
              subBlocksMode={subBlocksMode}
              onFieldChange={this.onFieldChange(id)}
              onAddInnerSearchBlock={this.onAddInnerSearchBlock(id)}
              onDeleteInnerSearchBlock={this.onDeleteInnerSearchBlock(id)}
              onDeleteSearchBlock={this.onDeleteSearchBlock(id)}
            />,
            <Divider key={`d_${id}`} horizontal>
              { blocksText }
            </Divider>
          ))}
          <Button primary basic fluid onClick={this.onAddSearchBlock}>
            Add { blocksText } block
          </Button>

          <Divider />
          <Button primary basic onClick={this.onSearchButtonClick}>
            Search
          </Button>
          <Checkbox
            style={{marginLeft: '0.5em'}}
            label="Export to XLSX"
            checked={this.state.xlsxExport}
            onChange={() =>
              this.setState({ xlsxExport: !this.state.xlsxExport })}
          />
        </Wrapper>
      </div>
    );
  }
}

QueryBuilder.propTypes = {
  data: PropTypes.object,
  searchId: PropTypes.number.isRequired,
  langs: PropTypes.array,
  dicts: PropTypes.array,
  searchMetadata: PropTypes.object,
  grammaticalSigns: PropTypes.object,
  languageVulnerability: PropTypes.array,
  showCreateSearchButton: PropTypes.bool,
  createSearchWithAdditionalFields: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    setQuery: PropTypes.func.isRequired,
  }).isRequired,
  // langsQueryRes: PropTypes.object.isRequired,
};

QueryBuilder.defaultProps = {
  data: [[newBlock]],
  showCreateSearchButton: false,
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