import "./App.css";
import Header from "./components/Header";
import FileSelect from "./components/FileSelect";
import { useMyStore } from "./store";
import CallStack from "./components/CallStack";
import DefaultActionList from "./components/DefaultActionList";
import Renderer from "./components/Renderer";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

function App() {
  const { fileData } = useMyStore(
    useShallow((state) => ({
      fileData: state.fileData,
    }))
  );

  return (
    <>
      <section className="bg-white">
        <Header />
        <div className="container px-6 py-2 flex flex-col gap-2 mx-auto">
          <FileSelect />

          {fileData && (
            <>
              <CallStack />
              <Renderer />
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default App;
