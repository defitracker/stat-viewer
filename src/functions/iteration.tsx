import { useMyStore } from "../store";

export function iteration(csi: number, ieId: string) {
  const ie = useMyStore.getState().fileData!.iterationEntries[ieId];

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
                {transfromByKey(key, value)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function transfromByKey(key: string, value: any) {
  if (key === "parentId") {
    return (
      <span
        className="text-blue-500 cursor-pointer hover:underline"
        onClick={() => {
          useMyStore.getState().pushToCallStack("event", [value]);
        }}
      >
        {value}
      </span>
    );
  }
  return defaultValueTransform(value);
}

function defaultValueTransform(value: any) {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 4);
}
