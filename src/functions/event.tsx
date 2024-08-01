import { Button } from "@/components/ui/button";
import { useMyStore } from "@/helpers/store";
import { ChevronLeft } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function event(csi: number, eeId: string) {
  const ee = useMyStore.getState().fileData!.eventEntries[eeId];

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
          Event
        </h1>
        <Badge variant="outline" className="ml-auto sm:ml-0">
          {eeId}
        </Badge>
      </div>
      <Card className="w-full">
        <CardContent className="py-4">
          <Table>
            <TableBody>
              {Object.entries(ee).map(([key, value]) => {
                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>{value}</TableCell>
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
