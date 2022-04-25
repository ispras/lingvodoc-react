import React from "react";
import { Button, Container, Loader, Message, Pagination } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

import { getTranslation } from "api/i18n";

import EditAtoms from "./EditAtoms";

const getTranslationsQuery = gql`
  query getTranslations(
    $searchstring: String!
    $search_case_insensitive: Boolean
    $search_regular_expression: Boolean
    $gists_type: String!
  ) {
    translation_search(
      searchstring: $searchstring
      search_case_insensitive: $search_case_insensitive
      search_regular_expression: $search_regular_expression
      translation_type: $gists_type
      deleted: false
      order_by_type: true
      no_result_error_flag: false
    ) {
      id
      type
      translationatoms(deleted: false) {
        id
        content
        locale_id
      }
    }
    all_locales
  }
`;

class TranslationsBlock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gistsType: props.gists_type,
      translationgists: props.translationgists,
      newgists: [],
      activePage: 1,
      gistsPerPage: 25
    };

    this.addTranslationGist = this.addTranslationGist.bind(this);
  }

  addTranslationGist() {
    const newGists = this.state.newgists;
    const date = new Date();
    const date_str = date.toISOString() + date.getUTCMilliseconds().toString();
    newGists.push({ type: this.state.gistsType, atoms: [{ id: date_str, locale_id: 2, content: "" }] });
    this.setState({ newgists: newGists });
  }

  componentWillReceiveProps(props) {
    if (!props.data.loading) {
      if (props.gists_type != this.state.gistsType) {
        this.refetching = true;

        props.data.refetch().then(result => {
          this.refetching = false;
          this.setState({ gistsType: props.gists_type, translationgists: result.data.translationgists, newgists: [] });
        });
      }
    }
  }

  render() {
    const {
      data: { error, loading, translation_search: translationgists, all_locales }
    } = this.props;

    const newGists = this.state.newgists;

    if (error) {
      return (
        <div style={{ textAlign: "center" }}>
          <Message compact negative>
            {getTranslation("Translation loading error")}.
          </Message>
        </div>
      );
    }

    if (loading || this.refetching) {
      return <Loader active content={`${getTranslation("Loading")}...`}></Loader>;
    }

    const typeGistsMap = new Map();
    const types = [];
    let currentType = null;

    const { activePage, gistsPerPage } = this.state;

    const totalPages = Math.ceil(translationgists.length / gistsPerPage);

    translationgists.slice((activePage - 1) * gistsPerPage, activePage * gistsPerPage).forEach(item => {
      if (item.translationatoms.length == 0) {
        return;
      }

      if (currentType == null || currentType != item.type) {
        currentType = item.type;
        types.push(currentType);
        typeGistsMap[currentType] = [];
        typeGistsMap[currentType].push(item);
      } else if (currentType == item.type) {
        typeGistsMap[currentType].push(item);
      }
    });

    if (this.state.gistsType && types.length <= 0) {
      types.push(this.state.gistsType);
      typeGistsMap[this.state.gistsType] = [];
    }

    return (
      <Container>
        {translationgists.length > 0 && (
          <div style={{ marginBottom: "26px", textAlign: "center" }}>
            <Pagination
              activePage={activePage}
              totalPages={totalPages}
              onPageChange={(e, { activePage }) => this.setState({ activePage })}
            />
          </div>
        )}
        {types.map(type => (
          <Container fluid key={type}>
            <h1 className="lingvo-header-translations">{getTranslation(type)}</h1>

            {this.state.gistsType && (
              <div className="lingvo-new-gists">
                <Button onClick={this.addTranslationGist} className="lingvo-button-violet-dashed">
                  {getTranslation("Add new translation gist")}
                </Button>

                {newGists
                  .map((gist, i) => (
                    <EditAtoms
                      key={`atom${i}-type${type}`}
                      gistId={`atom${i}-type${type}`}
                      atoms={gist.atoms}
                      locales={all_locales}
                      gistsType={type}
                      newGist="true"
                    ></EditAtoms>
                  ))
                  .reverse()}
              </div>
            )}

            {typeGistsMap[type].length > 0 ? (
              typeGistsMap[type].map(gist => (
                <EditAtoms
                  key={gist.id}
                  gistId={gist.id}
                  atoms={gist.translationatoms}
                  locales={all_locales}
                ></EditAtoms>
              ))
            ) : (
              <h1 className="lingvo-header-translations">{getTranslation("No translations.")}</h1>
            )}
          </Container>
        ))}
        {translationgists.length > 0 && (
          <div style={{ textAlign: "center" }}>
            <Pagination
              activePage={activePage}
              totalPages={totalPages}
              onPageChange={(e, { activePage }) => this.setState({ activePage })}
            />
          </div>
        )}
      </Container>
    );
  }
}

export default graphql(getTranslationsQuery)(TranslationsBlock);
