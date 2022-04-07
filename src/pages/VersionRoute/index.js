import React from "react";
import { graphql } from "react-apollo";
import { Container } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import gql from "graphql-tag";
import { map } from "lodash";
import { compose } from "recompose";

import Footer from "components/Footer";

import "./styles.scss";

const versionRoute = props => {
  const {
    data: { version, version_uniparser }
  } = props;

  let uniparser_str_list = null;

  if (version_uniparser) {
    uniparser_str_list = Object.keys(version_uniparser);
    uniparser_str_list.sort();
  }

  return (
    <div className="lingvodoc-page">
      <div className="lingvodoc-page__content">

        <div className="version-route">

          <div className="background-header">
            <h2 className="page-title">{getTranslation("Version")}</h2>
          </div>

          <Container>
            <Container className="container-gray version-block">
              <h1 className="version-title">{getTranslation("Version")}</h1>

              <div className="version">
                <span className="version" style={{ marginBottom: "0.5em" }}>
                  Backend:
                </span>
                <span className="version" style={{ marginLeft: "0.5em" }}>
                  {version}
                </span>
              </div>

              {version_uniparser &&
                map(uniparser_str_list, uniparser_str => (
                  <div className="version" key={uniparser_str}>
                    <span className="version" style={{ marginBottom: "0.5em" }}>
                      {uniparser_str}:
                    </span>
                    <span className="version" style={{ marginLeft: "0.5em" }}>
                      {version_uniparser[uniparser_str]}
                    </span>
                  </div>
                ))}

              <div className="version">
                <span className="version" style={{ marginBottom: "0.5em" }}>
                  Frontend:
                </span>
                <span className="version" style={{ marginLeft: "0.5em" }}>
                  {__VERSION__}
                </span>
              </div>
            </Container>
          </Container>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default compose(
  graphql(
    gql`
      query version {
        version
        version_uniparser
      }
    `
  )
)(versionRoute);
