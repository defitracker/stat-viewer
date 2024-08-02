import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ColDef, StateUpdatedEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { S3Connect, S3Manager } from "@/helpers/S3Manager";
import S3 from "aws-sdk/clients/s3";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx";
import { useMyStore } from "@/helpers/store";
import FullHeight from "./FullHeight";

const formSchema = z.object({
  region: z.string().min(1, { message: "region is required" }),
  bucketName: z.string().min(1, { message: "bucketName is required" }),
  accessKeyId: z
    .string()
    .length(20, { message: "AccessKeyId must be 20 characters." }),
  secretAccessKey: z
    .string()
    .length(40, { message: "SecretAccessKey must be 40 characters." }),
});

function S3FileSelectWrapped({
  loading,
  setLoading,
  files,
  setFiles,
  applyPermaStoreValues,
  permaStoreInputs,
}: {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  files: null | S3.ObjectList;
  setFiles: React.Dispatch<React.SetStateAction<null | S3.ObjectList>>;
  applyPermaStoreValues: boolean;
  permaStoreInputs: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "us-east-1",
      bucketName: "workerresolved",
      accessKeyId: "",
      secretAccessKey: "",
    },
  });

  if (applyPermaStoreValues && permaStoreInputs) {
    onSubmit(permaStoreInputs);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { region, bucketName, accessKeyId, secretAccessKey } = values;

    if (loading) return;
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
      useMyStore.getState().addToPermaStore("s3FileSelect", {
        inputValues: values,
      });
    } else {
      const e = maybeS3;
      toast(e.message);
      console.error("S3Connect returned error", e);
    }

    setLoading(false);
  }

  const renderForm = () => {
    if (files !== null) return;
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="">
          <CardContent className="grid gap-2">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bucketName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bucket name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accessKeyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AccessKeyId</FormLabel>
                  <FormControl>
                    <Input placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secretAccessKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SecretAccessKey</FormLabel>
                  <FormControl>
                    <Input placeholder="************" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button disabled={loading} className="w-full" type="submit">
              Connect
            </Button>
          </CardFooter>
        </form>
      </Form>
    );
  };

  const renderFiles = () => {
    if (files === null) return;

    type FileData = {
      filename: string;
      filesize: number;
      timeStarted: number;
      timeUploaded: number;
    };

    function getFileSizeString(size: number | undefined) {
      if (size === undefined) return "unknown size";
      if (size >= 1000 * 1000) return `${(size / 1000 / 1000).toFixed(1)} MB`;
      if (size >= 1000) return `${(size / 1000).toFixed(1)} KB`;
      return `${size} B`;
    }

    const rowData: FileData[] = files.map((f) => {
      let timeStarted = parseInt(
        f.Key?.replace(".json", "").split("-")?.pop() ?? "0"
      );
      if (isNaN(timeStarted)) timeStarted = 0;
      return {
        filename: f.Key || "{unknown}",
        filesize: f.Size || 0,
        timeStarted: timeStarted,
        timeUploaded: f.LastModified?.getTime() ?? 0,
      };
    });
    const colDefs: ColDef<FileData>[] = [
      { field: "filename", filter: true, sortable: false, flex: 1 },
      {
        field: "timeStarted",
        flex: 1,
        valueFormatter: (v) => new Date(v.data?.timeStarted ?? 0).toLocaleString(),
      },
      {
        field: "timeUploaded",
        flex: 1,
        valueFormatter: (v) =>
          new Date(v.data?.timeUploaded ?? 0).toLocaleString(),
      },
      {
        field: "filesize",
        flex: 1,
        width: 150,
        valueFormatter: (v) => getFileSizeString(v.data?.filesize),
      },
    ];

    // const gridRef = useRef<AgGridReact | null>(null);

    return (
      <CardContent className="p-4 pt-0">
        <FullHeight className="ag-theme-quartz" minus={50}>
          <AgGridReact
            className={`${loading ? "animate-pulse" : ""}`}
            // ref={gridRef}
            initialState={{
              sort: {
                sortModel: [{ colId: "timeStarted", sort: "desc" }],
              },
            }}
            onFirstDataRendered={(e) => {
              // e.api.autoSizeAllColumns();
              for (let i = 0; i < 15; i += 3) {
                setTimeout(() => {
                  // e.api.autoSizeAllColumns();
                  e.api.sizeColumnsToFit();
                }, 100 * i);
              }
            }}
            rowData={rowData}
            columnDefs={colDefs}
            pagination={true}
            // suppressPaginationPanel={true}
            alwaysShowHorizontalScroll={true}
            multiSortKey={"ctrl"}
            onRowClicked={async (e) => {
              if (!e.data) return console.error("No e.data", e);

              const manager = S3Connect.getManager();
              if (!manager) return console.error("No s3 manager");

              setLoading(true);
              useMyStore.getState().setFileName(e.data.filename);

              const arrayBuffer = await manager.getObject(e.data.filename);
              if (arrayBuffer !== undefined) {
                const enc = new TextDecoder("utf-8");
                const fileString = enc.decode(arrayBuffer as Uint8Array);
                const json = JSON.parse(fileString);
                useMyStore.getState().setFileData(json);
                useMyStore
                  .getState()
                  .popFromCallStack(useMyStore.getState().callStack.length);
              }
              setLoading(false);
            }}
          />
        </FullHeight>
      </CardContent>
    );
  };

  return (
    <div className="w-full">
      <Card
        className={clsx("w-full mx-auto transition-all duration-50 ease-in-out", {
          "max-w-sm": files === null,
          "max-w-full": files !== null,
        })}
      >
        <CardHeader>
          <CardTitle className="text-xl">
            {files === null ? "Connect to S3" : "Select file from S3"}
          </CardTitle>
          {files === null && (
            <CardDescription>Enter your AWS credentials below</CardDescription>
          )}
        </CardHeader>
        {renderForm()}
        {renderFiles()}
      </Card>
    </div>
  );
}

export default function S3FileSelect() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<null | S3.ObjectList>(null);

  const permaStoreData = useMyStore.getState().permaStore["s3FileSelect"];
  console.log("permaStoreData", permaStoreData);

  const applyPermaStoreValues =
    permaStoreData &&
    permaStoreData.inputValues &&
    loading === false &&
    files === null;

  return (
    <S3FileSelectWrapped
      loading={loading}
      setLoading={setLoading}
      files={files}
      setFiles={setFiles}
      applyPermaStoreValues={applyPermaStoreValues}
      permaStoreInputs={permaStoreData?.inputValues}
    />
  );
}
