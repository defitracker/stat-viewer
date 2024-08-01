import "./App.css";

import SideMenu from "./components/SideMenu";
import Header from "./components/Header";
import Renderer from "./components/Renderer";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import { LicenseManager } from "ag-grid-enterprise";
import { LicenseManager as ChartLicenceManager } from "ag-grid-charts-enterprise";

LicenseManager.setLicenseKey(
  "DownloadDevTools_COM_NDEwMjM0NTgwMDAwMA==59158b5225400879a12a96634544f5b6"
);
ChartLicenceManager.setLicenseKey(
  "DownloadDevTools_COM_NDEwMjM0NTgwMDAwMA==59158b5225400879a12a96634544f5b6"
);

function App() {
  return (
    <>
      <TooltipProvider>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <SideMenu />
          <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <Header />
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
              <Renderer />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </>
  );
}

export default App;
