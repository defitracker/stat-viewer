import { useCallback, useEffect, useState } from "react";
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
  tableName: string;
  tableInfo?: string;
  columns: TableColumnData[];
  rows: {
    cells: TableCellData[];
    onClick?: () => void;
  }[];
};

const PAGE_SIZE = 10;

export default function Table(tableData: TableData) {
  const [page, setPage] = useState(1);

  // Use callStackCache
  const { setCallStackCache } = useMyStore(
    useShallow((state) => ({
      setCallStackCache: state.setCallStackCache,
    }))
  );
  // Set initial cache & load cache
  useEffect(() => {
    if (tableData.csi !== undefined) {
      const cacheData = useMyStore.getState().callStackCache[tableData.csi];
      if (cacheData === undefined) {
        setCallStackCache(tableData.csi, { page: 1 });
      } else {
        const { page } = cacheData;
        setPage(page);
      }
    }
  }, []);

  const setPageCached = useCallback((page: number) => {
    setPage(page);
    if (tableData.csi !== undefined) {
      setCallStackCache(tableData.csi, { page });
    }
  }, []);

  const numPages = Math.ceil(tableData.rows.length / PAGE_SIZE);
  const pagedData = tableData.rows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

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
        <span className="text-sm">({tableData.rows.length})</span>
      </h2>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
        {tableData.tableInfo ?? ""}
      </p>

      <div className="flex flex-col mt-6">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {tableData.columns.map((c) => {
                      return (
                        <th
                          key={c.name}
                          scope="col"
                          className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                        >
                          {c.name}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
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

      <div className="flex items-center justify-between mt-6">
        <span
          className={`flex items-center px-5 py-2 text-sm ${
            page !== 1
              ? "text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              : "text-gray-400"
          } capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700`}
          onClick={() => {
            if (page > 1) {
              setPageCached(page - 1);
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
                    setPageCached(p as number);
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
              setPageCached(page + 1);
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
    </section>
  );
}
