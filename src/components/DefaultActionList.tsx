import { useShallow } from "zustand/react/shallow";
import { useMyStore } from "../store";

export default function DefaultActionList() {
  const { pushToCallStack } = useMyStore(
    useShallow((state) => ({
      pushToCallStack: state.pushToCallStack,
    }))
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <p>What do you want to start with?</p>
      <ul className="space-y-1">
        <Button t="All events" c={() => pushToCallStack(`events`, [])} />
        <Button
          t="All iterations"
          c={() => pushToCallStack(`iterations`, [])}
        />
        <div className="h-2"></div>
        <Button
          t="Run expression on events"
          c={() => pushToCallStack(`eventsExpression`, [])}
        />
        <Button
          t="Run expression on iterations"
          c={() => pushToCallStack(`iterationsExpression`, [])}
        />
      </ul>
    </div>
  );
}

function Button({ t, c }: { t: string; c?: () => void }) {
  return (
    <li>
      <span
        className="block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer"
        onClick={() => c && c()}
      >
        {t}
      </span>
    </li>
  );
}
