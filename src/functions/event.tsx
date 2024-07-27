import { getExplorerUrl } from "../helper";
import { useMyStore } from "../store";
import { EventEntry } from "../types";

export function event(csi: number, eeId: string) {
  const ie = useMyStore.getState().fileData!.eventEntries[eeId];

  return (
    <div className="flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
      <dl className="-my-3 divide-y divide-gray-100 text-sm">
        {Object.entries(ie).map(([key, value]) => {
          return (
            <div
              key={key}
              className="grid grid-cols-1 gap-1 p-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4"
            >
              <dt className="font-medium text-gray-900">{key}</dt>
              <dd className="text-gray-700 sm:col-span-2">
                {transfromByKey(key, value, ie)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function transfromByKey(key: string, value: any, ie: EventEntry) {
  if (key === "block") {
    const baseUrl = getExplorerUrl(ie.network);
    return (
      <a
        href={`${baseUrl}/block/${value}`}
        target="_blank"
        className="text-blue-500 cursor-pointer hover:underline"
      >
        {value}
      </a>
    );
  }
  if (key === "address") {
    const baseUrl = getExplorerUrl(ie.network);
    return (
      <a
        href={`${baseUrl}/address/${value}`}
        target="_blank"
        className="text-blue-500 cursor-pointer hover:underline"
      >
        {value}
      </a>
    );
  }
  if (key === "txHash") {
    const baseUrl = getExplorerUrl(ie.network);
    return (
      <a
        href={`${baseUrl}/tx/${value}`}
        target="_blank"
        className="text-blue-500 cursor-pointer hover:underline"
      >
        {value}
      </a>
    );
  }
  if (key === "iterations") {
    return (
      <div className="flex gap-1 flex-col">
        {(value as string[]).map((v) => {
          return (
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => {
                useMyStore.getState().pushToCallStack("iteration", [v]);
              }}
            >
              {v}
            </span>
          );
        })}
      </div>
    );
  }
  return defaultValueTransform(value);
}

function defaultValueTransform(value: any) {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 4);
}
