import { useMyStore } from "../store";

export default function Header() {
  const { fileData, fileName } = useMyStore((state) => ({
    fileData: state.fileData,
    fileName: state.fileName,
  }));

  return (
    <header className="bg-gray-100">
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl center">
              Stat Viewer v1.0
            </h1>
          </div>
          <p className="text-xs">{fileName}</p>
        </div>
      </div>
    </header>
  );
}
