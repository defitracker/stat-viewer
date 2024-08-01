import { Button } from "@/components/ui/button";
import { useMyStore } from "@/helpers/store";
import { ChevronLeft } from "lucide-react";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventEntry, IterationEntry } from "@/helpers/types";
import { getExplorerUrl } from "@/helpers/helper";
import { ITERATIONS_KEY_ORDER_PRIORITY } from "./iterations";

export function iteration(csi: number, ieId: string) {
  const ie = useMyStore.getState().fileData!.iterationEntries[ieId];

  const keysSorted = Object.keys(ie).sort((a, b) => {
    const aIdx = ITERATIONS_KEY_ORDER_PRIORITY.indexOf(a);
    const bIdx = ITERATIONS_KEY_ORDER_PRIORITY.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    else if (aIdx !== -1) return -1;
    else return 1;
  });

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
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Iteration
        </h1>
        <Badge variant="outline" className="ml-auto sm:ml-0">
          {ieId}
        </Badge>
      </div>
      <Card className="w-full">
        <CardContent className="py-4">
          <Table>
            <TableBody>
              {keysSorted.map((key) => {
                const value = ie[key as keyof typeof ie];
                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>{transfromByKey(key, value, ie)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function transfromByKey(key: string, value: any, ie: IterationEntry) {
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
