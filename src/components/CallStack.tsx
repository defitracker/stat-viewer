import { useMyStore } from "../store";

export default function CallStack() {
  const { callStack, popFromCallStack } = useMyStore((state) => ({
    callStack: state.callStack,
    popFromCallStack: state.popFromCallStack,
  }));

  return (
    <div className="flex items-center py-4 overflow-x-auto whitespace-nowrap">
      <span
        className="text-gray-600 dark:text-gray-200 cursor-pointer"
        onClick={() => {
          popFromCallStack(callStack.length);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      </span>
      {callStack.map((v, idx) => {
        return (
          <Item
            t={`${v.fName}(${v.params.length > 0 ? ".." : ""})`}
            c={
              idx === callStack.length - 1
                ? undefined
                : () => {
                    const numToPop = callStack.length - 1 - idx;
                    popFromCallStack(numToPop);
                  }
            }
          />
        );
      })}
    </div>
  );
}

function Item({ t, c }: { t: string; c?: () => void }) {
  return (
    <>
      <span className="mx-3 text-gray-500 dark:text-gray-300 rtl:-scale-x-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </span>

      <span
        className={`dark:text-blue-400 ${
          c ? "text-blue-500 hover:underline cursor-pointer" : "text-gray-500"
        }`}
        onClick={() => {
          c && c();
        }}
      >
        {t}
      </span>
    </>
  );
}
