import { useState } from "react";
import { S3Connect, S3Manager } from "../S3Manager";
import { S3 } from "aws-sdk";
import { useMyStore } from "../store";
import { useShallow } from "zustand/react/shallow";

export default function S3FileSelect() {
  const { setFileData, setFileName } = useMyStore(
    useShallow((state) => ({
      setFileData: state.setFileData,
      setFileName: state.setFileName,
    }))
  );

  const [region, setRegion] = useState("us-east-1");
  const [bucketName, setBucketName] = useState("workerresolved");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | any>(null);
  const [files, setFiles] = useState<null | S3.ObjectList>(null);

  function getFileSizeString(size: number | undefined) {
    if (size === undefined) return "unknown size";
    if (size >= 1000 * 1000) return `${(size / 1000 / 1000).toFixed(1)} MB`;
    if (size >= 1000) return `${(size / 1000).toFixed(1)} KB`;
    return `${size} B`;
  }

  function renderFiles() {
    if (!files) return <></>;
    return (
      <section
        className={`container px-4 w-full max-w-4xl mx-auto ${
          loading ? "animate-pulse" : ""
        }`}
      >
        <div className="flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        <div className="flex items-center gap-x-3">
                          <span>File name</span>
                        </div>
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Time started
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        Time uploaded
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                    {files
                      .filter((f) => f.Key?.includes(".json"))
                      .sort(
                        (a, b) =>
                          (b.LastModified?.getTime() ?? 0) -
                          (a.LastModified?.getTime() ?? 0)
                      )
                      .map((f, idx) => {
                        return (
                          <tr
                            key={f.Key || idx}
                            className={
                              loading ? "" : `hover:bg-gray-100 cursor-pointer`
                            }
                            onClick={async () => {
                              const manager = S3Connect.getManager();
                              if (!manager)
                                return console.error("No s3 manager");

                              setLoading(true);
                              setFileName(f.Key!);

                              const arrayBuffer = await manager.getObject(
                                f.Key!
                              );
                              if (arrayBuffer !== undefined) {
                                const enc = new TextDecoder("utf-8")
                                const fileString = enc.decode(arrayBuffer as Uint8Array)
                                const json = JSON.parse(fileString);
                                setFileData(json);
                              }
                              setLoading(false);
                            }}
                          >
                            <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                              <div className="inline-flex items-center gap-x-3">
                                <div className="flex items-center gap-x-2">
                                  <div className="flex items-center justify-center w-8 h-8 text-blue-500 bg-blue-100 rounded-full dark:bg-gray-800">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth="1.5"
                                      stroke="currentColor"
                                      className="w-5 h-5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                      />
                                    </svg>
                                  </div>

                                  <div>
                                    <h2 className="font-normal text-gray-800 dark:text-white ">
                                      {f.Key}
                                    </h2>
                                    <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                      {getFileSizeString(f.Size)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                              {f.Key
                                ? new Date(
                                    parseInt(
                                      f.Key.replace(".json", "")
                                        .split("-")
                                        .pop() as string
                                    )
                                  ).toUTCString()
                                : "unknown"}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                              {f.LastModified && f.LastModified.toUTCString()}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderInput() {
    return (
      <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
        <div>
          <label
            htmlFor="Region"
            className="block text-xs font-medium text-gray-700"
          >
            {" "}
            Region{" "}
          </label>

          <input
            type="text"
            value={region}
            disabled={loading}
            onChange={(e) => setRegion(e.target.value)}
            id="Region"
            placeholder="us-east-1"
            className="mt-1 px-4 py-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="BucketName"
            className="block text-xs font-medium text-gray-700"
          >
            {" "}
            Bucket Name{" "}
          </label>

          <input
            type="text"
            value={bucketName}
            disabled={loading}
            onChange={(e) => setBucketName(e.target.value)}
            id="BucketName"
            placeholder="workerresolved"
            className="mt-1 px-4 py-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="AccessKeyId"
            className="block text-xs font-medium text-gray-700"
          >
            {" "}
            AccessKeyId{" "}
          </label>

          <input
            type="text"
            value={accessKeyId}
            disabled={loading}
            onChange={(e) => setAccessKeyId(e.target.value)}
            id="AccessKeyId"
            placeholder="XXXXXXXXXXXXXXXXXXXX"
            className="mt-1 px-4 py-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="SecretAccessKey"
            className="block text-xs font-medium text-gray-700"
          >
            {" "}
            SecretAccessKey{" "}
          </label>

          <input
            type="text"
            value={secretAccessKey}
            disabled={loading}
            onChange={(e) => setSecretAccessKey(e.target.value)}
            id="SecretAccessKey"
            placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="mt-1 px-4 py-2 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
          />
        </div>
        <button
          disabled={loading}
          className="px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 disabled:bg-blue-400 rounded-lg hover:bg-blue-500 disabled:hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
          onClick={async () => {
            if (loading) return;
            setError(false)
            setLoading(true);

            const maybeS3 = await S3Connect.connect({
              bucketName,
              region,
              accessKeyId,
              secretAccessKey,
            });

            if (maybeS3 instanceof S3Manager) {
              const s3 = maybeS3;
              const files = await s3.listObjects();
              setFiles(files);
            } else {
              const e = maybeS3;
              setError(e)
              console.log("S3Connect returned error", e);
            }
            setLoading(false);
          }}
        >
          {loading ? "Loading..." : "Connect"}
        </button>
        {error !== null && (
          <div className="text-sm text-red-500">{(error as Error).message}</div>
        )}
      </div>
    );
  }

  return (
    <>
      {files && renderFiles()}
      {!files && renderInput()}
    </>
  );
}
