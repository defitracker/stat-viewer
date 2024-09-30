import { Button } from "@/components/ui/button";
import { useMyStore } from "@/helpers/store";
import { ChevronLeft } from "lucide-react";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventEntry, IterationEntries } from "@/helpers/types";
import { getExplorerUrl } from "@/helpers/helper";
import { EVENTS_KEY_ORDER_PRIORITY } from "./events";

const USDollarFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function event(csi: number, eeId: string) {
  const ee = useMyStore.getState().fileData!.eventEntries[eeId];
  const iterations = useMyStore.getState().fileData!.iterationEntries

  const keysSorted = Object.keys(ee).sort((a, b) => {
    const aIdx = EVENTS_KEY_ORDER_PRIORITY.indexOf(a);
    const bIdx = EVENTS_KEY_ORDER_PRIORITY.indexOf(b);
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
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Event</h1>
        <Badge variant="outline" className="ml-auto sm:ml-0">
          {eeId}
        </Badge>
      </div>
      <Card className="w-full">
        <CardContent className="py-4">
          <Table>
            <TableBody>
              {keysSorted.map((key) => {
                const value = ee[key as keyof typeof ee];
                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>{transfromByKey(key, value, ee, iterations)}</TableCell>
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

function transfromByKey(key: string, value: any, ee: EventEntry, iterations: IterationEntries) {
  if (key === "timestamp") {
    return (
      <span>
        {new Date(value).toUTCString()} <span className="bg-blue-100">{new Date(value).getMilliseconds()}ms</span> ({value})
      </span>
    );
  }
  if (key === "_time_received") {
    return (
      <span>
        {new Date(value).toUTCString()} <span className="bg-blue-100">{new Date(value).getMilliseconds()}ms</span> ({value})
      </span>
    );
  }
  if (key === "block") {
    const baseUrl = getExplorerUrl(ee.network);
    return (
      <a href={`${baseUrl}/block/${value}`} target="_blank" className="text-blue-500 cursor-pointer hover:underline">
        {value}
      </a>
    );
  }
  if (key === "address") {
    const baseUrl = getExplorerUrl(ee.network);
    return (
      <a href={`${baseUrl}/address/${value}`} target="_blank" className="text-blue-500 cursor-pointer hover:underline">
        {value}
      </a>
    );
  }
  if (key === "txHash") {
    const baseUrl = getExplorerUrl(ee.network);
    return (
      <a href={`${baseUrl}/tx/${value}`} target="_blank" className="text-blue-500 cursor-pointer hover:underline">
        {value}
      </a>
    );
  }
  if (key === "token0") {
    const baseUrl = getExplorerUrl(ee.network);
    return (
      <a href={`${baseUrl}/token/${value}`} target="_blank" className="text-blue-500 cursor-pointer hover:underline">
        {value}
      </a>
    );
  }
  if (key === "token1") {
    const baseUrl = getExplorerUrl(ee.network);
    return (
      <a href={`${baseUrl}/token/${value}`} target="_blank" className="text-blue-500 cursor-pointer hover:underline">
        {value}
      </a>
    );
  }
  if (key === "eventVolumeUsd") {
    return USDollarFormat.format(value);
  }
  if (key === "iterations") {
    return (
      <div className="flex gap-1 flex-col">
        {(value as string[]).map((v) => {
          const ie = iterations[v]
          return (
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => {
                useMyStore.getState().pushToCallStack("iteration", [v]);
              }}
            >
              {v} ({ie.networkA.slice(0,3)}-{ie.networkB.slice(0,3)} {ie.req_key})
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
