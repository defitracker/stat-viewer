import BigNumber from "bignumber.js";
import { useMyStore } from "../store";
import { EventEntries, IterationEntry } from "../types";
import Table, { TableCellData, TableColumnData } from "../components/Table";

export function iterations(csi: number) {
  const fileData = useMyStore.getState().fileData!;

  const columns: TableColumnData[] = [
    { name: "Time", sorter: (a: number, b: number) => a - b },
    { name: "Token", sorter: (a: string, b: string) => a.localeCompare(b) },
    { name: "Profit", sorter: (a: BigNumber, b: BigNumber) => a.comparedTo(b) },
  ];

  const rows = Object.values(fileData.iterationEntries)
    .map((ie) => ({
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
}

function iterationEntryToTableRow(
  ie: IterationEntry,
  ees: EventEntries
): TableCellData[] {
  const ee = ees[ie.parentId];
  return [
    {
      element: <>{new Date(ee.timestamp).toUTCString()}</>,
      sortableValue: ee.timestamp,
    },
    { element: <>{ie.tokenName}</>, sortableValue: ie.tokenName },
    {
      element: <>{BigNumber(ie.bestTvResDebugData?.[3] ?? "0").toFixed(4)}</>,
      sortableValue: BigNumber(ie.bestTvResDebugData?.[3] ?? "0"),
    },
  ];
}
