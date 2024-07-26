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
  if (key === "tvResDebugData") {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="ltr:text-left rtl:text-right">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                TV
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                Buy Res
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                Sell Res
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                Profit
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {(value as string[][]).map((v) => {
              return (
                <tr key={v[0]}>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                    {v[0]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {v[1]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {v[2]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {v[3]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  return defaultValueTransform(value);
}

function defaultValueTransform(value: any) {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 4);
}
