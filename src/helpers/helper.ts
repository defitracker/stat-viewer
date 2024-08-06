export function getExplorerUrl(network: string) {
  switch (network) {
    case "Ethereum":
      return "https://etherscan.io";
    case "Binance":
      return "https://bscscan.com";
    case "Arbitrum":
      return "https://arbiscan.io";
    case "Polygon":
      return "https://polygonscan.com";
    case "Base":
      return "https://basescan.org";
    case "Solana":
      return "https://solscan.io"
    case "Snowtrace":
      return "https://snowtrace.io"
    case "Optimism":
      return "https://optimistic.etherscan.io"
    case "Gnosis":
      return "https://gnosisscan.io"
  }
}
