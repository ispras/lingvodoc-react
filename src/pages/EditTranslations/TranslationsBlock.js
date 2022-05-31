import React from "react";
import { Button, Container, Loader, Message } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import Immutable from "immutable";
import PropTypes from "prop-types";

import Pagination from "components/Pagination";
import TranslationContext from "Layout/TranslationContext";

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

    const search_key = Immutable.List([
      props.searchstring,
      props.search_case_insensitive,
      props.search_regular_expression,
      props.gists_type
    ]);

    this.state = {
      newgists: [],
      activePageMap: Immutable.Map([[search_key, 1]]),
      gistsPerPage: 25
    };

    this.addTranslationGist = this.addTranslationGist.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
  }

  addTranslationGist() {
    const newGists = this.state.newgists;
    const date = new Date();
    const date_str = date.toISOString() + date.getUTCMilliseconds().toString();
    newGists.push({ type: this.props.gists_type, atoms: [{ id: date_str, locale_id: 2, content: "" }] });
    this.setState({ newgists: newGists });
  }

  onPageChange(activePage) {
    const search_key = Immutable.List([
      this.props.searchstring,
      this.props.search_case_insensitive,
      this.props.search_regular_expression,
      this.props.gists_type
    ]);
    this.setState({
      activePageMap: this.state.activePageMap.set(search_key, activePage),
      activePage
    });
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
            {error.message === "InvalidRegularExpression"
              ? this.context("Invalid regular expression")
              : this.context("Translation loading error")}
            .
          </Message>
        </div>
      );
    }

    if (loading || this.refetching) {
      return (
        <div className="lingvo-loader-translations">
          <Loader active content={`${this.context("Loading")}...`}></Loader>
        </div>
      );
    }

    const typeGistsMap = new Map();
    const types = [];
    let currentType = null;

    const { activePageMap, gistsPerPage } = this.state;

    const search_key = Immutable.List([
      this.props.searchstring,
      this.props.search_case_insensitive,
      this.props.search_regular_expression,
      this.props.gists_type
    ]);

    const activePage = activePageMap.get(search_key, 1);

    const translationGists = translationgists.filter(item => {
      return (
        item.translationatoms.length > 1 ||
        (item.translationatoms.length === 1 && item.translationatoms[0].content !== "")
      );
    });

    /* sorting */
    translationGists.sort((a, b) => {
      let nameA, nameB;

      const localeA = a.translationatoms.filter(item => item.locale_id === 2)[0];
      if (localeA) {
        nameA = localeA.content.toLowerCase();
      } else {
        nameA = a.translationatoms[0].content.toLowerCase();
      }

      const localeB = b.translationatoms.filter(item => item.locale_id === 2)[0];
      if (localeB) {
        nameB = localeB.content.toLowerCase();
      } else {
        nameB = b.translationatoms[0].content.toLowerCase();
      }

      /* sort string ascending */
      if (nameA < nameB && a.type === b.type) {
        return -1;
      }
      if (nameA > nameB && a.type === b.type) {
        return 1;
      }
      /* default return value (no sorting) */
      return 0;
    });

    translationGists.slice((activePage - 1) * gistsPerPage, activePage * gistsPerPage).forEach(item => {
      if (currentType === null || currentType !== item.type) {
        currentType = item.type;
        types.push(currentType);
        typeGistsMap[currentType] = [];
        typeGistsMap[currentType].push(item);
      } else if (currentType === item.type) {
        typeGistsMap[currentType].push(item);
      }
    });

    if (types.length <= 0) {
      if (this.props.gists_type) {
        types.push(this.props.gists_type);
        typeGistsMap[this.props.gists_type] = [];
      } else {
        return <h1 className="lingvo-header-translations">{this.context("No translations.")}</h1>;
      }
    }

    return (
      <div>
        <Pagination
          activePage={activePage}
          pageSize={gistsPerPage}
          totalItems={translationGists.length}
          onPageChanged={this.onPageChange}
        />
        {types.map(type => (
          <Container fluid key={type}>
            {!this.props.gists_type && <h2 className="lingvo-subheader-translations">{this.context(type)}</h2>}

            {this.props.gists_type && (
              <div className="lingvo-new-gists">
                <Button onClick={this.addTranslationGist} className="lingvo-button-violet-dashed">
                  {this.context("Add new translation gist")}
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
              <h1 className="lingvo-header-translations">{this.context("No translations.")}</h1>
            )}
          </Container>
        ))}
        <Pagination
          activePage={activePage}
          pageSize={25}
          totalItems={translationGists.length}
          showTotal
          onPageChanged={this.onPageChange}
        />
      </div>
    );
  }
}

TranslationsBlock.contextType = TranslationContext;

TranslationsBlock.propTypes = {
  gists_type: PropTypes.string.isRequired,
  searchstring: PropTypes.string,
  search_case_insensitive: PropTypes.bool,
  search_regular_expression: PropTypes.bool,
  data: PropTypes.object
};

export default graphql(getTranslationsQuery)(TranslationsBlock);
