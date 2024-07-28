import { useCallback, useEffect, useMemo, useState } from "react";
import { useMyStore } from "../store";
import Table, { TableColumnData } from "../components/Table";
import { eventEntryTableColumns, eventEntryToTableRow } from "./events";
import { useDebounce } from "use-debounce";
import { useShallow } from "zustand/react/shallow";
import React from "react";

export function eventsExpression(csi: number) {
  return <EventsExpression csi={csi} />;
}

function EventsExpression({ csi }: { csi: number }) {
  const [input, setInput] = useState("");
  const [debouncedInput] = useDebounce(input, 500);

  const fileData = useMyStore.getState().fileData!;
  const events = Object.values(fileData.eventEntries);

  // Use callStackCache
  const { setCallStackCache } = useMyStore(
    useShallow((state) => ({
      setCallStackCache: state.setCallStackCache,
    }))
  );
  // Set initial cache & load cache
  useEffect(() => {
    if (csi !== undefined) {
      const cacheData = useMyStore.getState().callStackCache[csi];
      if (cacheData === undefined) {
        setCallStackCache(csi, {
          ...useMyStore.getState().callStackCache[csi],
          input: "",
        });
      } else {
        const { input } = cacheData;
        setInput(input);
      }
    }
  }, []);

  const setDataCached = useCallback((input: string) => {
    setInput(input);
    if (csi !== undefined) {
      setCallStackCache(csi, {
        ...useMyStore.getState().callStackCache[csi],
        input: input,
      });
    }
  }, []);

  const { filtered, errorRes } = useMemo(() => {
    try {
      const filter = new Function("e", `return ${input}`);
      const filtered = events.filter((e) => filter(e));
      return { filtered, errorRes: null };
    } catch (e) {
      return { filtered: [], errorRes: e };
    }
  }, [debouncedInput]);

  const tableElement = useMemo(() => {
    const columns = eventEntryTableColumns()

    const rows = filtered.map((ee) => ({
      cells: eventEntryToTableRow(ee),
      onClick: () => {
        useMyStore.getState().pushToCallStack("event", [ee.eventEntryId]);
      },
    }));

    return (
      <Table
        tableName="Events"
        tableInfo=""
        defaultSortCell={1}
        csi={csi}
        columns={columns}
        rows={rows}
      />
    );
  }, [filtered]);

  const keysMap = useMemo(() => {
    return events.reduce(
      (acc, cur) => ({
        ...acc,
        ...Object.fromEntries(Object.keys(cur).map((k) => [k, 0])),
      }),
      {}
    );
  }, []);

  return (
    <>
      <div className="relative">
        <input
          value={input}
          onChange={(e) => setDataCached(e.target.value)}
          type="text"
          placeholder="Enter expression..."
          className="w-full rounded-md border-gray-200 py-2.5 ps-4 pe-10 shadow-sm sm:text-sm"
        />

        <span className="absolute inset-y-0 end-0 grid w-10 place-content-center">
          <button type="button" className="text-gray-600 hover:text-gray-700">
            <span className="sr-only">Search</span>

            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg> */}
          </button>
        </span>
      </div>

      {errorRes && (
        <div>
          <div>{(errorRes as Error).message}</div>
        </div>
      )}

      {input.length > 0 && <div className="mt-2">{tableElement}</div>}

      {input.length === 0 && (
        <div className="mt-4">
          <p className="pb-1 text-gray-700 text-sm">Or start with this:</p>
          <button
            className="mt-1 bg-white flex items-center text-gray-700 dark:text-gray-300 justify-center gap-x-3 text-sm rounded-lg hover:bg-gray-100 duration-300 transition-colors border py-2 px-4"
            onClick={() =>
              setDataCached(
                `e.txHash == "0x0f804bc808ba37fdaadf50ddf4588952ba4101feda161a60c9b564052638900a"`
              )
            }
          >
            <span>Find event by tx hash</span>
          </button>
          <button
            className="mt-1 bg-white flex items-center text-gray-700 dark:text-gray-300 justify-center gap-x-3 text-sm rounded-lg hover:bg-gray-100 duration-300 transition-colors border py-2 px-4"
            onClick={() => setDataCached(`e.network == "Polygon"`)}
          >
            <span>Show events on Polygon network</span>
          </button>
          <button
            className="mt-1 bg-white flex items-center text-gray-700 dark:text-gray-300 justify-center gap-x-3 text-sm rounded-lg hover:bg-gray-100 duration-300 transition-colors border py-2 px-4"
            onClick={() =>
              setDataCached(
                `e.network == "Base" && e.block >= 17621707 && e.block <= 17621708`
              )
            }
          >
            <span>Show events happened between two blocks on Base</span>
          </button>
          <button
            className="mt-1 bg-white flex items-center text-gray-700 dark:text-gray-300 justify-center gap-x-3 text-sm rounded-lg hover:bg-gray-100 duration-300 transition-colors border py-2 px-4"
            onClick={() => setDataCached(`e.eventVolumeUsd >= 200`)}
          >
            <span>Show events with usd volume of $200 or more</span>
          </button>
        </div>
      )}

      <>
        <p className="mt-2 text-sm text-gray-700">
          The following keys are available:
        </p>
        <div className="">
          {Object.keys(keysMap).map((k) => {
            return (
              <React.Fragment key={k}>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                  e.{k}
                </span>
                <span> </span>
              </React.Fragment>
            );
          })}
        </div>
      </>
    </>
  );
}
