import React from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import { Breadcrumb, Dropdown, Header } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import { openModal as openCreatePerspectiveModal } from "ducks/createPerspective";
import { openModal as openDictionaryOrganizationsModal } from "ducks/dictionaryOrganizations";
import { openDictionaryPropertiesModal } from "ducks/dictionaryProperties";
import { openPerspectivePropertiesModal } from "ducks/perspectiveProperties";
import { openRoles } from "ducks/roles";
import { openSaveDictionaryModal } from "ducks/saveDictionary";
import { openStatistics } from "ducks/statistics";

const queryPerspectivePath = gql`
  query queryPerspectivePath($id: LingvodocID!) {
    perspective(id: $id) {
      id
      tree {
        id
        translation
      }
    }
  }
`;

export const queryAvailablePerspectives = gql`
  query availablePerspectives($dictionary_id: LingvodocID!) {
    dictionary(id: $dictionary_id) {
      id
      perspectives {
        id
        parent_id
        translation
      }
      additional_metadata {
        license
      }
    }
  }
`;

const proprietary_str = getTranslation("Proprietary");

const license_dict = {
  proprietary: [proprietary_str, null],
  "cc-by-4.0": ["CC-BY-4.0", "https://creativecommons.org/licenses/by/4.0/legalcode"],
  "cc-by-sa-4.0": ["CC-BY-SA-4.0", "https://creativecommons.org/licenses/by-sa/4.0/legalcode"],
  "cc-by-nc-sa-4.0": ["CC-BY-NC-SA-4.0", "https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode"]
};

/**
 * Perspective breadcrumb component.
 */
class PerspectivePath extends React.Component {
  render() {
    /* eslint-disable no-shadow */
    const { id, dictionary_id, queryPerspectivePath, queryAvailablePerspectives, mode, className, actions, user } =
      this.props;
    /* eslint-enable no-shadow */
    if (
      queryPerspectivePath.loading ||
      queryPerspectivePath.error ||
      queryAvailablePerspectives.loading ||
      queryAvailablePerspectives.error
    ) {
      return null;
    }

    const {
      perspective: { tree }
    } = queryPerspectivePath;

    const dictionary_id_tree = tree[1].id;

    const {
      category,
      perspectives,
      additional_metadata: { license }
    } = queryAvailablePerspectives.dictionary;

    /* If the dictionary in the URL is not actually the perspective's dictionary,
     * we redirect to the proper URL with the perspective's dictionary. */

    if (dictionary_id_tree[0] != dictionary_id[0] || dictionary_id_tree[1] != dictionary_id[1]) {
      const redirect_url =
        `/dictionary/${dictionary_id_tree[0]}/${dictionary_id_tree[1]}` + `/perspective/${id[0]}/${id[1]}/${mode}`;

      return <Redirect to={redirect_url} />;
    }

    const [license_str, license_url] = license_dict.hasOwnProperty(license)
      ? license_dict[license]
      : [proprietary_str, null];

    return (
      <Header as="h2" className={className}>
        <Breadcrumb
          icon="right angle"
          className="lingvo-breadcrumbs"
          sections={tree
            .slice()
            .reverse()
            .map((e, index) => ({
              key: e.id,
              content:
                // eslint-disable-next-line no-nested-ternary
                index === tree.length - 1 ? (
                  <Dropdown inline text={e.translation}>
                    <Dropdown.Menu>
                      {perspectives.length > 1 && [
                        perspectives
                          .filter(pers => pers.id !== tree[0].id)
                          .map(pers => (
                            <Dropdown.Item
                              key={pers.id}
                              as={Link}
                              to={`/dictionary/${pers.parent_id.join("/")}/perspective/${pers.id.join("/")}/${mode}`}
                              icon="chevron right"
                              text={pers.translation}
                            />
                          )),
                        <Dropdown.Divider key="divider" />
                      ]}

                      {user.id !== undefined && [
                        <Dropdown.Item
                          key="roles"
                          icon="users"
                          text={`'${e.translation}' ${getTranslation("Roles").toLowerCase()}...`}
                          onClick={() =>
                            actions.openRoles(
                              id,
                              "perspective",
                              `'${e.translation}' ${getTranslation("Roles").toLowerCase()}`
                            )
                          }
                        />,
                        <Dropdown.Item
                          key="properties"
                          icon="setting"
                          text={`'${e.translation}' ${getTranslation("Properties").toLowerCase()}...`}
                          onClick={() =>
                            actions.openPerspectivePropertiesModal(
                              id,
                              dictionary_id,
                              `'${e.translation}' ${getTranslation("Properties").toLowerCase()}`
                            )
                          }
                        />
                      ]}
                      <Dropdown.Item
                        key="statistics"
                        icon="percent"
                        text={`'${e.translation}' ${getTranslation("Statistics").toLowerCase()}...`}
                        onClick={() =>
                          actions.openStatistics(
                            id,
                            "perspective",
                            `'${e.translation}' ${getTranslation("Statistics").toLowerCase()}`
                          )
                        }
                      />
                    </Dropdown.Menu>
                  </Dropdown>
                ) : index === tree.length - 2 ? (
                  <Dropdown inline text={e.translation}>
                    <Dropdown.Menu>
                      {user.id !== undefined && [
                        <Dropdown.Item
                          key="roles"
                          icon="users"
                          text={`'${e.translation}' ${getTranslation("Roles").toLowerCase()}...`}
                          onClick={() =>
                            actions.openRoles(
                              dictionary_id,
                              "dictionary",
                              `'${e.translation}' ${getTranslation("Roles").toLowerCase()}`
                            )
                          }
                        />,

                        <Dropdown.Item
                          key="properties"
                          icon="setting"
                          text={`'${e.translation}' ${getTranslation("Properties").toLowerCase()}...`}
                          onClick={() =>
                            actions.openDictionaryPropertiesModal(
                              dictionary_id,
                              `'${e.translation}' ${getTranslation("Properties").toLowerCase()}`
                            )
                          }
                        />,

                        <Dropdown.Item
                          key="organizations"
                          icon="address book"
                          text={`'${e.translation}' ${getTranslation("Organizations").toLowerCase()}...`}
                          onClick={() => actions.openDictionaryOrganizationsModal(dictionary_id)}
                        />
                      ]}

                      <Dropdown.Item
                        key="statistics"
                        icon="percent"
                        text={`'${e.translation}' ${getTranslation("Statistics").toLowerCase()}...`}
                        onClick={() =>
                          actions.openStatistics(
                            dictionary_id,
                            "dictionary",
                            `'${e.translation}' ${getTranslation("Statistics").toLowerCase()}`
                          )
                        }
                      />

                      <Dropdown.Item
                        key="create_perspective"
                        icon="file outline"
                        text={`${getTranslation("Create new")} '${e.translation}' ${getTranslation("perspective")}...`}
                        onClick={() => actions.openCreatePerspectiveModal(dictionary_id)}
                      />

                      <Dropdown.Item
                        key="save"
                        icon="save"
                        text={`${getTranslation("Save dictionary")} '${e.translation}'...`}
                        onClick={() => actions.openSaveDictionaryModal(dictionary_id)}
                      />
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  e.translation
                ),

              link: false
            }))}
        />
        <div
          style={{
            float: "right",
            fontSize: "1rem"
          }}
        >
          <span>
            {`${getTranslation("license")}: `}
            {license_url ? (
              <a className="license" href={license_url}>
                {license_str}
              </a>
            ) : (
              <span>{license_str}</span>
            )}
          </span>
          <style type="text/css">
            {"a.license:link { color: white }"}
            {"a.license:visited { color: white }"}
            {"a.license:hover { color: #1e70bf }"}
          </style>
        </div>
      </Header>
    );
  }
}

PerspectivePath.propTypes = {
  id: PropTypes.array.isRequired,
  dictionary_id: PropTypes.array.isRequired,
  queryPerspectivePath: PropTypes.object.isRequired,
  queryAvailablePerspectives: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  className: PropTypes.string,
  actions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

PerspectivePath.defaultProps = {
  className: "white"
};

export default compose(
  connect(
    state => state.user,
    dispatch => ({
      actions: bindActionCreators(
        {
          openCreatePerspectiveModal,
          openDictionaryOrganizationsModal,
          openDictionaryPropertiesModal,
          openPerspectivePropertiesModal,
          openRoles,
          openSaveDictionaryModal,
          openStatistics
        },
        dispatch
      )
    })
  ),
  graphql(queryPerspectivePath, {
    name: "queryPerspectivePath",
    options: props => ({ variables: { id: props.id } })
  }),
  graphql(queryAvailablePerspectives, {
    name: "queryAvailablePerspectives",
    options: props => ({ variables: { dictionary_id: props.dictionary_id } })
  })
)(PerspectivePath);
