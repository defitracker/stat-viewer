import {
  Home,
  Activity,
  CalendarClock,
  Package,
  Package2,
  PanelLeft,
  ShoppingCart,
  File,
} from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useMyStore } from "@/helpers/store";
import { useShallow } from "zustand/react/shallow";
import React from "react";

export default function Header() {
  const { callStack, fileName } = useMyStore(
    useShallow((state) => ({
      callStack: state.callStack,
      fileName: state.fileName,
    }))
  );

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <a
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">StatViewer</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </a>
            <a
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <CalendarClock className="h-5 w-5" />
              Events
            </a>
            <a
              href="#"
              className="flex items-center gap-4 px-2.5 text-foreground"
            >
              <Activity className="h-5 w-5" />
              Iterations
            </a>
            {/* <a
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <LineChart className="h-5 w-5" />
              Settings
            </a> */}
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="cursor-pointer"
              onClick={() => {
                useMyStore.getState().popFromCallStack(callStack.length);
              }}
            >
              <BreadcrumbPage>Home</BreadcrumbPage>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {callStack.map((v, idx) => {
            const text = `${v.fName}(${v.params.length > 0 ? `${v.params[0].toString().slice(0,4)}..` : ""})`;
            return (
              <React.Fragment key={idx}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <div
                      className={`${
                        idx < callStack.length - 1
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                      onClick={() => {
                        if (idx < callStack.length - 1) {
                          const numToPop = callStack.length - 1 - idx;
                          useMyStore.getState().popFromCallStack(numToPop);
                        }
                      }}
                    >
                      {idx < callStack.length - 1 ? (
                        <>{text}</>
                      ) : (
                        <BreadcrumbPage>{text}</BreadcrumbPage>
                      )}
                    </div>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        size="sm"
        variant="outline"
        className="gap-1 ml-auto"
        onClick={() => {
          const callStack = useMyStore.getState().callStack;
          if (
            callStack.length > 0 &&
            callStack[callStack.length - 1].fName === "fileSelect"
          ) {
            //
          } else {
            useMyStore.getState().pushToCallStack("fileSelect", []);
          }
        }}
      >
        <File className="h-3.5 w-3.5" />
        <span className="text-xs sm:not-sr-only sm:whitespace-nowrap">
          {fileName.length > 0 ? fileName : "No file selected"}
        </span>
      </Button>
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Image
              src="/placeholder-user.jpg"
              width={36}
              height={36}
              alt="Avatar"
              className="overflow-hidden rounded-full"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
    </header>
  );
}
