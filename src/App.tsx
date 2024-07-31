import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { useMyStore } from "./helpers/store";
import { useShallow } from "zustand/react/shallow";
import { Test } from "./Test";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Toaster } from "@/components/ui/sonner"

function App() {
  // const { fileData } = useMyStore(
  //   useShallow((state) => ({
  //     fileData: state.fileData,
  //   }))
  // );

  return (
    <>
      <TooltipProvider>
        <Test />
        <Toaster />
      </TooltipProvider>
    </>
  );
}

export default App;
