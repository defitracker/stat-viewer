import "./App.css";
import Header from "./components/Header";
import FileSelect from "./components/FileSelect";
import { useMyStore } from "./store";
import CallStack from "./components/CallStack";
import DefaultActionList from "./components/DefaultActionList";
import Renderer from "./components/Renderer";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import S3FileSelect from "./components/S3FileSelect";

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
        <div className="container px-6 py-2 flex flex-col gap-2 w-full max-w-4xl mx-auto">
          {!fileData && (
            <>
              <FileSelect />
              <span className="relative flex justify-center my-4">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-75"></div>

                <span className="relative z-10 bg-white px-6 text-gray-700">
                  Or load data from S3
                </span>
              </span>
              <S3FileSelect />
            </>
          )}

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
