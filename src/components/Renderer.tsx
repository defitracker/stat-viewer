import { functions } from "../functions/index";
import { useMyStore } from "../helpers/store";
import { useShallow } from "zustand/react/shallow";
import Home from "./Home";

export default function Renderer() {
  const { callStack } = useMyStore(
    useShallow((state) => ({
      callStack: state.callStack,
    }))
  );

  if (callStack.length === 0) {
    return <Home />;
  }

  const callStackItem = callStack[callStack.length - 1];
  const { fName, params } = callStackItem;
  const csi = callStack.length - 1;

  if (Object.prototype.hasOwnProperty.call(functions, fName)) {
    // @ts-ignore
    const element = functions[fName as keyof typeof functions](
      csi,
      // @ts-ignore
      ...params
    );
    return element;
  }

  return <p>Nothing found :(</p>;
}
