import { useCallback, useEffect, useMemo, useState } from "react";
import { useMyStore } from "../store";
import { useShallow } from "zustand/react/shallow";

export type TableCellData = {
  element: JSX.Element;
  sortableValue?: any;
};

export type TableColumnData = {
  name: string;
  sorter?: (a: any, b: any) => number;
};

export type TableData = {
  csi?: number;
  tableName?: string;
  tableInfo?: string;
  defaultSortCell?: number;
  columns: TableColumnData[];
  rows: {
    cells: TableCellData[];
    onClick?: () => void;
  }[];
};

const svgSortDown = (
  <svg
    className="w-4 h-4 fill-gray-700"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512"
  >
    <path d="M151.6 469.6C145.5 476.2 137 480 128 480s-17.5-3.8-23.6-10.4l-88-96c-11.9-13-11.1-33.3 2-45.2s33.3-11.1 45.2 2L96 365.7 96 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 301.7 32.4-35.4c11.9-13 32.2-13.9 45.2-2s13.9 32.2 2 45.2l-88 96zM320 32l32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 128l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 128l160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 128l224 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-224 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
  </svg>
);
const svgSortUp = (
  <svg
    className="w-4 h-4 fill-gray-700"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512"
  >
    <path d="M151.6 42.4C145.5 35.8 137 32 128 32s-17.5 3.8-23.6 10.4l-88 96c-11.9 13-11.1 33.3 2 45.2s33.3 11.1 45.2-2L96 146.3 96 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-301.7 32.4 35.4c11.9 13 32.2 13.9 45.2 2s13.9-32.2 2-45.2l-88-96zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0zm0 128c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0zm0 128c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0zm0 128c-17.7 0-32 14.3-32 32s14.3 32 32 32l224 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-224 0z" />
  </svg>
);

const PAGE_SIZE = 10;

export default function Table(tableData: TableData) {
  const [page, setPage] = useState(1);
  const [cellToSort, setCellToSort] = useState(
    tableData.defaultSortCell !== undefined ? tableData.defaultSortCell : -1
  );
  const [sortAB, setSortAB] = useState(true);

  // Use callStackCache
  const { callStackCache, setCallStackCache } = useMyStore(
    useShallow((state) => ({
      callStackCache: state.callStackCache,
      setCallStackCache: state.setCallStackCache,
    }))
  );
  // Set initial cache & load cache
  useEffect(() => {
    if (tableData.csi !== undefined) {
      const cacheData = useMyStore.getState().callStackCache[tableData.csi];
      if (cacheData === undefined || cacheData.table === undefined) {
        setCallStackCache(tableData.csi, {
          ...useMyStore.getState().callStackCache[tableData.csi],
          table: {
            page: 1,
            cellToSort:
              tableData.defaultSortCell !== undefined
                ? tableData.defaultSortCell
                : -1,
            sortAB: true,
          },
        });
      } else {
        const { page, cellToSort, sortAB } = cacheData.table;
        setPage(page);
        setCellToSort(cellToSort);
        setSortAB(sortAB);
      }
    }
  }, []);
  useEffect(() => {
    if (tableData.csi !== undefined) {
      const cacheData = callStackCache[tableData.csi];
      if (cacheData && cacheData.table) {
        if (cacheData.table.page !== page) {
          // console.log(`updating page to ${cacheData.table.page} from ${page}`);
          setPage(cacheData.table.page);
        }
      }
    }
  }, [callStackCache, page]);

  const setDataCached = useCallback(
    (page: number, cellToSort: number, sortAB: boolean) => {
      setPage(page);
      setCellToSort(cellToSort);
      setSortAB(sortAB);
      if (tableData.csi !== undefined) {
        setCallStackCache(tableData.csi, {
          ...useMyStore.getState().callStackCache[tableData.csi],
          table: {
            page,
            cellToSort,
            sortAB,
          },
        });
      }
    },
    []
  );

  const sortableCells = tableData.columns.map((c) => c.sorter !== undefined);

  const rowsSorted = useMemo(() => {
    if (cellToSort < 0) return tableData.rows;
    if (!sortableCells[cellToSort]) return tableData.rows;
    return [...tableData.rows].sort((a, b) => {
      const _b = b.cells[cellToSort].sortableValue;
      const _a = a.cells[cellToSort].sortableValue;
      const [__a, __b] = sortAB ? [_a, _b] : [_b, _a];
      return tableData.columns[cellToSort].sorter!(__a, __b);
    });
  }, [cellToSort, sortAB, tableData]);

  const numPages = Math.ceil(tableData.rows.length / PAGE_SIZE);
  const pagedData = rowsSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (rowsSorted.length > 0 && page > numPages) {
    setDataCached(1, cellToSort, sortAB);
  }

  let pagesInPaginator: (string | number)[] = [1, 2, 3, 4, 5, 6].slice(
    0,
    numPages
  );
  if (numPages > 6) {
    if (page === 1) pagesInPaginator = [1, 2, 3, "...", numPages];
    if (page === 2) pagesInPaginator = [1, 2, 3, "...", numPages];
    if (page === 3) pagesInPaginator = [1, 2, 3, 4, "...", numPages];
    if (page >= 4 && page <= numPages - 3)
      pagesInPaginator = [1, "...", page - 1, page, page + 1, "...", numPages];
    if (page === numPages - 3)
      pagesInPaginator = [
        1,
        "...",
        page - 1,
        page,
        page + 1,
        page + 2,
        numPages,
      ];
    if (page === numPages - 2)
      pagesInPaginator = [
        1,
        "...",
        numPages - 3,
        numPages - 2,
        numPages - 1,
        numPages,
      ];
    if (page === numPages - 1)
      pagesInPaginator = [1, "...", numPages - 2, numPages - 1, numPages];
    if (page === numPages)
      pagesInPaginator = [1, "...", numPages - 2, numPages - 1, numPages];
  }

  return (
    <section className="container px-4 mx-auto">
      <h2 className="text-lg font-medium text-gray-800 dark:text-white">
        {tableData.tableName}{" "}
        {tableData.tableName && (
          <span className="text-sm">({tableData.rows.length})</span>
        )}
      </h2>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
        {tableData.tableInfo ?? ""}
      </p>

      <div className="flex flex-col mt-4">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {tableData.columns.map((c, idx) => {
                      return (
                        <th
                          key={c.name}
                          scope="col"
                          className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                        >
                          <button
                            className={`flex items-center gap-x-3 focus:outline-none ${
                              sortableCells[idx]
                                ? "cursor-pointer"
                                : "cursor-default"
                            }`}
                            onClick={() => {
                              if (sortableCells[idx]) {
                                if (cellToSort === idx) {
                                  console.log("1");
                                  setDataCached(page, cellToSort, !sortAB);
                                } else {
                                  setDataCached(page, idx, sortAB);
                                }
                              }
                            }}
                          >
                            <span>{c.name}</span>
                            {cellToSort === idx &&
                              (sortAB ? svgSortDown : svgSortUp)}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                  {pagedData.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-4 text-center"
                        colSpan={tableData.columns.length}
                      >
                        Nothing to display 🥺
                      </td>
                    </tr>
                  )}
                  {pagedData.map((row, idx) => {
                    return (
                      <tr
                        key={idx}
                        className={`${
                          row.onClick ? "hover:bg-gray-100 cursor-pointer" : ""
                        }`}
                        onClick={() => {
                          row.onClick && row.onClick();
                        }}
                      >
                        {row.cells.map((cellData, idx) => {
                          return (
                            <td
                              key={idx}
                              className="px-4 py-4 text-sm whitespace-nowrap"
                            >
                              {cellData.element}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {numPages > 0 && (
        <div className="flex items-center justify-between mt-6">
          <span
            className={`flex items-center px-5 py-2 text-sm ${
              page !== 1
                ? "text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                : "text-gray-400"
            } capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700`}
            onClick={() => {
              if (page > 1) {
                setDataCached(page - 1, cellToSort, sortAB);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 rtl:-scale-x-100"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
              />
            </svg>

            <span>previous</span>
          </span>

          <div className="items-center hidden md:flex gap-x-3">
            {pagesInPaginator.map((p, idx) => {
              return (
                <span
                  key={idx}
                  className={`px-2 py-1 text-sm rounded-md text-gray-500 dark:bg-gray-800 ${
                    p === page
                      ? "text-blue-500 bg-blue-100/60 cursor-pointer"
                      : Number.isInteger(p)
                      ? "hover:bg-gray-100 cursor-pointer"
                      : ""
                  }`}
                  onClick={() => {
                    if (Number.isInteger(p)) {
                      setDataCached(p as number, cellToSort, sortAB);
                    }
                  }}
                >
                  {p}
                </span>
              );
            })}
          </div>

          <span
            className={`flex items-center px-5 py-2 text-sm ${
              page !== numPages
                ? "text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                : "text-gray-400"
            } capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700`}
            onClick={() => {
              if (page < numPages) {
                setDataCached(page + 1, cellToSort, sortAB);
              }
            }}
          >
            <span>Next</span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 rtl:-scale-x-100"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </span>
        </div>
      )}
    </section>
  );
}
