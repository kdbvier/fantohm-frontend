import { Provider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { NetworkIds } from "src/networks";
import { NodeHelper } from "./helpers/NodeHelper";
import { MulticallProvider } from "./lib/MulticallProvider";

interface ChainDetailsOpts {
  networkName: string,
  rpcUrls: string[],
  symbol: string,
  decimals: number,
  blockExplorerUrls: string[],
  multicallAddress?: string,
}

class ChainDetails {
  readonly networkName: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly rpcUrls: string[];
  readonly blockExplorerUrls: string[];
  readonly multicallAddress?: string;
  readonly provider: Promise<Provider>;

  constructor(chainDetailsOpts: ChainDetailsOpts) {
    this.networkName = chainDetailsOpts.networkName;
    this.rpcUrls = chainDetailsOpts.rpcUrls;
    this.symbol = chainDetailsOpts.symbol;
    this.decimals = chainDetailsOpts.decimals;
    this.blockExplorerUrls = chainDetailsOpts.blockExplorerUrls;
    this.multicallAddress = chainDetailsOpts.multicallAddress;

    // Use the fastest node available
    this.provider = ChainDetails.getFastestRpcUrl(this.rpcUrls).then(rpcUrl => {
      const staticProvider = new StaticJsonRpcProvider(rpcUrl);
      if (this.multicallAddress) {
        return new MulticallProvider(this.networkName, staticProvider, this.multicallAddress);
      } else {
        return staticProvider;
      }
    });
  }

  // Return the fastest rpcUrl available
  private static async getFastestRpcUrl(rpcUrls: string[]): Promise<string> {
    return Promise.any(rpcUrls.map(rpcUrl => new Promise<string>((resolve, reject) => {
      NodeHelper.checkNodeStatus(rpcUrl).then(working => {
        if (working) {
          resolve(rpcUrl);
        } else {
          reject();
        }
      });
    })));
  }

}

interface AllChainDetails {
  [key: number]: ChainDetails
}

export const chains: AllChainDetails = {
  [NetworkIds.FantomOpera]: new ChainDetails({
    networkName: 'Fantom Opera',
    rpcUrls: [
      // this is just a test, have our node and one other
      // 'https://summer-frosty-cherry.fantom.quiknode.pro/40823c8d106b70145e5cb78de1751d9ecadc5f1d/',
      'https://rpc.ankr.com/fantom',
      'https://rpc.ftm.tools',
      'https://rpc3.fantom.network',
      'https://rpc.fantom.network',
      'https://rpcapi.fantom.network',
      'https://rpc2.fantom.network',
      // 'https://rpc.neist.io',
    ],
    symbol: 'FTM',
    decimals: 18,
    blockExplorerUrls: ['https://ftmscan.com/'],
    multicallAddress: '0xe4CC2532B2b1EC585310682af3656b2E4B6fab58',
  }),
  [NetworkIds.FantomTestnet]: new ChainDetails({
    networkName: 'Fantom testnet',
    rpcUrls: [
      'https://rpc.testnet.fantom.network/',
    ],
    decimals: 18,
    symbol: 'FTM',
    blockExplorerUrls: [],
  }),
  [NetworkIds.Moonriver]: new ChainDetails({
    networkName: 'Moonriver',
    rpcUrls: [
      // 'https://rpc.moonriver.moonbeam.network',
      'https://rpc.api.moonriver.moonbeam.network',
    ],
    symbol: 'MOVR',
    decimals: 18,
    blockExplorerUrls: ['https://blockscout.moonriver.moonbeam.network/'],
    multicallAddress: '0x43D002a2B468F048028Ea9C2D3eD4705a94e68Ae',
  }),
  [NetworkIds.MoonbaseAlpha]: new ChainDetails({
    networkName: 'Moonbase Alpha',
    rpcUrls: [
      'https://rpc.api.moonbase.moonbeam.network',
    ],
    symbol: 'DEV',
    decimals: 18,
    blockExplorerUrls: ['https://moonbase-blockscout.testnet.moonbeam.network/'],
  }),
  [NetworkIds.Ethereum]: new ChainDetails({
    networkName: 'Ethereum',
    rpcUrls: [
      'https://mainnet.infura.io/v3/84842078b09946638c03157f83405213',
    ],
    symbol: 'ETH',
    decimals: 18,
    blockExplorerUrls: ['https://etherscan.io/'],
    multicallAddress: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  }),
  [NetworkIds.Rinkeby]: new ChainDetails({
    networkName: 'Rinkeby',
    rpcUrls: [
      // 'https://rinkeby.infura.io/v3/84842078b09946638c03157f83405213',
      'https://eth-rinkeby.alchemyapi.io/v2/EWSLdTPfKsidqzm4f_kvJPaX5HI8A-D8',
    ],
    symbol: 'ETH',
    decimals: 18,
    blockExplorerUrls: ['https://rinkeby.etherscan.io/'],
  }),
  [NetworkIds.Avalanche]: new ChainDetails({
    networkName: 'Avalanche Network',
    rpcUrls: [
      'https://api.avax.network/ext/bc/C/rpc',
    ],
    symbol: 'AVAX',
    decimals: 18,
    blockExplorerUrls: ['https://snowtrace.io/'],
  }),
  [NetworkIds.Bsc]: new ChainDetails({
    networkName: 'Smart Chain',
    rpcUrls: [
      'https://bsc-dataseed.binance.org/',
    ],
    symbol: 'BNB',
    decimals: 18,
    blockExplorerUrls: ['https://bscscan.com/'],
  }),
  [NetworkIds.Boba]: new ChainDetails({
    networkName: 'BOBA L2',
    rpcUrls: [
      'https://mainnet.boba.network/',
    ],
    symbol: 'ETH',
    decimals: 18,
    blockExplorerUrls: ['https://blockexplorer.boba.network/'],
  }),
  [NetworkIds.Polygon]: new ChainDetails({
    networkName: 'MATIC',
    rpcUrls: [
      'https://rpc-mainnet.maticvigil.com',
    ],
    symbol: 'MATIC',
    decimals: 18,
    blockExplorerUrls: ['https://polygonscan.com/'],
  }),
  [NetworkIds.Harmony]: new ChainDetails({
    networkName: 'HARMONY',
    rpcUrls: [
      'https://api.harmony.one',
    ],
    symbol: 'ONE',
    decimals: 18,
    blockExplorerUrls: ['https://explorer.harmony.one/'],
  }),
  [NetworkIds.Arbitrum]: new ChainDetails({
    networkName: 'ARBITRUM',
    rpcUrls: [
      'https://arb1.arbitrum.io/rpc',
    ],
    symbol: 'AETH',
    decimals: 18,
    blockExplorerUrls: ['https://arbiscan.io'],
  }),
};
