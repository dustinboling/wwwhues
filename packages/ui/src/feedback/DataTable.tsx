import type { JSX, ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import { cx } from '../lib/cx';

export interface DataColumn {
  key: string;
  header: string;
}

export interface DataTableProps {
  columns: DataColumn[];
  rows: Array<Record<string, ReactNode> & { id: string }>;
  caption: string;
  selectedIds?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  loading?: boolean;
  className?: string;
}

/**
 * Compact admin table: overline header row, line dividers, 40px rows, paper
 * hover wash, gold selected wash. On phone the same data renders as
 * SignupCard stacks. Boards refresh in place behind the "n new" pill.
 */
export function DataTable({ columns, rows, caption, selectedIds = [], onSelect, loading = false, className }: DataTableProps): JSX.Element {
  if (loading) return <Skeleton shape="list" label={caption} count={rows.length || 5} className={className} />;
  return (
    <table className={cx('hues-data-table', className)}>
      <caption className="hues-visually-hidden">{caption}</caption>
      <thead>
        <tr>
          {onSelect !== undefined && <th scope="col"><span className="hues-visually-hidden">Select</span></th>}
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const selected = selectedIds.includes(row.id);
          return (
            <tr key={row.id} data-selected={selected || undefined} aria-selected={onSelect === undefined ? undefined : selected}>
              {onSelect !== undefined && (
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Select row ${row.id}`}
                    checked={selected}
                    onChange={(event) => onSelect(row.id, event.target.checked)}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key}>{row[column.key]}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
