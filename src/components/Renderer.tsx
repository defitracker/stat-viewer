import { functions } from "../functions/index";
import { useMyStore } from "../store";
import { useShallow } from "zustand/react/shallow";
import DefaultActionList from "./DefaultActionList";

export default function Renderer() {
  const { callStack } = useMyStore(
    useShallow((state) => ({
      callStack: state.callStack,
    }))
  );

  if (callStack.length === 0) {
    return <DefaultActionList />;
  }

  const callStackItem = callStack[callStack.length - 1];
  const { fName, params } = callStackItem;
  const csi = callStack.length - 1;

  console.log("Renderer rerender")

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
