import { useMyStore } from "../store";
import { EventEntry } from "../types";
import Table, { TableCellData, TableColumnData } from "../components/Table";
import BigNumber from "bignumber.js";

const USDollarFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function events(csi: number) {
  const fileData = useMyStore.getState().fileData!;

  const columns = eventEntryTableColumns();

  const rows = Object.values(fileData.eventEntries).map((ee) => ({
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
}

export function eventEntryTableColumns(): TableColumnData[] {
  return [
    { name: "Id" },
    { name: "Time", sorter: (a: number, b: number) => a - b },
    { name: "Network", sorter: (a: string, b: string) => a.localeCompare(b) },
    { name: "Event", sorter: (a: string, b: string) => a.localeCompare(b) },
    { name: "Volume", sorter: (a: BigNumber, b: BigNumber) => a.comparedTo(b) },
    { name: "Iters" },
  ];
}

export function eventEntryToTableRow(ee: EventEntry): TableCellData[] {
  return [
    {
      element: (
        <>
          <span className="text-sm text-gray-700">...</span>
          {ee.eventEntryId.slice(-6)}
        </>
      ),
    },
    {
      element: <>{new Date(ee.timestamp ?? 0).toUTCString()}</>,
      sortableValue: ee.timestamp ?? 0,
    },
    { element: <>{ee.network}</>, sortableValue: ee.network ?? "" },
    { element: <>{ee.eventName}</>, sortableValue: ee.eventName ?? "" },
    {
      element: (
        <>{USDollarFormat.format(parseFloat(ee.eventVolumeUsd ?? "0"))}</>
      ),
      sortableValue: BigNumber(ee.eventVolumeUsd ?? "0"),
    },
    {
      element: (
        <>{ee.iterations?.length > 0 ? `Yes, ${ee.iterations.length}` : "No"}</>
      ),
    },
  ];
}
