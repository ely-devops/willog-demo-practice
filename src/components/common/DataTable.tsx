import type { ReactNode } from 'react';
import { useLanguageStore } from '@/stores/useLanguageStore';

// ========== 타입 정의 ==========

export interface TableColumn<T> {
  /** 컬럼 ID (데이터 객체의 키 또는 커스텀 ID) */
  id: keyof T | string;
  /** 컬럼 라벨 */
  label: string;
  /** 컬럼 너비 (px 또는 'flex-1'로 가변 너비) */
  width: number | 'flex-1';
  /** 컬럼 헤더 아이콘 (선택) */
  icon?: ReactNode;
  /** 커스텀 셀 렌더러 (선택) - 미지정시 row[id]를 텍스트로 표시 */
  render?: (row: T, index: number) => ReactNode;
  /** 필수 필드 표시 (*) */
  required?: boolean;
}

export interface DataTableProps<T> {
  /** 컬럼 정의 배열 */
  columns: TableColumn<T>[];
  /** 데이터 배열 */
  data: T[];
  /** 각 행의 고유 키로 사용할 필드 */
  rowKey: keyof T;
  /** 행 선택 기능 활성화 */
  selectable?: boolean;
  /** 선택된 행의 ID Set */
  selectedIds?: Set<string>;
  /** 선택 변경 핸들러 */
  onSelectChange?: (ids: Set<string>) => void;
  /** 빈 데이터일 때 표시할 메시지 */
  emptyMessage?: string;
}

// ========== DataTable 컴포넌트 ==========

/**
 * 재사용 가능한 데이터 테이블 컴포넌트
 *
 * RegisterPage 스타일 기반 (div + flex 방식)
 *
 * 특징:
 * - 제네릭 타입 지원으로 타입 안전성 보장
 * - 커스텀 셀 렌더러로 유연한 콘텐츠 표시
 * - 행 선택 기능 (체크박스)
 * - 줄무늬 배경 (홀수: bg-gray-50, 짝수: bg-white)
 */
export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedIds = new Set(),
  onSelectChange,
  emptyMessage = '데이터가 없습니다.',
}: DataTableProps<T>) {
  const { language } = useLanguageStore();

  // 전체 선택 여부
  const allSelected = data.length > 0 && data.every(row =>
    selectedIds.has(String(row[rowKey]))
  );

  // 전체 선택/해제 핸들러
  const handleSelectAll = () => {
    if (!onSelectChange) return;

    if (allSelected) {
      onSelectChange(new Set());
    } else {
      const newIds = new Set(data.map(row => String(row[rowKey])));
      onSelectChange(newIds);
    }
  };

  // 개별 행 선택 핸들러
  const handleRowSelect = (id: string) => {
    if (!onSelectChange) return;

    const newIds = new Set(selectedIds);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    onSelectChange(newIds);
  };

  // 셀 값 가져오기
  const getCellValue = (row: T, column: TableColumn<T>, index: number): ReactNode => {
    if (column.render) {
      return column.render(row, index);
    }
    const value = row[column.id as keyof T];
    return value !== undefined && value !== null ? String(value) : '';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* 테이블 헤더 */}
        <div className="flex bg-white">
          {/* 체크박스 컬럼 (selectable 활성화 시) */}
          {selectable && (
            <div
              className="flex items-center justify-center px-3 h-11 border-r border-gray-300"
              style={{ width: 80 }}
            >
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="w-5 h-5 border border-gray-400 bg-white cursor-pointer appearance-none focus:outline-none checked:bg-primary checked:border-primary checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22white%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M16.707%205.293a1%201%200%20010%201.414l-8%208a1%201%200%2001-1.414%200l-4-4a1%201%200%20011.414-1.414L8%2012.586l7.293-7.293a1%201%200%20011.414%200z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] checked:bg-center checked:bg-no-repeat"
              />
            </div>
          )}

          {/* 데이터 컬럼 헤더 */}
          {columns.map((column, colIndex) => (
            <div
              key={String(column.id)}
              className={`flex items-center px-3 h-11 ${
                colIndex < columns.length - 1 ? 'border-r border-gray-300' : ''
              } ${column.width === 'flex-1' ? 'flex-1 min-w-0' : ''}`}
              style={column.width !== 'flex-1' ? { width: column.width } : undefined}
            >
              <div className="flex items-center gap-1">
                {column.icon && (
                  <span className="text-gray-500 shrink-0">
                    {column.icon}
                  </span>
                )}
                <span className={`text-label-m text-gray-600 whitespace-nowrap ${language === 'en' ? 'font-mono' : ''}`}>
                  {column.label}
                </span>
                {column.required && (
                  <span className="text-primary text-label-m">*</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 테이블 바디 */}
        <div className="flex flex-col">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-gray-500">
              {emptyMessage}
            </div>
          ) : (
            data.map((row, rowIndex) => {
              const rowId = String(row[rowKey]);
              const isSelected = selectedIds.has(rowId);

              return (
                <div
                  key={rowId}
                  className={`flex h-12 ${rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                >
                  {/* 체크박스 셀 */}
                  {selectable && (
                    <div
                      className="flex items-center justify-center px-3 border-r border-gray-300"
                      style={{ width: 80 }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelect(rowId)}
                        className="w-5 h-5 border border-gray-400 bg-white cursor-pointer appearance-none focus:outline-none checked:bg-primary checked:border-primary checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22white%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M16.707%205.293a1%201%200%20010%201.414l-8%208a1%201%200%2001-1.414%200l-4-4a1%201%200%20011.414-1.414L8%2012.586l7.293-7.293a1%201%200%20011.414%200z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] checked:bg-center checked:bg-no-repeat"
                      />
                    </div>
                  )}

                  {/* 데이터 셀 */}
                  {columns.map((column, colIndex) => (
                    <div
                      key={`${rowId}-${String(column.id)}`}
                      className={`flex items-center px-3 ${
                        colIndex < columns.length - 1 ? 'border-r border-gray-300' : ''
                      } ${column.width === 'flex-1' ? 'flex-1 min-w-0' : ''} ${language === 'en' ? 'font-mono' : ''}`}
                      style={column.width !== 'flex-1' ? { width: column.width } : undefined}
                    >
                      {getCellValue(row, column, rowIndex)}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default DataTable;
