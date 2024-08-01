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
import {
  EventEntries,
  EventEntry,
  IterationEntry,
  IterationEntryExt,
} from "@/helpers/types";

import { AgGridReact } from "ag-grid-react";

import { useMemo, useState } from "react";
import { ColDef } from "ag-grid-community";
import FullHeight from "@/components/FullHeight";
import { ScrollArea } from "@/components/ui/scroll-area";

export function iterations(csi: number) {
  return <TableWrapper csi={csi} />;
}

export const ITERATIONS_KEY_ORDER_PRIORITY = [
  "iterationEntryId",
  "parentId",
  "timestamp",
  "tokenName",
  "networkA",
  "networkB",
  "greenNetwork",
  "estimatedBestTv",
];

function TableWrapper({ csi }: { csi: number }) {
  const fileData = useMyStore.getState().fileData!;

  const cacheData = useMyStore.getState().callStackCache[csi];
  const tableState = cacheData?.tableState ?? undefined;
  console.log("Loaded table state", tableState);

  const iterationEntriesExt = Object.fromEntries(
    Object.entries(fileData.iterationEntries).map(([id, ie]) => {
      return [id, ieToIeExt(ie, useMyStore.getState().fileData!.eventEntries)];
    })
  );

  const availableKeysMap = useMemo(() => {
    const keys = Object.values(iterationEntriesExt).reduce(
      (acc, cur) => ({
        ...acc,
        ...Object.fromEntries(Object.keys(cur).map((k) => [k, 0])),
      }),
      {}
    );
    const keysSorted = Object.keys(keys).sort((a, b) => {
      const aIdx = ITERATIONS_KEY_ORDER_PRIORITY.indexOf(a);
      const bIdx = ITERATIONS_KEY_ORDER_PRIORITY.indexOf(b);
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
    const rowData = Object.values(iterationEntriesExt);

    return (
      <AgGridReact
        initialState={
          tableState
            ? tableState
            : {
                columnVisibility: {
                  hiddenColIds: ["parentId"],
                },
                sort: {
                  sortModel: [{ colId: "timestamp", sort: "desc" }],
                },
              }
        }
        onStateUpdated={(e) => {
          useMyStore.getState().setCallStackCache(csi, {
            ...useMyStore.getState().callStackCache[csi],
            tableState: e.state,
          });
        }}
        rowData={rowData as unknown as IterationEntryExt[]}
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
          Iterations
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
  [key: string]: ColDef<IterationEntryExt>;
} = {
  iterationEntryId: {
    field: "iterationEntryId",
    pinned: true,
    cellClass: "cursor-pointer",
    onCellClicked: (e) => {
      if (e.data) {
        useMyStore
          .getState()
          .pushToCallStack("iteration", [e.data.iterationEntryId]);
      }
    },
  },
  parentId: {
    field: "parentId",
    hide: true,
  },
  timestamp: {
    field: "timestamp",
    valueFormatter: (e) => new Date(e.data?.timestamp ?? 0).toUTCString(),
    filter: false,
    headerName: "Time of event",
  },
  timeForFirstGreenNetworkRes: {
    field: "timeForFirstGreenNetworkRes",
    filter: "agNumberColumnFilter",
  },
  timeForOtherTVs: {
    field: "timeForOtherTVs",
    filter: "agNumberColumnFilter",
  },
  timeForBestTvRes: {
    field: "timeForBestTvRes",
    filter: "agNumberColumnFilter",
  },
  estimatedBestTv: {
    field: "estimatedBestTv",
    filter: "agNumberColumnFilter",
  },
};

function getColDefs(keys: string[], visibleKeys: { [k: string]: boolean }) {
  const colDefs: ColDef<IterationEntryExt>[] = [];

  for (const key of keys) {
    if (!visibleKeys[key]) continue;
    if (key in CUSTOM_COLDEFS) {
      colDefs.push(CUSTOM_COLDEFS[key]);
    } else {
      colDefs.push({ field: key as keyof IterationEntry });
    }
  }

  return colDefs;
}

export function ieToIeExt(ie: IterationEntry, ees: EventEntries) {
  const ext: IterationEntryExt = {
    ...ie,
    timestamp: ees[ie.parentId].timestamp,
  };
  return ext;
}
