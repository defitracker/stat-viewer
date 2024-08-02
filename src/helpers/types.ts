export type EventEntry = {
  eventEntryId: string;
  timestamp: number;
  network: string;
  block: string;
  address: string;
  txHash: string;
  txIndex: number;
  logIndex: number;
  eventName: string;
  topic0: string;

  poolDataResolved: boolean;
  poolDataExternalResolve: boolean;
  token0: string;
  token1: string;
  token0InDb: boolean;
  token1InDb: boolean;

  token0Enabled: boolean | "N/A";
  token1Enabled: boolean | "N/A";

  token0Automation: boolean | "N/A";
  token1Automation: boolean | "N/A";

  unableToDecodeLogDataIntoAmounts: boolean;
  eventVolumeUsd: string;
  bothPricesKnown: boolean;

  token0_usdVolumeMoreThanTreshold: boolean;
  token0_usdVolumeAccumulated: string;
  token0_usdVolumeAccumulatedMoreThanTreshold: boolean;
  token0_accumulatedAeIds: string[];
  token0_alreadyTokenIterationThisBlock: boolean;
  token0_addedAsAccumulator: boolean;
  token0_madeToContinueIteration: boolean;

  token1_usdVolumeMoreThanTreshold: boolean;
  token1_usdVolumeAccumulated: string;
  token1_usdVolumeAccumulatedMoreThanTreshold: boolean;
  token1_accumulatedAeIds: string[];
  token1_alreadyTokenIterationThisBlock: boolean;
  token1_addedAsAccumulator: boolean;
  token1_madeToContinueIteration: boolean;

  skipIterBecauseOfHiddenPair: boolean;
  skipIterBecauseOfHiddenToken: boolean;
  skipIterBecauseOfBothNADisabled: boolean;

  iterations: string[];
};

export type IterationEntry = {
  iterationEntryId: string;
  parentId: string;
  networkA: string;
  networkB: string;
  tokenName: string;

  skippedBecauseOfSIKey: boolean;
  skippedBecauseOfNAGreenNetwork: boolean;

  rtQuoteHit: number;
  rtSwapHit: number;

  resQuoteErrors: string[];
  resSwapErrors: string[];

  timeForFirstGreenNetworkRes: number;
  firstReqAResCache: boolean;
  firstReqBResCache: boolean;
  firstReqAResNoLiq: boolean;
  firstReqBResNoLiq: boolean;
  firstReqAResPrice: string;
  firstReqBResPrice: string;
  greenNetwork: string;

  timeForOtherTVs: number;
  tvResDebugData: string[][];

  positiveProfitExists: boolean;
  estimatedBestTv: number;

  bestTvResDebugData: string[];
  timeForBestTvRes: number;

  allowAutomation: boolean;
  allowAutomation2: boolean;

  earlyFinishReason: string;
  totalTimeFromLog: number;
};
export type IterationEntryExt = IterationEntry & {
  timestamp: number;
  bestTvCoeff?: number;
  bestTvProfit?: number;
};

export type EventEntries = {
  [id: string]: EventEntry;
};
export type IterationEntries = {
  [id: string]: IterationEntry;
};

export type FileData = {
  eventEntries: EventEntries;
  iterationEntries: IterationEntries;
};
