import React from "react";
import { Checkbox, Table } from "semantic-ui-react";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { onlyUpdateForKeys } from "recompose";

import { chooseTranslation as T } from "api/i18n";
import { compositeIdToString as id2str } from "utils/compositeId";

import "styles/main.scss";

const Column = ({
  field,
  fields,
  checkEntries,
  selectedColumns,
  onCheckColumn,
  sortByField,
  onSortModeChange,
  onSortModeReset
}) => {
  const be_sorted = field.english_translation === "Order" ? false : true;

  const subFields = fields.filter(f => isEqual(f.self_id, field.column_id));

  const sort_flag = field && sortByField && id2str(field.id) == id2str(sortByField.field);

  const sort_f = () =>
    !be_sorted
      ? onSortModeReset()
    : !sort_flag
      ? onSortModeChange(field.id, "a")
    : sortByField.order == "a"
      ? onSortModeChange(field.id, "d")
      : onSortModeReset();

  return (
    <Table.HeaderCell className="entityHeader" onClick={() => onSortModeChange && sort_f()}>
      <div className={checkEntries ? "lingvo-entries-headercell" : ""}>
        {checkEntries && (
          <Checkbox
            className="lingvo-checkbox lingvo-entries-headercell__checkbox"
            checked={!!selectedColumns.find(e => isEqual(e, field.id))}
            onChange={(e, { checked }) => {
              e.stopPropagation();
              onCheckColumn(field, checked);
            }}
          />
        )}

        <ul>
          <li className="last">
            {onSortModeChange ? (
              <label onClick={e => (e.stopPropagation(), sort_f())}>{T(field.translations)}</label>
            ) : (
              <label>{T(field.translations)}</label>
            )}
            {onSortModeChange && be_sorted &&
              (sort_flag ? (
                <span className="lingvo-perspective-sort">
                  {sortByField.order == "a" ? (
                    <i className="lingvo-icon lingvo-icon_sort_up lingvo-icon_sort_up_active" 
                      onClick={e => (e.stopPropagation(), onSortModeReset())}
                    />
                  ) : (
                    <i className="lingvo-icon lingvo-icon_sort_up" 
                      onClick={e => (e.stopPropagation(), onSortModeChange(field.id, "a"))}
                    />
                  )}
                  {sortByField.order == "d" ? (
                    <i className="lingvo-icon lingvo-icon_sort_down lingvo-icon_sort_down_active" 
                      onClick={e => (e.stopPropagation(), onSortModeReset())}
                    />
                  ) : (
                    <i className="lingvo-icon lingvo-icon_sort_down" 
                      onClick={e => (e.stopPropagation(), onSortModeChange(field.id, "d"))}
                    />
                  )}
                </span>
              ) : (
                <span className="lingvo-perspective-sort">
                  <i className="lingvo-icon lingvo-icon_sort_up" 
                    onClick={e => (e.stopPropagation(), onSortModeChange(field.id, "a"))} 
                  />
                  <i className="lingvo-icon lingvo-icon_sort_down" 
                    onClick={e => (e.stopPropagation(), onSortModeChange(field.id, "d"))}
                  />
                </span>
            ))}

            <ul>
              {subFields.map((subField, index) => {
                const cls = index + 1 === subFields.length ? { className: "last" } : {};

                return (
                  <li key={id2str(subField.column_id)} {...cls}>
                    {T(subField.translations)}
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </div>
    </Table.HeaderCell>
  );
};

Column.propTypes = {
  field: PropTypes.shape({
    translations: PropTypes.object.isRequired
  }).isRequired,
  fields: PropTypes.array.isRequired,
  checkEntries: PropTypes.bool,
  selectedColumns: PropTypes.array,
  onCheckColumn: PropTypes.func,
  onSortModeChange: PropTypes.func
};

Column.defaultProps = {
  onSortModeChange: null,
  checkEntries: false,
  selectedColumns: [],
  onCheckColumn: () => {}
};

export default onlyUpdateForKeys(["field", "selectedColumns"])(Column);
