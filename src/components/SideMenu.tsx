import {
  Home,
  Activity,
  CalendarClock,
  Package2,
  Settings,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useMyStore } from "@/helpers/store";
import { useShallow } from "zustand/react/shallow";
import clsx from "clsx";

export default function SideMenu() {
  const { callStack } = useMyStore(
    useShallow((state) => ({
      callStack: state.callStack,
    }))
  );

  const topCallStackFunction = callStack?.[callStack.length - 1]?.fName;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <a
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Acme Inc</span>
        </a>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              onClick={() => {
                useMyStore.getState().popFromCallStack(callStack.length);
              }}
              href="#"
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                {
                  "text-muted-foreground": callStack.length > 0,
                  "bg-accent text-accent-foreground": callStack.length === 0,
                }
              )}
            >
              <Home className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Dashboard</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="#"
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                {
                  "text-muted-foreground": topCallStackFunction !== "events",
                  "bg-accent text-accent-foreground":
                    topCallStackFunction === "events",
                }
              )}
              onClick={() => {
                useMyStore.getState().pushToCallStack("events", []);
              }}
            >
              <CalendarClock className="h-5 w-5" />
              <span className="sr-only">Events</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Events</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="#"
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                {
                  "text-muted-foreground":
                    topCallStackFunction !== "iterations",
                  "bg-accent text-accent-foreground":
                    topCallStackFunction === "iterations",
                }
              )}
              onClick={() => {
                useMyStore.getState().pushToCallStack("iterations", []);
              }}
            >
              <Activity className="h-5 w-5" />
              <span className="sr-only">Iterations</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Iterations</TooltipContent>
        </Tooltip>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              onClick={() => {
                // useMyStore.getState().pushToCallStack("fileSelect", []);
              }}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}
