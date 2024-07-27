import { useMyStore } from "../store";
import { EventEntry } from "../types";
import Table, { TableCellData, TableColumnData } from "../components/Table";

export function events(csi: number) {
  const fileData = useMyStore.getState().fileData!;

  const columns: TableColumnData[] = [
    { name: "Id" },
    { name: "Time", sorter: (a: number, b: number) => a - b },
    { name: "Network", sorter: (a: string, b: string) => a.localeCompare(b) },
  ];

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

export function eventEntryToTableRow(ee: EventEntry): TableCellData[] {
  return [
    { element: <>...{ee.eventEntryId.slice(-4)}</> },
    {
      element: <>{new Date(ee.timestamp).toUTCString()}</>,
      sortableValue: ee.timestamp,
    },
    { element: <>{ee.network}</>, sortableValue: ee.network },
  ];
}
