import { Button } from "@/components/ui/button";
import { useMyStore } from "@/helpers/store";
import { ChevronLeft } from "lucide-react";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventEntry, IterationEntry, IterationEntryExt } from "@/helpers/types";
import { getExplorerUrl } from "@/helpers/helper";
import { ieToIeExt, ITERATIONS_KEY_ORDER_PRIORITY } from "./iterations";

import functionPlot, { FunctionPlotOptions } from "function-plot";
import { useEffect, useRef } from "react";
import React from "react";

export interface FunctionPlotProps {
  options?: FunctionPlotOptions;
}

export const FunctionPlot: React.FC<FunctionPlotProps> = React.memo(
  ({ options }) => {
    const rootEl = useRef(null);

    useEffect(() => {
      try {
        functionPlot(Object.assign({}, options, { target: rootEl.current }));
      } catch (e) {}
    });

    return <div ref={rootEl} />;
  },
  () => false
);

function Plot({ ieExt }: { ieExt: IterationEntryExt }) {
  if (!ieExt._l_profitRes) return <></>;

  const coeffsRes = ieExt._l_profitRes.coefficients;
  const [a, b, c] = [coeffsRes.get(2, 0), coeffsRes.get(1, 0), coeffsRes.get(0, 0)];
  const fn = `${a}x^2 + ${b}x + ${c}`;

  const coeffsRes2 = ieExt._l_profitRes2!.coefficients;
  const [a2, b2, c2] = [coeffsRes2.get(2, 0), coeffsRes2.get(1, 0), coeffsRes2.get(0, 0)];
  const fn2 = `${a2}x^2 + ${b2}x + ${c2}`;

  const extremum = -b / (2 * a);

  const tvAnnotations: FunctionPlotOptions["annotations"] = [];
  const tvPoints = [];
  for (const tvRes of ieExt.tvResDebugData) {
    tvPoints.push([parseFloat(tvRes[0]), parseFloat(tvRes[3])]);
    // tvAnnotations.push({
    //   y: parseFloat(tvRes[3]),
    //   text: `y = ${parseFloat(tvRes[3])}`,
    // });
    // tvAnnotations.push({
    //   x: parseFloat(tvRes[0]),
    //   text: `x = ${parseFloat(tvRes[0])}`,
    // });
  }

  const profitCalc = c + b * extremum + a * extremum ** 2;

  const data: FunctionPlotOptions["data"] = [];
  const annotations: FunctionPlotOptions["annotations"] = [...tvAnnotations];
  data.push({ fn });
  data.push({ fn: fn2, color: "orange" });
  data.push({
    fnType: "points",
    graphType: "scatter",
    color: "red",
    attr: { r: 3 },
    points: tvPoints,
  });
  data.push({
    fnType: "points",
    graphType: "scatter",
    color: "purple",
    attr: { r: 3 },
    points: [[extremum, profitCalc]],
  });
  // data.push({
  //   graphType: "text",
  //   text: `${profitCalc}`,
  //   color: "black",
  //   location: [extremum, profitCalc + 0.01],
  //   attr: { "text-anchor": "middle" },
  // });
  if (ieExt.bestTvCoeff && ieExt.bestTvProfit) {
    data.push({
      fnType: "points",
      graphType: "scatter",
      color: "green",
      attr: { r: 3 },
      points: [[ieExt.bestTvCoeff, ieExt.bestTvProfit]],
    });
    // data.push({
    //   graphType: "text",
    //   text: `${ieExt.bestTvProfit}`,
    //   color: "black",
    //   location: [ieExt.bestTvCoeff, ieExt.bestTvProfit + 0.01],
    //   attr: { "text-anchor": "middle" },
    // });
  }

  return (
    <FunctionPlot
      options={{
        target: "",
        width: 600,
        height: 300,
        yAxis: { domain: [0, 0.1] },
        xAxis: { domain: [-0.5, 3] },
        grid: true,
        data,
        annotations,
      }}
    />
  );
}

export function iteration(csi: number, ieId: string) {
  const ie = useMyStore.getState().fileData!.iterationEntries[ieId];
  const ieExt = ieToIeExt(ie, useMyStore.getState().fileData!.eventEntries);

  const keysSorted = Object.keys(ieExt).sort((a, b) => {
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
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">Iteration</h1>
        <Badge variant="outline" className="ml-auto sm:ml-0">
          {ieId}
        </Badge>
      </div>
      <Card className="w-full">
        <CardContent className="py-4">
          <Table>
            <TableBody>
              {keysSorted.filter(key => !["greenNetwork"].includes(key)).map((key) => {
                const value = ieExt[key as keyof typeof ieExt];
                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>{transfromByKey(key, value, ieExt)}</TableCell>
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

function transfromByKey(key: string, value: any, ieExt: IterationEntryExt) {
  if (key === "timestamp") {
    return (
      <span>
        {new Date(value).toUTCString()} ({value})
      </span>
    );
  }
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
  if (key === "networkA") {
    if (!value) return <></>;
    const isGreen = ieExt.greenNetwork === value;
    return (
      <Badge className={isGreen ? "bg-green-200/40" : ""} variant="outline">
        {value}
      </Badge>
    );
  }
  if (key === "networkB") {
    if (!value) return <></>;
    const isGreen = ieExt.greenNetwork === value;
    return (
      <Badge className={isGreen ? "bg-green-200/40" : ""} variant="outline">
        {value}
      </Badge>
    );
  }
  if (key === "_l_profitPlot") {
    return <Plot ieExt={ieExt} />;
  }
  if (key === "_l_profitValue") {
    return (
      <Badge variant="outline" style={{ borderColor: "purple", color: "purple" }}>
        {value}
      </Badge>
    );
  }
  if (key === "bestTvProfit") {
    return (
      <Badge variant="outline" style={{ borderColor: "green", color: "green" }}>
        {value}
      </Badge>
    );
  }
  if (key === "tvResDebugData") {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="ltr:text-left rtl:text-right">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">TV</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Buy Res</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Sell Res</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Profit</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {(value as string[][]).map((v) => {
              return (
                <tr key={v[0]}>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">{v[0]}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {v[1]} c:{v[4]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {v[2]} c:{v[5]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">{v[3]}</td>
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
