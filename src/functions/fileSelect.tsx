import FileSelect from "@/components/FileSelect";
import S3FileSelect from "@/components/S3FileSelect";

export function fileSelect(csi: number) {
  return (
    <div className="flex flex-col gap-4">
      <FileSelect />
      <S3FileSelect />
    </div>
  );
}
