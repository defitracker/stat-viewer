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
  }
}
