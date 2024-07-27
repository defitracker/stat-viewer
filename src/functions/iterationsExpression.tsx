import { useCallback, useEffect, useMemo, useState } from "react";
import { useMyStore } from "../store";
import Table, { TableColumnData } from "../components/Table";
import { eventEntryToTableRow } from "./events";
import { useDebounce } from "use-debounce";
import { useShallow } from "zustand/react/shallow";
import React from "react";
import { iterationEntryToTableRow } from "./iterations";
import BigNumber from "bignumber.js";

export function iterationsExpression(csi: number) {
  return <IterationsExpression csi={csi} />;
}

function IterationsExpression({ csi }: { csi: number }) {
  const [input, setInput] = useState("");
  const [debouncedInput] = useDebounce(input, 500);

  const fileData = useMyStore.getState().fileData!;
  const events = Object.values(fileData.eventEntries);
  const iterations = Object.values(fileData.iterationEntries);

  const iterationsWithEvent = iterations.map((i) => {
    const e = fileData.eventEntries[i.parentId];
    return {
      ...i,
      e,
    };
  });

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
      const filter = new Function("i", `return ${input}`);
      const filtered = iterationsWithEvent.filter((e) => filter(e));
      return { filtered, errorRes: null };
    } catch (e) {
      return { filtered: [], errorRes: e };
    }
  }, [debouncedInput]);

  const tableElement = useMemo(() => {
    const columns: TableColumnData[] = [
      { name: "Time", sorter: (a: number, b: number) => a - b },
      { name: "Token", sorter: (a: string, b: string) => a.localeCompare(b) },
      {
        name: "Profit",
        sorter: (a: BigNumber, b: BigNumber) => a.comparedTo(b),
      },
    ];

    const rows = filtered.map((ie) => ({
      cells: iterationEntryToTableRow(ie, fileData.eventEntries),
      onClick: () => {
        useMyStore
          .getState()
          .pushToCallStack("iteration", [ie.iterationEntryId]);
      },
    }));

    return (
      <Table
        tableName="Iterations"
        tableInfo=""
        defaultSortCell={0}
        csi={csi}
        columns={columns}
        rows={rows}
      />
    );
  }, [filtered]);

  const eventKeysMap = useMemo(() => {
    return events.reduce(
      (acc, cur) => ({
        ...acc,
        ...Object.fromEntries(Object.keys(cur).map((k) => [k, 0])),
      }),
      {}
    );
  }, []);
  const iterationKeysMap = useMemo(() => {
    return iterationsWithEvent.reduce(
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
            onClick={() => setDataCached(`i.tokenName == "XCADportal"`)}
          >
            <span>Show iterations for given token</span>
          </button>
          <button
            className="mt-1 bg-white flex items-center text-gray-700 dark:text-gray-300 justify-center gap-x-3 text-sm rounded-lg hover:bg-gray-100 duration-300 transition-colors border py-2 px-4"
            onClick={() => setDataCached(`i.estimatedBestTv > 0`)}
          >
            <span>
              Show iterations with calculated best tracking value {">"} 0
            </span>
          </button>
          <button
            className="mt-1 bg-white flex items-center text-gray-700 dark:text-gray-300 justify-center gap-x-3 text-sm rounded-lg hover:bg-gray-100 duration-300 transition-colors border py-2 px-4"
            onClick={() => setDataCached(`i.networkA != i.greenNetwork`)}
          >
            <span>
              Show iterations where depeg was created on destination chain
            </span>
          </button>
          <button
            className="mt-1 bg-white flex items-center text-gray-700 dark:text-gray-300 justify-center gap-x-3 text-sm rounded-lg hover:bg-gray-100 duration-300 transition-colors border py-2 px-4"
            onClick={() => setDataCached(`i.e.eventVolumeUsd >= 200`)}
          >
            <span>Show iterations with usd event volume of $200 or more</span>
          </button>
          <button
            className="mt-1 bg-white flex items-center text-gray-700 dark:text-gray-300 justify-center gap-x-3 text-sm rounded-lg hover:bg-gray-100 duration-300 transition-colors border py-2 px-4"
            onClick={() =>
              setDataCached(
                `((i.timeForFirstGreenNetworkRes || 0) + (i.timeForOtherTVs || 0) + (i.timeForBestTvRes || 0)) > 1000`
              )
            }
          >
            <span>Show iterations with total time of 1000ms or more</span>
          </button>
        </div>
      )}

      {
        <>
          <p className="mt-2 text-sm text-gray-700">
            The following keys are available:
          </p>
          <div className="">
            {Object.keys(iterationKeysMap).map((k) => {
              return (
                <React.Fragment key={k}>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                    i.{k}
                  </span>
                  <span> </span>
                </React.Fragment>
              );
            })}
          </div>
          <div className="">
            {Object.keys(eventKeysMap).map((k) => {
              return (
                <React.Fragment key={k}>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                    i.e.{k}
                  </span>
                  <span> </span>
                </React.Fragment>
              );
            })}
          </div>
        </>
      }
    </>
  );
}
