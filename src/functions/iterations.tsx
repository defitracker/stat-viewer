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
import { EventEntries, EventEntry, IterationEntry, IterationEntryExt } from "@/helpers/types";

import { AgGridReact } from "ag-grid-react";

import { useMemo, useState } from "react";
import { ColDef } from "ag-grid-community";
import FullHeight from "@/components/FullHeight";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Matrix from "ml-matrix";

import { addConstant } from "@/helpers/linear/tools";
import { linearRegression } from "@/helpers/linear";

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
  "block",
  "estimatedBestTv",
  "bestTvCoeff",
  "bestTvProfit",
  "earlyFinishReason",
  "_l_profitValue",
  "_l_profitToActual",
  "_l_profitPlot",
  "totalTimeFromLog",
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
    const _visibleKeys = Object.fromEntries(availableKeysMap.map((key) => [key, true]));
    return _visibleKeys;
  };

  const [visibleKeys, setVisibleKeys] = useState<{ [k: string]: boolean }>(getDefaultVisibleKeys());

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
                  hiddenColIds: ["parentId", "greenNetwork", "_l_profitPlot"],
                },
                sort: {
                  sortModel: [{ colId: "timestamp", sort: "desc" }],
                  columnPinning: {
                    leftColIds: ["iterationEntryId"],
                    rightColIds: [],
                  },
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
        rowClass="cursor-pointer"
        onRowClicked={(e) => {
          if (e.data) {
            useMyStore.getState().pushToCallStack("iteration", [e.data.iterationEntryId]);
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
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Iterations</h1>
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
                  setVisibleKeys(Object.fromEntries(Object.entries(visibleKeys).map((k) => [k[0], true])));
                }}
              >
                Enable all
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  const newKeys = Object.fromEntries(Object.entries(visibleKeys).map((k) => [k[0], false]));
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
      // if (e.data) {
      //   useMyStore
      //     .getState()
      //     .pushToCallStack("iteration", [e.data.iterationEntryId]);
      // }
    },
  },
  parentId: {
    field: "parentId",
    hide: true,
  },
  timestamp: {
    field: "timestamp",
    valueFormatter: (e) => new Date(e.data?.timestamp ?? 0).toLocaleString(),
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
  bestTvCoeff: {
    field: "bestTvCoeff",
    filter: "agNumberColumnFilter",
  },
  bestTvProfit: {
    field: "bestTvProfit",
    filter: "agNumberColumnFilter",
  },
  totalTimeFromLog: {
    field: "totalTimeFromLog",
    filter: "agNumberColumnFilter",
  },
  block: {
    field: "block",
    filter: "agNumberColumnFilter",
  },
  _l_profitToActual: {
    field: "_l_profitToActual",
    filter: "agNumberColumnFilter",
    cellClass: (v) => ((v.data?._l_profitToActual ?? 0) > 1 ? "text-red-500" : ""),
    valueFormatter: (v) =>
      v.data?._l_profitToActual ? `$${parseFloat((v.data?._l_profitToActual ?? 0).toFixed(2))}` : "",
  },
  networkA: {
    field: "networkA",
    cellRenderer: (params: any) => {
      if (!params.value) return <></>;
      const isGreen = params.data?.greenNetwork === params.value;
      return (
        <Badge className={isGreen ? "bg-green-200/40" : ""} variant="outline">
          {params.value}
        </Badge>
      );
    },
  },
  networkB: {
    field: "networkB",
    cellRenderer: (params: any) => {
      if (!params.value) return <></>;
      const isGreen = params.data?.greenNetwork === params.value;
      return (
        <Badge className={isGreen ? "bg-green-200/40" : ""} variant="outline">
          {params.value}
        </Badge>
      );
    },
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
  let _l_profitRes: IterationEntryExt["_l_profitRes"] = undefined;
  let _l_profitRes2: IterationEntryExt["_l_profitRes2"] = undefined;
  let _l_profitExtremum: IterationEntryExt["_l_profitExtremum"] = undefined;
  let _l_profitValue: IterationEntryExt["_l_profitValue"] = undefined;
  let _l_profitPlot: IterationEntryExt["_l_profitPlot"] = undefined;
  {
    if (ie.tvResDebugData) {
      const _x = [];
      const _x2 = [];
      const _y = [];
      const _y2 = [];
      // _x.push([-1, -1])
      // _y.push(0)
      // _x.push([0, 0])
      // _y.push(0)
      for (const tvRes of ie.tvResDebugData) {
        _x.push([parseFloat(tvRes[0]), parseFloat(tvRes[0]) ** 2]);
        _x2.push([parseFloat(tvRes[0]), parseFloat(tvRes[0]) ** 2]);
        if (tvRes[3] !== "unknown") {
          _y.push(parseFloat(tvRes[3]));
          _y2.push(parseFloat(tvRes[3]));
        } else {
          _y.push(-1);
          _y2.push(-1);
        }
      }
      if (ie.bestTvResDebugData) {
        _x2.push([parseFloat(ie.bestTvResDebugData[0]), parseFloat(ie.bestTvResDebugData[0]) ** 2]);
        _y2.push(parseFloat(ie.bestTvResDebugData[3]));
      }

      let x = addConstant(new Matrix(_x));
      let x2 = addConstant(new Matrix(_x2));
      let y = Matrix.columnVector(_y);
      let y2 = Matrix.columnVector(_y2);

      _l_profitRes = linearRegression(y, x, false);
      _l_profitRes2 = linearRegression(y2, x2, false);

      const coeffsRes = _l_profitRes.coefficients;
      const [a, b, c] = [coeffsRes.get(2, 0), coeffsRes.get(1, 0), coeffsRes.get(0, 0)];
      _l_profitExtremum = -b / (2 * a);
      _l_profitValue = c + b * _l_profitExtremum + a * _l_profitExtremum ** 2;
      _l_profitPlot = "_l_profitPlot";
    }
  }
  const bestTvProfit =
    ie.bestTvResDebugData && ie.bestTvResDebugData[3] !== "unknown" ? parseFloat(ie.bestTvResDebugData[3]) : undefined;
  const ext: IterationEntryExt = {
    ...ie,
    timestamp: ees[ie.parentId]?.timestamp,
    block: ees[ie.parentId]?.block ? parseInt(ees[ie.parentId]?.block) : undefined,
    bestTvCoeff: ie.bestTvResDebugData ? parseFloat(ie.bestTvResDebugData[0]) : undefined,
    bestTvProfit,
    _l_profitRes,
    _l_profitRes2,
    _l_profitExtremum,
    _l_profitValue,
    _l_profitPlot,
    // _l_profitToActual: bestTvProfit && _l_profitValue ? bestTvProfit / _l_profitValue : undefined,
    _l_profitToActual: bestTvProfit && _l_profitValue ? Math.abs(bestTvProfit - _l_profitValue) * 2500 : undefined,
    firstReqAResPriceDiffer: ie._delay_firstReqAResPrice
      ? ie.firstReqAResPrice !== ie._delay_firstReqAResPrice
      : undefined,
    firstReqBResPriceDiffer: ie._delay_firstReqBResPrice
      ? ie.firstReqBResPrice !== ie._delay_firstReqBResPrice
      : undefined,
  };
  return ext;
}
