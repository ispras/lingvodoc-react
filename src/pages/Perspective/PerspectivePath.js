import React from "react";
import { connect } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { Breadcrumb, Dropdown, Header } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import { openModal as openCreatePerspectiveModal } from "ducks/createPerspective";
import { openModal as openDictionaryOrganizationsModal } from "ducks/dictionaryOrganizations";
import { openDictionaryPropertiesModal } from "ducks/dictionaryProperties";
import { openPerspectivePropertiesModal } from "ducks/perspectiveProperties";
import { openRoles } from "ducks/roles";
import { openSaveDictionaryModal } from "ducks/saveDictionary";
import { openStatistics } from "ducks/statistics";
import { openUploadModal, updateUploadModal } from "ducks/upload";
import TranslationContext from "Layout/TranslationContext";

const queryPerspectivePath = gql`
  query queryPerspectivePath($id: LingvodocID!) {
    perspective(id: $id) {
      id
      tree {
        id
        translations
      }
    }
  }
`;

export const queryAvailablePerspectives = gql`
  query availablePerspectives($dictionary_id: LingvodocID!) {
    dictionary(id: $dictionary_id) {
      id
      category
      perspectives {
        id
        parent_id
        translations
      }
      additional_metadata {
        license
      }
    }
  }
`;

const uploadPerspective = gql`
  mutation uploadPerspective($id: LingvodocID!, $debugFlag: Boolean) {
    tsakorpus(perspective_id: $id, force: true, debug_flag: $debugFlag) {
      triumph
    }
  }
`;

const license_dict_translator = getTranslation => ({
  proprietary: [getTranslation("Proprietary"), null],
  "cc-by-4.0": ["CC-BY-4.0", "https://creativecommons.org/licenses/by/4.0/legalcode"],
  "cc-by-sa-4.0": ["CC-BY-SA-4.0", "https://creativecommons.org/licenses/by-sa/4.0/legalcode"],
  "cc-by-nc-sa-4.0": ["CC-BY-NC-SA-4.0", "https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode"]
});

/**
 * Perspective breadcrumb component.
 */
class PerspectivePath extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      uploading: false
    };

    this.uploadPerspectiveWrapper = this.uploadPerspectiveWrapper.bind(this);
  };

  uploadPerspectiveWrapper() {
    const {id, actions, uploadPerspective} = this.props;

    this.setState({ uploading: true });

    uploadPerspective({
      variables: { id }
    }).then(
      ({ data }) => {
        this.setState({ uploading: false });
        actions.updateUploadModal(data.tsakorpus.triumph ? false : null);
      },
      () => {
        this.setState({ uploading: false });
        actions.updateUploadModal(null);
      }
    )
  }

  render() {
    /* eslint-disable no-shadow */
    const {
      id,
      dictionary_id,
      queryPerspectivePath,
      queryAvailablePerspectives,
      mode,
      className,
      actions,
      user,
      performRedirect,
      disableDNDProvider
    } = this.props;
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
    if (performRedirect && (dictionary_id_tree[0] !== dictionary_id[0] || dictionary_id_tree[1] !== dictionary_id[1])) {
      const redirect_url =
        `/dictionary/${dictionary_id_tree[0]}/${dictionary_id_tree[1]}` + `/perspective/${id[0]}/${id[1]}/${mode}`;

      return <Navigate to={redirect_url} />;
    }

    const license_dict = license_dict_translator(this.context);

    const [license_str, license_url] = license_dict[license_dict.hasOwnProperty(license) ? license : "proprietary"];

    const roles_str = this.context("Roles").toLowerCase();
    const properties_str = this.context("Properties").toLowerCase();
    const statistics_str = this.context("Statistics").toLowerCase();
    const upload_str = this.context("Upload").toLowerCase();

    return (
      <Header as="h2" className={className}>
        <Breadcrumb
          icon={<i className="lingvo-icon lingvo-icon_divider" />}
          className="lingvo-breadcrumbs"
          sections={tree
            .slice()
            .reverse()
            .map((e, index) => ({
              key: e.id,
              content:
                // eslint-disable-next-line no-nested-ternary
                index === tree.length - 1 ? (
                  <Dropdown
                    className="lingvo-dropdown-inline lingvo-dropdown-inline_perspective"
                    text={T(e.translations)}
                    icon={<i className="lingvo-icon lingvo-icon_arrow" />}
                  >
                    <Dropdown.Menu>
                      {perspectives.length > 1 && [
                        perspectives
                          .filter(pers => pers.id !== tree[0].id)
                          .map(pers => (
                            <Dropdown.Item
                              key={pers.id}
                              as={Link}
                              to={`/dictionary/${pers.parent_id.join("/")}/perspective/${pers.id.join("/")}/${mode}`}
                              icon={<i className="lingvo-icon lingvo-icon_table" />}
                              text={T(pers.translations)}
                            />
                          )),
                        <Dropdown.Divider key="divider" />
                      ]}

                      {user.id !== undefined && [
                        <Dropdown.Item
                          key="roles"
                          icon={<i className="lingvo-icon lingvo-icon_roles" />}
                          text={this.context("Roles")}
                          onClick={() => actions.openRoles(id, "perspective", `'${T(e.translations)}' ${roles_str}`)}
                        />,
                        <Dropdown.Item
                          key="properties"
                          icon={<i className="lingvo-icon lingvo-icon_properties" />}
                          text={this.context("Properties")}
                          onClick={() =>
                            actions.openPerspectivePropertiesModal(
                              id,
                              dictionary_id,
                              `${this.context("Perspective")} '${T(e.translations)}' ${properties_str}`
                            )
                          }
                        />
                      ]}
                      <Dropdown.Item
                        key="statistics"
                        icon={<i className="lingvo-icon lingvo-icon_stats" />}
                        text={this.context("Statistics")}
                        onClick={() =>
                          actions.openStatistics(id, "perspective", `'${T(e.translations)}' ${statistics_str}`)
                        }
                      />
                      {user.id !== undefined && category == 1 && (
                        <Dropdown.Item
                          key="upload"
                          icon={<i className="lingvo-icon lingvo-icon_published" />}
                          text={this.context("Upload")}
                          onClick={() =>
                            actions.openUploadModal(
                              id,
                              `'${T(e.translations)}' ${upload_str}`,
                              this.state.uploading,
                              this.uploadPerspectiveWrapper)
                          }
                        />
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                ) : index === tree.length - 2 ? (
                  <Dropdown
                    className="lingvo-dropdown-inline lingvo-dropdown-inline_perspective"
                    text={T(e.translations)}
                    icon={<i className="lingvo-icon lingvo-icon_arrow" />}
                  >
                    <Dropdown.Menu>
                      {user.id !== undefined && [
                        <Dropdown.Item
                          key="roles"
                          icon={<i className="lingvo-icon lingvo-icon_roles" />}
                          text={this.context("Roles")}
                          onClick={() =>
                            actions.openRoles(dictionary_id, "dictionary", `'${T(e.translations)}' ${roles_str}`)
                          }
                        />,

                        <Dropdown.Item
                          key="properties"
                          icon={<i className="lingvo-icon lingvo-icon_properties" />}
                          text={this.context("Properties")}
                          onClick={() => {
                            actions.openDictionaryPropertiesModal(
                              dictionary_id,
                              `${this.context("Dictionary")} '${T(e.translations)}' ${properties_str}`
                            );
                            disableDNDProvider();
                          }}
                        />,

                        <Dropdown.Item
                          key="organizations"
                          icon={<i className="lingvo-icon lingvo-icon_organizations" />}
                          text={this.context("Organizations")}
                          onClick={() => actions.openDictionaryOrganizationsModal(dictionary_id)}
                        />
                      ]}

                      <Dropdown.Item
                        key="statistics"
                        icon={<i className="lingvo-icon lingvo-icon_stats" />}
                        text={this.context("Statistics")}
                        onClick={() =>
                          actions.openStatistics(
                            dictionary_id,
                            "dictionary",
                            `'${T(e.translations)}' ${statistics_str}`
                          )
                        }
                      />

                      <Dropdown.Item
                        key="create_perspective"
                        icon={<i className="lingvo-icon lingvo-icon_create" />}
                        text={this.context("Create new perspective")}
                        onClick={() => actions.openCreatePerspectiveModal(dictionary_id)}
                      />

                      <Dropdown.Item
                        key="save"
                        icon={<i className="lingvo-icon lingvo-icon_save" />}
                        text={this.context("Save dictionary")}
                        onClick={() => actions.openSaveDictionaryModal(dictionary_id)}
                      />
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Dropdown
                    className="lingvo-dropdown-inline lingvo-dropdown-inline_perspective"
                    text={T(e.translations)}
                    icon={<i className="lingvo-icon lingvo-icon_arrow" />}
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item
                        key="statistics"
                        icon={<i className="lingvo-icon lingvo-icon_stats" />}
                        text={this.context("Statistics")}
                        onClick={() =>
                          actions.openStatistics(e.id, "language", `'${T(e.translations)}' ${statistics_str}`)
                        }
                      />
                    </Dropdown.Menu>
                  </Dropdown>
                ),

              link: false
            }))}
        />
        <div className="lingvo-license">
          <span>
            {`${this.context("License").toLowerCase()}: `}
            {license_url ? (
              <a className="license" href={license_url}>
                {license_str}
              </a>
            ) : (
              <span>{license_str}</span>
            )}
          </span>
        </div>
      </Header>
    );
  }
}

PerspectivePath.contextType = TranslationContext;

PerspectivePath.propTypes = {
  id: PropTypes.array.isRequired,
  dictionary_id: PropTypes.array.isRequired,
  queryPerspectivePath: PropTypes.object.isRequired,
  queryAvailablePerspectives: PropTypes.object.isRequired,
  uploadPerspective: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  className: PropTypes.string,
  actions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  performRedirect: PropTypes.bool,
  disableDNDProvider: PropTypes.func
};

PerspectivePath.defaultProps = {
  className: "white",
  disableDNDProvider: () => {}
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
          openStatistics,
          openUploadModal,
          updateUploadModal
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
  }),
  graphql(uploadPerspective, { name: "uploadPerspective" })
)(PerspectivePath);
