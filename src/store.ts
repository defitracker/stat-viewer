import { create } from "zustand";
import { FileData } from "./types";

interface State {
  fileData: FileData | null;
  setFileData: (data: FileData) => void;

  fileName: string;
  setFileName: (data: string) => void;

  callStack: { fName: string; params: any[] }[];
  pushToCallStack: (fName: string, params: any[]) => void;
  popFromCallStack: (num: number) => void;
}

export const useMyStore = create<State>()((set) => ({
  fileData: null,
  setFileData: (data) => set((state) => ({ fileData: data })),

  fileName: "",
  setFileName: (data) => set((state) => ({ fileName: data })),

  callStack: [],
  pushToCallStack: (fName, params) =>
    set((state) => ({ callStack: [...state.callStack, { fName, params }] })),
  popFromCallStack: (num) =>
    set((state) => ({
      callStack: state.callStack.slice(
        0,
        Math.max(state.callStack.length - num, 0)
      ),
    })),
}));
