import clsx from 'clsx';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  renderCell?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface AIDataTableProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: Record<string, unknown>, index: number) => string);
  cellClassName?: string;
}

export const AIDataTable = ({
  columns,
  data,
  className,
  headerClassName,
  rowClassName,
  cellClassName,
}: AIDataTableProps) => {
  return (
    <div className={clsx('w-full overflow-hidden rounded-lg border border-gray-200', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className={clsx('bg-gray-50', headerClassName)}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={clsx(
                  'px-4 py-3 text-[13px] font-medium leading-[1.3] text-gray-600 border-b border-gray-200',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.align === 'left' && 'text-left',
                  !column.align && 'text-left',
                  column.className
                )}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const rowClasses =
              typeof rowClassName === 'function'
                ? rowClassName(row, rowIndex)
                : rowClassName;
            return (
              <tr
                key={rowIndex}
                className={clsx(
                  'bg-white border-b border-gray-200 last:border-b-0',
                  rowClasses
                )}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  const cellContent = column.renderCell
                    ? column.renderCell(value, row)
                    : String(value ?? '');
                  return (
                    <td
                      key={column.key}
                      className={clsx(
                        'px-4 py-3 text-[13px] leading-[1.3] text-gray-800',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.align === 'left' && 'text-left',
                        !column.align && 'text-left',
                        column.className,
                        cellClassName
                      )}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
