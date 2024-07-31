import { Button } from "@/components/ui/button";
import { useMyStore } from "@/helpers/store";
import { ChevronLeft, Columns2, RotateCcw } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventEntries, EventEntry } from "@/helpers/types";
import { AgGridReact } from "ag-grid-react";
import { useMemo, useState } from "react";
import { ColDef } from "ag-grid-community";

export default function events(csi: number) {
  return <TableWrapper csi={csi} />;
}

function TableWrapper({ csi }: { csi: number }) {
  const fileData = useMyStore.getState().fileData!;

  const cacheData = useMyStore.getState().callStackCache[csi];
  const tableState = cacheData?.tableState ?? undefined;
  console.log("Loaded table state", tableState);

  const availableKeysMap = useMemo(() => {
    return Object.values(fileData.eventEntries).reduce(
      (acc, cur) => ({
        ...acc,
        ...Object.fromEntries(Object.keys(cur).map((k) => [k, 0])),
      }),
      {}
    );
  }, []);

  const _visibleKeys = Object.fromEntries(
    Object.entries(availableKeysMap).map(([key]) => [key, false])
  );
  _visibleKeys["eventEntryId"] = true;
  _visibleKeys["timestamp"] = true;
  _visibleKeys["network"] = true;
  _visibleKeys["eventName"] = true;
  _visibleKeys["eventVolumeUsd"] = true;

  const [visibleKeys, setVisibleKeys] = useState<{ [k: string]: boolean }>(
    _visibleKeys
  );

  const memoTable = useMemo(() => {
    const colDefs = getColDefs(fileData.eventEntries, visibleKeys);
    const rowData = Object.values(fileData.eventEntries);

    return (
      <AgGridReact
        initialState={tableState}
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
        // embedFullWidthRows={true}
        alwaysShowHorizontalScroll={true}
        onRowClicked={(e) => {
          console.log("Clicked", e.data);
          if (e.data) {
            useMyStore
              .getState()
              .pushToCallStack("event", [e.data.eventEntryId]);
          }
        }}
      />
    );
  }, [visibleKeys]);

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
        {/* <Badge variant="outline" className="ml-auto sm:ml-0">
          In stock
        </Badge> */}
        <div className="items-center flex gap-2 md:ml-auto">
          <Button variant="outline" size="sm">
            <RotateCcw className="sm:hidden h-4 w-4" />
            <span className="hidden sm:block">Reset</span>
          </Button>
          <Button size="sm">
            <Columns2 className="sm:hidden h-4 w-4" />
            <span className="hidden sm:block">Select columns</span>
          </Button>
        </div>
      </div>
      <div
        className="ag-theme-quartz" // applying the Data Grid theme
        style={{ height: 650 }} // the Data Grid will fill the size of the parent container
      >
        {memoTable}
      </div>
    </div>
  );
}

const CUSTOM_COLDEFS: {
  [key: string]: ColDef<EventEntry>;
} = {
  timestamp: {
    field: "timestamp",
    valueGetter: (e) => new Date(e.data?.timestamp ?? 0).toLocaleTimeString(),
    filter: true,
  },
};

function getColDefs(
  eventEntries: EventEntries,
  visibleKeys: { [k: string]: boolean }
) {
  const colDefs: ColDef<EventEntry>[] = [];

  const keys = Object.values(eventEntries).reduce(
    (acc, cur) => ({
      ...acc,
      ...Object.fromEntries(Object.keys(cur).map((k) => [k, 0])),
    }),
    {}
  );

  for (const key of Object.keys(keys)) {
    if (!visibleKeys[key]) continue;
    if (key in CUSTOM_COLDEFS) {
      colDefs.push(CUSTOM_COLDEFS[key]);
    } else {
      colDefs.push({ field: key as keyof EventEntry });
    }
  }

  return colDefs;
}
