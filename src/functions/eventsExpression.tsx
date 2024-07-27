import { useState } from "react";
import { useMyStore } from "../store";
import Table, { TableColumnData } from "../components/Table";
import { eventEntryToTableRow } from "./events";

export function eventsExpression(csi: number) {
  return <EventsExpression csi={csi} />;
}

function EventsExpression({ csi }: { csi: number }) {
  const [input, setInput] = useState("");
  const fileData = useMyStore.getState().fileData!;

  const events = Object.values(fileData.eventEntries);

  function looseEval(code: string) {
    return eval?.(`"use strict";(() => {${code}})()`);
  }

  const code = `
    try {
      const events = ${JSON.stringify(events)}; 
      return { success: true, data: events.filter(e => ${input}) }
    }
    catch(e) {
      return { success: false, error: e }
    }
`;

  let errorRes = null;
  let filteredEvents: typeof events = [];

  try {
    if (input.length > 0) {
      const evalRes = looseEval(code);
      if (evalRes.success) {
        filteredEvents = evalRes.data;
      } else {
        errorRes = evalRes.error;
      }
    }
  } catch (e) {
    errorRes = e;
  }

  const columns: TableColumnData[] = [
    { name: "Id" },
    { name: "Time", sorter: (a: number, b: number) => a - b },
    { name: "Network", sorter: (a: string, b: string) => a.localeCompare(b) },
  ];

  const rows = filteredEvents.map((ee) => ({
    cells: eventEntryToTableRow(ee),
    onClick: () => {
      useMyStore.getState().pushToCallStack("event", [ee.eventEntryId]);
    },
  }));

  // https://www.chris-j.co.uk/parsing.php

  return (
    <>
      <div className="relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="Enter expression..."
          className="w-full rounded-md border-gray-200 py-2.5 ps-4 pe-10 shadow-sm sm:text-sm"
        />

        <span className="absolute inset-y-0 end-0 grid w-10 place-content-center">
          <button type="button" className="text-gray-600 hover:text-gray-700">
            <span className="sr-only">Search</span>

            <svg
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
            </svg>
          </button>
        </span>
      </div>

      {errorRes && (
        <div>
          <div>{(errorRes as Error).message}</div>
        </div>
      )}

      {
        <Table
        tableName="EE"
          tableInfo=""
          defaultSortCell={1}
          csi={csi}
          columns={columns}
          rows={rows}
        />
      }
    </>
  );
}
