import { useMyStore } from "../store";
import { EventEntry } from "../types";
import Table from "../components/Table";

export function events(csi: number) {
  const fileData = useMyStore.getState().fileData!;

  const columnNames = ["Id", "Time", "Network"];

  const rows = Object.values(fileData.eventEntries)
    .sort((a, b) => {
      return a.timestamp - b.timestamp;
    })
    .map((ee) => ({
      cells: eventEntryToTableRow(ee),
      onClick: () => {
        useMyStore.getState().pushToCallStack("event", [ee.eventEntryId]);
      },
    }));

  return (
    <></>
    // <Table
    //   tableName="Events"
    //   tableInfo=""
    //   csi={csi}
    //   columnNames={columnNames}
    //   rows={rows}
    // />
  );
}

function eventEntryToTableRow(ee: EventEntry) {
  return [
    <>...{ee.eventEntryId.slice(-4)}</>,
    <>{new Date(ee.timestamp).toUTCString()}</>,
    <>{ee.network}</>,
  ];
}
