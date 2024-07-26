import BigNumber from "bignumber.js";
import { useMyStore } from "../store";
import { EventEntries, IterationEntry } from "../types";
import Table from "../components/Table";

export function iterations() {
  const fileData = useMyStore.getState().fileData!;

  const columnNames = ["Time", "Token", "Profit"];

  const rows = Object.values(fileData.iterationEntries)
    .slice(0, 85)
    .map((ie) => ({
      cells: iterationEntryToTableRow(ie, fileData.eventEntries),
      onClick: () => {
        useMyStore
          .getState()
          .pushToCallStack("iteration", [ie.iterationEntryId, "kek"]);
      },
    }));

  return <Table columnNames={columnNames} rows={rows} />;
}

function iterationEntryToTableRow(ie: IterationEntry, ees: EventEntries) {
  const ee = ees[ie.parentId];
  return [
    <>{new Date(ee.timestamp).toString()}</>,
    <>{ie.tokenName}</>,
    <>{BigNumber(ie.bestTvResDebugData?.[3] ?? "0").toFixed(4)}</>,
  ];
}
