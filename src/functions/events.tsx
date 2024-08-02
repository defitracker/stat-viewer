import { Button } from "@/components/ui/button";
import { useMyStore } from "@/helpers/store";
import { ChevronLeft, Columns2, RotateCcw } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventEntries, EventEntry } from "@/helpers/types";

import { AgGridReact } from "ag-grid-react";

import { useMemo, useState } from "react";
import { ColDef } from "ag-grid-community";
import FullHeight from "@/components/FullHeight";
import { ScrollArea } from "@/components/ui/scroll-area";

const USDollarFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function events(csi: number) {
  return <TableWrapper csi={csi} />;
}

export const EVENTS_KEY_ORDER_PRIORITY = [
  "eventEntryId",
  "timestamp",
  "eventName",
  "network",
  "block",
  "eventVolumeUsd",
  "iterations",
  "address",
  "txHash",
  "token0",
  "token1",
];

function TableWrapper({ csi }: { csi: number }) {
  const fileData = useMyStore.getState().fileData!;

  const cacheData = useMyStore.getState().callStackCache[csi];
  const tableState = cacheData?.tableState ?? undefined;
  console.log("Loaded table state", tableState);

  const availableKeysMap = useMemo(() => {
    const keys = Object.values(fileData.eventEntries).reduce(
      (acc, cur) => ({
        ...acc,
        ...Object.fromEntries(Object.keys(cur).map((k) => [k, 0])),
      }),
      {}
    );
    const keysSorted = Object.keys(keys).sort((a, b) => {
      const aIdx = EVENTS_KEY_ORDER_PRIORITY.indexOf(a);
      const bIdx = EVENTS_KEY_ORDER_PRIORITY.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      else if (aIdx !== -1) return -1;
      else return 1;
    });
    return keysSorted;
  }, []);

  const getDefaultVisibleKeys = () => {
    // const _visibleKeys = Object.fromEntries(
    //   Object.entries(availableKeysMap).map(([key]) => [key, false])
    // );
    // _visibleKeys["eventEntryId"] = true;
    // _visibleKeys["timestamp"] = true;
    // _visibleKeys["network"] = true;
    // _visibleKeys["eventName"] = true;
    // _visibleKeys["eventVolumeUsd"] = true;
    const _visibleKeys = Object.fromEntries(
      availableKeysMap.map((key) => [key, true])
    );
    return _visibleKeys;
  };

  const [visibleKeys, setVisibleKeys] = useState<{ [k: string]: boolean }>(
    getDefaultVisibleKeys()
  );

  const memoTable = useMemo(() => {
    const colDefs = getColDefs(availableKeysMap, visibleKeys);
    const rowData = Object.values(fileData.eventEntries);

    return (
      <AgGridReact
        initialState={
          tableState
            ? tableState
            : {
                sort: {
                  sortModel: [{ colId: "timestamp", sort: "desc" }],
                },
                columnPinning: {
                  leftColIds: ["eventEntryId"],
                  rightColIds: [],
                },
              }
        }
        onStateUpdated={(e) => {
          useMyStore.getState().setCallStackCache(csi, {
            ...useMyStore.getState().callStackCache[csi],
            tableState: e.state,
          });
        }}
        rowData={rowData as unknown as EventEntry[]}
        columnDefs={colDefs}
        // defaultColDef={{ flex: 1 }}
        pagination={true}
        rowGroupPanelShow={"always"}
        // embedFullWidthRows={true}
        defaultColDef={{
          filter: true,
          enableRowGroup: true,
        }}
        // enableCharts={true}
        // enableRangeSelection={true}
        alwaysShowHorizontalScroll={true}
        paginationAutoPageSize={true}
        rowClass="cursor-pointer"
        onRowClicked={(e) => {
          if (e.data) {
            useMyStore
              .getState()
              .pushToCallStack("event", [e.data.eventEntryId]);
          }
        }}
      />
    );
  }, [visibleKeys, availableKeysMap]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            useMyStore.getState().popFromCallStack(1);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Events
        </h1>
        <div className="items-center flex gap-2 md:ml-auto">
          <Button
            disabled
            variant="outline"
            size="sm"
            onClick={() => {
              setVisibleKeys(getDefaultVisibleKeys());
            }}
          >
            <RotateCcw className="sm:hidden h-4 w-4" />
            <span className="hidden sm:block">Reset</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger disabled>
              <Button size="sm" disabled>
                <Columns2 className="sm:hidden h-4 w-4" />
                <span className="hidden sm:block">Select columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setVisibleKeys(
                    Object.fromEntries(
                      Object.entries(visibleKeys).map((k) => [k[0], true])
                    )
                  );
                }}
              >
                Enable all
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  const newKeys = Object.fromEntries(
                    Object.entries(visibleKeys).map((k) => [k[0], false])
                  );
                  newKeys["eventEntryId"] = true;
                  setVisibleKeys(newKeys);
                }}
              >
                Disable all
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[250px]">
                {availableKeysMap.map((key) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={key}
                      className="cursor-pointer"
                      checked={visibleKeys[key]}
                      onClick={(e) => {
                        e.preventDefault();
                        if (key === "eventEntryId") return;
                        setVisibleKeys({
                          ...visibleKeys,
                          [key]: !visibleKeys[key],
                        });
                      }}
                    >
                      {key}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <FullHeight className="ag-theme-quartz" minus={20}>
        {memoTable}
      </FullHeight>
    </div>
  );
}

const CUSTOM_COLDEFS: {
  [key: string]: ColDef<EventEntry>;
} = {
  eventEntryId: {
    field: "eventEntryId",
    cellClass: "cursor-pointer",
    onCellClicked: (e) => {
      // if (e.data) {
      //   useMyStore.getState().pushToCallStack("event", [e.data.eventEntryId]);
      // }
    },
  },
  timestamp: {
    field: "timestamp",
    valueFormatter: (e) => new Date(e.data?.timestamp ?? 0).toLocaleString(),
    filter: false,
  },
  iterations: {
    field: "iterations",
    valueGetter: (e) => e.data?.iterations.length ?? 0,
  },
  network: {
    field: "network",
    // cellRenderer: (e: any) => {
    //   return (
    //     <>
    //       {"{img}"} {e.value}
    //     </>
    //   );
    // },
  },
  block: {
    field: "block",
    filter: "agNumberColumnFilter",
  },
  eventVolumeUsd: {
    field: "eventVolumeUsd",
    filter: "agNumberColumnFilter",
    valueGetter: (e) => parseFloat(e.data?.eventVolumeUsd ?? "0"),
    valueFormatter: (e) =>
      USDollarFormat.format(parseFloat(e.data?.eventVolumeUsd ?? "0")),
  },
  address: {
    field: "address",
    filter: "agTextColumnFilter",
  },
  txHash: {
    field: "txHash",
    filter: "agTextColumnFilter",
  },
  logIndex: {
    field: "logIndex",
    filter: "agNumberColumnFilter",
  },
};

function getColDefs(keys: string[], visibleKeys: { [k: string]: boolean }) {
  const colDefs: ColDef<EventEntry>[] = [];

  for (const key of keys) {
    if (!visibleKeys[key]) continue;
    if (key in CUSTOM_COLDEFS) {
      colDefs.push(CUSTOM_COLDEFS[key]);
    } else {
      colDefs.push({ field: key as keyof EventEntry });
    }
  }

  return colDefs;
}
