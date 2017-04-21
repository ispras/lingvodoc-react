import React from 'react';
import { groupBy } from 'lodash';
import { Table } from 'semantic-ui-react';

import LexicalEntry from 'components/LexicalEntry';

const Column = ({ field }) =>
  <Table.HeaderCell>
    { field.translation }
  </Table.HeaderCell>;


const TableHeader = ({ fields }) =>
  <Table.Header>
    <Table.Row>
      {
        fields.map(field =>
          <Column
            key={`${field.client_id}/${field.object_id}`}
            field={field}
          />
        )
      }
    </Table.Row>
  </Table.Header>;

const Row = ({ entry, columns, mode }) =>
  <Table.Row>
    {
      columns.map(({ key, dataType }) =>
        <LexicalEntry
          key={key}
          as={Table.Cell}
          mode={mode}
          dataType={dataType}
          entry={entry.contains[key]}
        />
      )
    }
  </Table.Row>;

const TableBody = ({ entries, columns, mode }) =>
  <Table.Body>
    {
      entries.map(entry =>
        <Row
          key={`${entry.client_id}/${entry.object_id}`}
          entry={entry}
          columns={columns}
          mode={mode}
        />
      )
    }
  </Table.Body>;

const PerspectiveView = ({ className, mode, entriesTotal, fields, entries } ) => {
  const groupedEntries = entries.map(entry => ({
    ...entry,
    contains: groupBy(entry.contains, v => `${v.field_client_id}/${v.field_object_id}`),
  }));

  const columns = fields.map(v => ({
    key: `${v.field_client_id}/${v.field_object_id}`,
    dataType: `${v.data_type_translation_gist_client_id}/${v.data_type_translation_gist_object_id}`,
  }));

  return (
    <Table celled padded className={className} >
      <TableHeader fields={fields} />

      <TableBody entries={groupedEntries} columns={columns} mode={mode} />
    </Table>
  );
};

export default PerspectiveView;
