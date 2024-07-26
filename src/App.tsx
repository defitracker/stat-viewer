import "./App.css";
import Header from "./components/Header";
import FileSelect from "./components/FileSelect";
import { useMyStore } from "./store";
import CallStack from "./components/CallStack";
import DefaultActionList from "./components/DefaultActionList";
import Renderer from "./components/Renderer";

function App() {
  const { fileData, setFileData, setFileName } = useMyStore((state) => ({
    fileData: state.fileData,
    setFileData: state.setFileData,
    setFileName: state.setFileName,
  }));

  return (
    <>
      <section className="bg-white">
        <Header />
        <div className="container px-6 py-8 flex flex-col gap-4 mx-auto">
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
