import { useMyStore } from "../store";

export default function DefaultActionList() {
  const { pushToCallStack } = useMyStore((state) => ({
    pushToCallStack: state.pushToCallStack,
  }));

  return (
    <ul className="space-y-1">
      <Button
        t="All iterations"
        c={() => pushToCallStack(`iterations`, [])}
      />
      <Button
        t="Iterations sorted by profit"
        c={() => pushToCallStack(`itersByProfit`, [])}
      />
    </ul>
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
