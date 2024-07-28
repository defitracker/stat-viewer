import BigNumber from "bignumber.js";
import { useMyStore } from "../store";
import { EventEntries, IterationEntry } from "../types";
import Table, { TableCellData, TableColumnData } from "../components/Table";

export function iterations(csi: number) {
  const fileData = useMyStore.getState().fileData!;

  const columns = iterationEntryTableColumns();

  const rows = Object.values(fileData.iterationEntries).map((ie) => ({
    cells: iterationEntryToTableRow(ie, fileData.eventEntries),
    onClick: () => {
      useMyStore.getState().pushToCallStack("iteration", [ie.iterationEntryId]);
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
}

export function iterationEntryTableColumns(): TableColumnData[] {
  return [
    { name: "Id" },
    { name: "Time", sorter: (a: number, b: number) => a - b },
    { name: "Token", sorter: (a: string, b: string) => a.localeCompare(b) },
    { name: "NetworkA", sorter: (a: string, b: string) => a.localeCompare(b) },
    { name: "NetworkB", sorter: (a: string, b: string) => a.localeCompare(b) },
    { name: "Profit", sorter: (a: BigNumber, b: BigNumber) => a.comparedTo(b) },
    { name: "Coeff", sorter: (a: BigNumber, b: BigNumber) => a.comparedTo(b) },
    {
      name: "Extremum",
      sorter: (a: BigNumber, b: BigNumber) => a.comparedTo(b),
    },
    { name: "Time", sorter: (a: number, b: number) => a - b },
  ];
}

export function iterationEntryToTableRow(
  ie: IterationEntry,
  ees: EventEntries
): TableCellData[] {
  const ee = ees[ie.parentId];
  return [
    {
      element: (
        <>
          <span className="text-sm text-gray-700">...</span>
          {ie.iterationEntryId.slice(-6)}
        </>
      ),
    },
    {
      element: <>{new Date(ee.timestamp).toUTCString()}</>,
      sortableValue: ee.timestamp,
    },
    { element: <>{ie.tokenName}</>, sortableValue: ie.tokenName },
    { element: <span className={`${ie.networkA === ie.greenNetwork ? "text-green-600" : ""}`}>{ie.networkA}</span>, sortableValue: ie.networkA ?? "" },
    { element: <span className={`${ie.networkB === ie.greenNetwork ? "text-green-600" : ""}`}>{ie.networkB}</span>, sortableValue: ie.networkB ?? "" },
    {
      element: <>{BigNumber(ie.bestTvResDebugData?.[3] ?? "0").toFixed(4)}</>,
      sortableValue: BigNumber(ie.bestTvResDebugData?.[3] ?? "0"),
    },
    {
      element: (
        <>
          {ie.bestTvResDebugData
            ? BigNumber(ie.bestTvResDebugData[0]).toFixed(4)
            : ""}
        </>
      ),
      sortableValue: ie.bestTvResDebugData
        ? BigNumber(ie.bestTvResDebugData[0])
        : BigNumber(Number.MIN_SAFE_INTEGER),
    },
    {
      element: (
        <>
          {ie.estimatedBestTv ? BigNumber(ie.estimatedBestTv).toFixed(4) : ""}
        </>
      ),
      sortableValue: ie.estimatedBestTv
        ? BigNumber(ie.estimatedBestTv)
        : BigNumber(Number.MIN_SAFE_INTEGER),
    },
    {
      element: (
        <>{`${ie.timeForFirstGreenNetworkRes ?? 0} + ${
          ie.timeForOtherTVs ?? 0
        } + ${ie.timeForBestTvRes ?? 0} = ${
          (ie.timeForFirstGreenNetworkRes ?? 0) +
          (ie.timeForOtherTVs ?? 0) +
          (ie.timeForBestTvRes ?? 0)
        }`}</>
      ),
      sortableValue:
        (ie.timeForFirstGreenNetworkRes ?? 0) +
        (ie.timeForOtherTVs ?? 0) +
        (ie.timeForBestTvRes ?? 0),
    },
  ];
}
