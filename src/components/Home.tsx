import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useMyStore } from "@/helpers/store";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";

export default function Home() {
  const { fileData } = useMyStore(
    useShallow((state) => ({
      fileData: state.fileData,
    }))
  );

  useEffect(() => {
    if (fileData === null) {
      const { callStack, pushToCallStack } = useMyStore.getState();
      if (callStack.length === 0) {
        pushToCallStack("fileSelect", []);
      }
    }
  }, [fileData]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {/* <Button variant="outline" size="icon" className="h-7 w-7">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button> */}
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Home
        </h1>
        {/* <Badge variant="outline" className="ml-auto sm:ml-0">
          In stock
        </Badge> */}
        {/* <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm">
            Discard
          </Button>
          <Button size="sm">Save Product</Button>
        </div> */}
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={() => useMyStore.getState().pushToCallStack("events", [])}
        >
          Open events
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            useMyStore.getState().pushToCallStack("iterations", [])
          }
        >
          Open iterations
        </Button>
      </div>
    </div>
  );
}
