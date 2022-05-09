import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Checkbox, Dropdown, Header, Icon } from "semantic-ui-react";
import PropTypes from "prop-types";

// eslint-disable-next-line import/no-unresolved
import config from "config";
import { useTranslations } from "hooks";
import { compositeIdToString } from "utils/compositeId";

const generateId = entity => {
  switch (entity.__typename) {
    case "Language":
      return `language_${compositeIdToString(entity.id)}`;
    case "Grant":
      return `grant_${entity.id}`;
    case "Organization":
      return `organization_${entity.id}`;
  }
};

/** Language tree node, can be language, grant, organization, dictionary or text */
const Node = ({ nodeInfo, root, selected, setSelected, proxyData }) => {
  const { getTranslation, chooseTranslation } = useTranslations();

  const user = useSelector(state => state.user.user);

  const { entity, children } = nodeInfo;
  switch (entity.__typename) {
    case "Language": {
      let langClass = "lang-name";
      if (root) {
        langClass = "root-lang-name";
      } else if (entity.in_toc) {
        langClass = "confirmed-lang-name";
      }
      return (
        <li className="lang" id={generateId(entity)}>
          <span className={langClass}>{entity.translations && chooseTranslation(entity.translations)}</span>
          <ul>
            {children.map((child, index) => (
              <Node key={index} nodeInfo={child} selected={selected} setSelected={setSelected} />
            ))}
            {entity.dictionaries.map((dictionary, index) => {
              const isDownloaded = proxyData
                ? proxyData.dictionaries.find(d => d.id.toString() === dictionary.id.toString()) !== undefined
                : false;
              const authors = dictionary.additional_metadata.authors;
              const perspectives = dictionary.perspectives;
              return (
                <li key={index} className="dict">
                  {(config.buildType === "desktop" || config.buildType === "proxy") && user.id !== undefined && (
                    <Checkbox
                      defaultChecked={selected.includes(dictionary.id)}
                      onChange={() => {
                        const newSelected = selected.slice();
                        const idx = newSelected.indexOf(dictionary.id);
                        if (idx === -1) {
                          newSelected.push(dictionary.id);
                        } else {
                          newSelected.splice(idx, 1);
                        }
                        setSelected(newSelected);
                      }}
                    />
                  )}
                  {isDownloaded && <Icon name="download" />}
                  <span className="dict-name">
                    {dictionary.translations && chooseTranslation(dictionary.translations)}{" "}
                    {config.buildType === "server" &&
                      user.id !== undefined &&
                      dictionary.english_status === "Published" && <Icon name="globe" />}
                  </span>
                  {authors && authors.length !== 0 && <span className="dict-authors">({authors.join(", ")})</span>}
                  {perspectives && perspectives.length !== 0 && (
                    <Dropdown inline text={`${getTranslation("View")} (${perspectives.length})`}>
                      <Dropdown.Menu>
                        {perspectives.map(perspective => {
                          const permissions = proxyData ? proxyData.permission_lists : undefined;
                          return (
                            <Dropdown.Item
                              key={compositeIdToString(perspective.id)}
                              as={Link}
                              to={`/dictionary/${dictionary.id.join("/")}/perspective/${perspective.id.join("/")}`}
                            >
                              {(config.buildType === "desktop" || config.buildType === "proxy") && (
                                <span>
                                  {permissions.view.find(
                                    p => compositeIdToString(p.id) !== compositeIdToString(perspective.id)
                                  ) !== undefined && <Icon name="book" />}
                                  {permissions.edit.find(
                                    p => compositeIdToString(p.id) !== compositeIdToString(perspective.id)
                                  ) !== undefined && <Icon name="edit" />}
                                  {permissions.publish.find(
                                    p => compositeIdToString(p.id) !== compositeIdToString(perspective.id)
                                  ) !== undefined && <Icon name="external share" />}
                                  {permissions.limited.find(
                                    p => compositeIdToString(p.id) !== compositeIdToString(perspective.id)
                                  ) !== undefined && <Icon name="privacy" />}
                                </span>
                              )}
                              {perspective.translations && chooseTranslation(perspective.translations)}
                            </Dropdown.Item>
                          );
                        })}
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      );
    }
    case "Grant":
      return (
        <div id={generateId(entity)} className="grant">
          <Header>{`${chooseTranslation(entity.translations)} (${chooseTranslation(entity.issuer_translations)} ${
            entity.grant_number
          })`}</Header>
          {children.map((child, index) => (
            <Node
              key={index}
              nodeInfo={child}
              root
              selected={selected}
              setSelected={setSelected}
              proxyData={proxyData}
            />
          ))}
        </div>
      );
    case "Organization":
      return (
        <div id={generateId(entity)} className="grant">
          <Header>{chooseTranslation(entity.translations)}</Header>
          {children.map((child, index) => (
            <Node
              key={index}
              nodeInfo={child}
              root
              selected={selected}
              setSelected={setSelected}
              proxyData={proxyData}
            />
          ))}
        </div>
      );
    case "Text":
      return (
        <div className="grant">
          <div className="grant-title">{getTranslation("Individual work")}</div>
          {children.map((child, index) => (
            <Node
              key={index}
              nodeInfo={child}
              root
              selected={selected}
              setSelected={setSelected}
              proxyData={proxyData}
            />
          ))}
        </div>
      );
    default:
      return null;
  }
};

Node.propTypes = {
  nodeInfo: PropTypes.object.isRequired,
  root: PropTypes.bool,
  selected: PropTypes.array.isRequired,
  setSelected: PropTypes.func.isRequired,
  proxyData: PropTypes.object
};

export default Node;
