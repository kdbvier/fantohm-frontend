import React from "react";

import { ReactComponent as FantomIcon } from "src/assets/networks/fantom_icon.svg";
import { ReactComponent as RinkebyIcon } from "src/assets/networks/rinkeby_icon.svg";
import { ReactComponent as MoonriverIcon } from "src/assets/networks/moonriver_icon.svg";
import { ReactComponent as MoonbaseAlphaIcon } from "src/assets/networks/moonbase_alpha_icon.svg";
import { ReactComponent as EthereumIcon } from "src/assets/networks/ethereum_icon.svg";
import { ReactComponent as BscIcon } from "src/assets/networks/bsc_icon.svg";
import { ReactComponent as AvalancheIcon } from "src/assets/networks/avalanche_icon.svg";
import { ReactComponent as PolygonIcon } from "src/assets/networks/polygon_icon.svg";
import { ReactComponent as HarmonyIcon } from "src/assets/networks/harmony_icon.svg";
import { ReactComponent as ArbitrumIcon } from "src/assets/networks/arbitrum_icon.svg";
import { dark as darkTheme } from "src/themes/dark.js";
import { river as riverTheme } from "src/themes/river.js";
import { DebugHelper } from "./helpers/DebugHelper";

export type NetworkId = number;

export enum NetworkIds {
  Ethereum = 1,
  Rinkeby = 4,
  Bsc = 56,
  FantomOpera = 250,
  FantomTestnet = 4002,
  Moonriver = 1285,
  MoonbaseAlpha = 1287,
  Boba = 288,
  Avalanche = 43114,
  Polygon = 137,
  Harmony = 1666600000,
  Arbitrum = 42161,
}

// TODO once for a while update block times, use yesterday's value as today is not complete day
// https://ftmscan.com/chart/blocktime
// https://moonscan.io/chart/blocktime

interface INetwork {
  name: string,
  logo: React.ReactNode,
  theme: React.ReactNode,
  isEnabled: boolean,
  isTestNet: boolean,
  blocktime: number, // NOTE could get this from an outside source since it changes slightly over time
  epochBlock: number,
  epochInterval: number,
  blockCountdownUrl: (block: number) => string,
  getEtherscanUrl: (txnHash: string) => string,
  getPoolTogetherUrls: (contractAddress: string) => string[],
  poolGraphUrl: string,
  liquidityPoolReserveDecimals: {
    token0Decimals: number,
    token1Decimals: number,
  },
  addresses: { [key: string]: string }
}

interface INetworks {
  [key: string]: INetwork;
}

export const networks: INetworks = {
  [NetworkIds.FantomOpera]: {
    name: 'Fantom',
    logo: FantomIcon,
    theme: darkTheme,
    isEnabled: true,
    isTestNet: false,
    epochBlock: 20187783,
    blocktime: 0.867, // https://ftmscan.com/chart/blocktime
    epochInterval: 28800,
    blockCountdownUrl: (block) => `https://ftmscan.com/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://ftmscan.com/tx/" + txnHash,
    getPoolTogetherUrls: (contractAddress) => [
      `https://community.pooltogether.com/pools/mainnet/${contractAddress}/home`,
      `https://community.pooltogether.com/pools/mainnet/${contractAddress}/manage#stats`,
    ],
    poolGraphUrl: "https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_4_3",
    liquidityPoolReserveDecimals: {
      token0Decimals: 18,
      token1Decimals: 9,
    },
    addresses: {
      OHM_ADDRESS: "0xfa1FBb8Ef55A4855E5688C0eE13aC3f202486286",
      STAKING_ADDRESS: "0xcb9297425C889A7CbBaa5d3DB97bAb4Ea54829c2", // The new staking contract
      STAKING_HELPER_ADDRESS: "0x068e87aa1eABEBBad65378Ede4B5C16E75e5a671", // Helper contract used for Staking only
      SOHM_ADDRESS: "0x5E983ff70DE345de15DbDCf0529640F14446cDfa",
      PRESALE_ADDRESS: "0xcBb60264fe0AC96B0EFa0145A9709A825afa17D8",
      AOHM_ADDRESS: "0x24ecfd535675f36ba1ab9c5d39b50dc097b0792e",
      DISTRIBUTOR_ADDRESS: "0xCD12666f754aCefa1ee5477fA809911bAB915aa0",
      BONDINGCALC_ADDRESS: "0xf7595d3D87D976CA011E89Ca6A95e827E31Dd581",
      CIRCULATING_SUPPLY_ADDRESS: "0x59EC309001Ec92879790dbdd94d9180B8bCAe908",
      TREASURY_ADDRESS: "0xA3b52d5A6d2f8932a5cD921e09DA840092349D71",
      DAO_ADDRESS: "0xD4aC626A1F87b5955f78FF86237DB055e62D43a0",
      CRUCIBLE_OHM_LUSD: "0x2230ad29920D61A535759678191094b74271f373",
      LQTY: "0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d",
      MIST: "0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab",
      REDEEM_HELPER_ADDRESS: "0xF709c33F84Da692f76F035e51EE660a456196A67",
      FUSE_6_SOHM: "0x59bd6774c22486d9f4fab2d448dce4f892a9ae25", // Tetranode's Locker
      FUSE_18_SOHM: "0x6eDa4b59BaC787933A4A21b65672539ceF6ec97b", // Olympus Pool Party
      PT_TOKEN_ADDRESS: "0x0E930b8610229D74Da0A174626138Deb732cE6e9", // 33T token address, taken from `ticket` function on PRIZE_STRATEGY_ADDRESS
      PT_PRIZE_POOL_ADDRESS: "0xEaB695A8F5a44f583003A8bC97d677880D528248", // NEW
      PT_PRIZE_STRATEGY_ADDRESS: "0xf3d253257167c935f8C62A02AEaeBB24c9c5012a", // NEW
      MARKET_PRICE_LP_ADDRESS: "0xd77fc9c4074b56ecf80009744391942fbfddd88b",
      WSOHM_ADDRESS: "0x73199ba57BBFe82a935B9C95850395d80a400937",
      USDB_ADDRESS: "0x6Fc9383486c163fA48becdEC79d6058f984f62cA",
      USDB_MINTER: "0xe036823Fa26455D9DF0e3ed5Ec287a19356941e3",
      FHUD_ADDRESS: "0x18F7f88BE24a1d1d0a4E61B6Ebf564225398adb0",
    }
  },
  [NetworkIds.FantomTestnet]: {
    name: 'Fantom Testnet',
    logo: FantomIcon,
    theme: darkTheme,
    isEnabled: DebugHelper.isActive('enable-testnet'),
    isTestNet: true,
    blocktime: 3.589,
    epochBlock: 6617987,
    epochInterval: 2880,
    blockCountdownUrl: (block) => `https://testnet.ftmscan.com/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://testnet.ftmscan.com/tx/" + txnHash,
    getPoolTogetherUrls: (contractAddress) => [
      `https://community.pooltogether.com/pools/rinkeby/${contractAddress}/home`,
      `https://community.pooltogether.com/pools/rinkeby/${contractAddress}/manage#stats`,
    ],
    poolGraphUrl: "https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v3_4_3",
    liquidityPoolReserveDecimals: {
      token0Decimals: 18,
      token1Decimals: 9,
    },
    addresses: {
      OHM_ADDRESS: "0x4B209fd2826e6880e9605DCAF5F8dB0C2296D6d2",
      STAKING_ADDRESS: "0x1cED6A6253388A56759da72F16D16544577D4dB7",
      STAKING_HELPER_ADDRESS: "0x51d763baa5F18252a6A5CAd441c34d56f3731e96",
      SOHM_ADDRESS: "0x892bca2C0c2C2B244a43289885732a356Fde84cE",
      DISTRIBUTOR_ADDRESS: "0x68896113FCCa7c277e54a76975EEBA06394f5007",
      BONDINGCALC_ADDRESS: "0x3929699b5a68B20D6d6315d02112549638312F1F",
      CIRCULATING_SUPPLY_ADDRESS: "0xE296B1A262b7Ab6395c5609cA5440AE9E0a1E468",
      TREASURY_ADDRESS: "0xB58E41fadf1bebC1089CeEDbbf7e5E5e46dCd9b9",
      DAO_ADDRESS: "0xD4aC626A1F87b5955f78FF86237DB055e62D43a0",
      REDEEM_HELPER_ADDRESS: "0xE827c1D2da22496A09055140c2454c953710751C",
      PT_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000000", // 33T token address, taken from `ticket` function on PRIZE_STRATEGY_ADDRESS
      PT_PRIZE_POOL_ADDRESS: "0x0000000000000000000000000000000000000000", // NEW
      PT_PRIZE_STRATEGY_ADDRESS: "0x0000000000000000000000000000000000000000", // NEW
      MARKET_PRICE_LP_ADDRESS: "0x076B1c0A1f4CA76C1AAB1c3E86cd5110fEec3eCB",
      WSOHM_ADDRESS: "0x2FD0fF45263143DcD616EcADa45c0D22e49aDBB7",
      USDB_ADDRESS: "0xD40f6eDc014b42cF678D7eeF4A1310EEe229C50f",
      USDB_MINTER: "0xe036823Fa26455D9DF0e3ed5Ec287a19356941e3",
      FHUD_ADDRESS: "0x18F7f88BE24a1d1d0a4E61B6Ebf564225398adb0",
      // staking warmup: 0x312DBa92153E931D91c5e75870Dbc62E2DCD21AC
      // staking warmup manager: 0x8D4603d7302f2F962CCf6044A6AC2Dfd812B92bE
      // FHUD Minter: 0xA3b5fE35db679D21af9a499EE88231Ea9B656Cb8
      // mock oracle: 0xB85a387b0DfBFA6BAf834118C5478D9a8D418322
    }
  },
  [NetworkIds.Moonriver]: {
    name: 'Moonriver',
    logo: MoonriverIcon,
    theme: riverTheme,
    isEnabled: true,
    isTestNet: false,
    blocktime: 21.46, // https://moonriver.moonscan.io/chart/blocktime
    epochBlock: 979500,
    epochInterval: 1960,
    blockCountdownUrl: (block) => `https://moonriver.moonscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://moonriver.moonscan.io/tx/" + txnHash,
    getPoolTogetherUrls: (contractAddress) => [
      `https://community.pooltogether.com/pools/rinkeby/${contractAddress}/home`,
      `https://community.pooltogether.com/pools/rinkeby/${contractAddress}/manage#stats`,
    ],
    liquidityPoolReserveDecimals: {
      token0Decimals: 6,
      token1Decimals: 9,
    },
    poolGraphUrl: "https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v3_4_3",
    addresses: {
      OHM_ADDRESS: "0xfa1FBb8Ef55A4855E5688C0eE13aC3f202486286",
      STAKING_ADDRESS: "0xF5C7D63C5Fc0aD4b7Cef7d8904239860725Ebc87",
      STAKING_HELPER_ADDRESS: "0xCD12666f754aCefa1ee5477fA809911bAB915aa0",
      SOHM_ADDRESS: "0x1888BB30f9EdD63b265942F3E3D061F186f38079",
      DISTRIBUTOR_ADDRESS: "0xA3b52d5A6d2f8932a5cD921e09DA840092349D71",
      BONDINGCALC_ADDRESS: "0x71b967717e90E66E2EFa399910d46FF7A6ed2A45",
      CIRCULATING_SUPPLY_ADDRESS: "0x9DC084Fd82860cDb4ED2b2BF59F1076F47B03Bd6",
      TREASURY_ADDRESS: "0x5E983ff70DE345de15DbDCf0529640F14446cDfa",
      REDEEM_HELPER_ADDRESS: "0x64eaB56A4cD1D48EE15263f177529C9B7547D449",
      DAO_ADDRESS: "0xD4aC626A1F87b5955f78FF86237DB055e62D43a0",
      PT_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000000",
      PT_PRIZE_POOL_ADDRESS: "0x0000000000000000000000000000000000000000",
      PT_PRIZE_STRATEGY_ADDRESS: "0x0000000000000000000000000000000000000000",
      BRIDGE_TOKEN_ADDRESS: "0x147DBAE284BBd624b7b5a98Dc862E21e8857446d",
      BRIDGE_ADDRESS: "0xcb9297425C889A7CbBaa5d3DB97bAb4Ea54829c2",
      MARKET_PRICE_LP_ADDRESS: "0x0b6116bb2926d996cdeba9e1a79e44324b0401c9",
      WSOHM_ADDRESS: "0x9051c67790f6ABBF464a023ff6A85D678c20e3CA",
      USDB_ADDRESS: "0x3E193c39626BaFb41eBe8BDd11ec7ccA9b3eC0b2",
    }
  },
  [NetworkIds.MoonbaseAlpha]: {
    name: 'Moonbase Alpha',
    logo: MoonbaseAlphaIcon,
    theme: riverTheme,
    isEnabled: DebugHelper.isActive('enable-testnet'),
    isTestNet: true,
    blocktime: 21.46,
    epochBlock: 979500,
    epochInterval: 1960,
    blockCountdownUrl: (block) => `https://moonbase.moonscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://moonbase.moonscan.io/tx/" + txnHash,
    getPoolTogetherUrls: (contractAddress) => [
      `https://community.pooltogether.com/pools/rinkeby/${contractAddress}/home`,
      `https://community.pooltogether.com/pools/rinkeby/${contractAddress}/manage#stats`,
    ],
    liquidityPoolReserveDecimals: {
      token0Decimals: 6,
      token1Decimals: 9,
    },
    poolGraphUrl: "https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v3_4_3",
    addresses: {
      // KFC's hidden testnet
      // OHM_ADDRESS: "0x29a3f7E3E4925FC576d77b115E4F7327307bf018",
      // STAKING_ADDRESS: "0x1E79020Edb8872bd90fA73781b97862Da6f0D45e",
      // STAKING_HELPER_ADDRESS: "0x0bB56b553cc2Ff6A24aAbD67758D5aE0840AE560",
      // SOHM_ADDRESS: "0xddAec4ac3510a3d38fDDd927217bFAb1cE069060",
      // DISTRIBUTOR_ADDRESS: "0xEb794D088e7DF7360c94993Ba6619420F9d18B0B",
      // BONDINGCALC_ADDRESS: "0x3cd4a4A5c13e93ac354b9Aa1Ac48ba53078Ba5EA",
      // CIRCULATING_SUPPLY_ADDRESS: "0x732a5b7E41F1b1338B5cD5366ee77497a94aEb9B",
      // TREASURY_ADDRESS: "0xcAa0EB441b18976EE4Dc3915c5dFb2124EDC69a4",
      // REDEEM_HELPER_ADDRESS: "0xE0A28434c4093a1D6F820331e4E5DC03cE1C23Bd",

      // pwntron's hidden testnet
      OHM_ADDRESS: "0x471D67Af380f4C903aD74944D08cB00d0D07853a",
      STAKING_ADDRESS: "0xcafBA8D8cc502b3A6Ec9CDB4201F8cAEFC542838",
      STAKING_HELPER_ADDRESS: "0x8984d3edCa588DEa900658095A6de0A2cC93f9aD",
      SOHM_ADDRESS: "0x2575633c713578a99D51317e2424d4CAbfda2cc2",
      DISTRIBUTOR_ADDRESS: "0x0EC3feb9E51E6E9d108B785348bceE05399C71EC",
      BONDINGCALC_ADDRESS: "0xb5c44B5819EB994b18cF2df2302f5e1B12312752",
      CIRCULATING_SUPPLY_ADDRESS: "0xA405d1591BF3c9bFf25135eF8A6Bea10A984529e",
      TREASURY_ADDRESS: "0x6039910e36D1f5823f88006eeaC13d0A486Aa0Bc",
      REDEEM_HELPER_ADDRESS: "0x6f0E8115d0a12D2D4c6DbA358F69110fff7c33e2",
      DAO_ADDRESS: "0x63A77B78A95ae8683ed23a92a563f514796Ca1e0",
      PT_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000000",
      PT_PRIZE_POOL_ADDRESS: "0x0000000000000000000000000000000000000000",
      PT_PRIZE_STRATEGY_ADDRESS: "0x0000000000000000000000000000000000000000",
      MARKET_PRICE_LP_ADDRESS: "0x0000000000000000000000000000000000000000",
      BRIDGE_TOKEN_ADDRESS: "0x652648562f233c95e4e8de417f8e99f4188649ef",
      BRIDGE_ADDRESS: "0x688d514e98bbc32FdCD8Ab2197eFF203A13dD7A1",
      WSOHM_ADDRESS: "0xefa60366a9C414A584375721125a8A42aDb663C0",
      USDB_ADDRESS: "0x0000000000000000000000000000000000000000",
    }
  },
  [NetworkIds.Rinkeby]: {
    name: 'Rinkeby Testnet',
    logo: RinkebyIcon,
    theme: darkTheme,
    isEnabled: DebugHelper.isActive('enable-testnet'),
    isTestNet: true,
    blocktime: 15.01,
    epochBlock: 10112184,
    epochInterval: 687,
    blockCountdownUrl: (block) => `https://rinkeby.etherscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://rinkeby.etherscan.io/tx/" + txnHash,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v3_4_3",
    liquidityPoolReserveDecimals: {
      token0Decimals: 9,
      token1Decimals: 18,
    },
    addresses: {
      OHM_ADDRESS: "0x9DC084Fd82860cDb4ED2b2BF59F1076F47B03Bd6",
      STAKING_ADDRESS: "0xf7595d3D87D976CA011E89Ca6A95e827E31Dd581",
      STAKING_HELPER_ADDRESS: "0xcb9297425C889A7CbBaa5d3DB97bAb4Ea54829c2",
      SOHM_ADDRESS: "0xF5C7D63C5Fc0aD4b7Cef7d8904239860725Ebc87",
      DISTRIBUTOR_ADDRESS: "0xA3b52d5A6d2f8932a5cD921e09DA840092349D71",
      BONDINGCALC_ADDRESS: "0x64eaB56A4cD1D48EE15263f177529C9B7547D449",
      CIRCULATING_SUPPLY_ADDRESS: "0x88162eb8f6347B9Bb31B4A35434E0C0d5CbD5FE6",
      TREASURY_ADDRESS: "0x686AcF5A89d09D936B09e5a5a64Dd6B241CD20c6",
      DAO_ADDRESS: "0xD4aC626A1F87b5955f78FF86237DB055e62D43a0",
      REDEEM_HELPER_ADDRESS: "0xdaE326522C63aad3AeB94be79a0C55e30435d054",
      PT_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000000", // 33T token address, taken from `ticket` function on PRIZE_STRATEGY_ADDRESS
      PT_PRIZE_POOL_ADDRESS: "0x0000000000000000000000000000000000000000", // NEW
      PT_PRIZE_STRATEGY_ADDRESS: "0x0000000000000000000000000000000000000000", // NEW
      MARKET_PRICE_LP_ADDRESS: "0xfb7f259e16ce5c3706dfffd0ab73033f58c6ce21",
      WSOHM_ADDRESS: "0x0bEd9f95b3fEEf5672b10693cF7ed7b78F021793",
      USDB_ADDRESS: "0xE827c1D2da22496A09055140c2454c953710751C",
      // staking warmup: 0xCD12666f754aCefa1ee5477fA809911bAB915aa0
      // staking warmup manager: 0xeD1f984502f8773Ec950E2D006781D7ce33CEEE4
      // FHUD Minter: 0x139ffDD962A2d8D498a92aB33b31ed78397cbae2
      // twap oracle: 0xc9ca91fe0667bafd4289e082088e41ed86471d79
    }
  },
  [NetworkIds.Ethereum]: {
    name: 'Ethereum',
    logo: EthereumIcon,
    theme: darkTheme,
    isEnabled: true,
    isTestNet: true,
    blocktime: 13.25,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://etherscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://etherscan.io/tx/" + txnHash,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "https://api.thegraph.com/subgraphs/name/pooltogether/ethereum-v3_4_3",
    liquidityPoolReserveDecimals: {
      token0Decimals: 9,
      token1Decimals: 18,
    },
    addresses: {
    }
  },
  [NetworkIds.Bsc]: {
    name: 'BSC',
    logo: BscIcon,
    theme: darkTheme,
    isEnabled: true,
    isTestNet: true,
    blocktime: 3,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://bscscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://bscscan.io/tx/" + txnHash,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "https://api.thegraph.com/subgraphs/name/pooltogether/bsc-v3_4_3",
    liquidityPoolReserveDecimals: {
      token0Decimals: 9,
      token1Decimals: 18,
    },
    addresses: {
    }
  },
  [NetworkIds.Avalanche]: {
    name: 'Avalanche',
    logo: AvalancheIcon,
    theme: darkTheme,
    isEnabled: true,
    isTestNet: true,
    blocktime: 402,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://snowtrace.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://snowtrace.io/tx/" + txnHash,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
    liquidityPoolReserveDecimals: {
      token0Decimals: 9,
      token1Decimals: 18,
    },
    addresses: {
    }
  },
  [NetworkIds.Polygon]: {
    name: 'Polygon',
    logo: PolygonIcon,
    theme: darkTheme,
    isEnabled: true,
    isTestNet: true,
    blocktime: 2.35,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://polygonscan.com/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://polygonscan.com/tx/" + txnHash,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
    liquidityPoolReserveDecimals: {
      token0Decimals: 9,
      token1Decimals: 18,
    },
    addresses: {
    }
  },
  [NetworkIds.Harmony]: {
    name: 'Harmony',
    logo: HarmonyIcon,
    theme: darkTheme,
    isEnabled: true,
    isTestNet: true,
    blocktime: 2,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://explorer.harmony.one/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://explorer.harmony.one/tx/" + txnHash,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
    liquidityPoolReserveDecimals: {
      token0Decimals: 9,
      token1Decimals: 18,
    },
    addresses: {
    }
  },
  [NetworkIds.Arbitrum]: {
    name: 'Arbitrum',
    logo: ArbitrumIcon,
    theme: darkTheme,
    isEnabled: true,
    isTestNet: true,
    blocktime: 1.2,
    epochBlock: 0,
    epochInterval: 0,
    blockCountdownUrl: (block) => `https://arbiscan.io/block/countdown/${block}`,
    getEtherscanUrl: (txnHash) => "https://arbiscan.io/tx/" + txnHash,
    getPoolTogetherUrls: () => [],
    poolGraphUrl: "",
    liquidityPoolReserveDecimals: {
      token0Decimals: 9,
      token1Decimals: 18,
    },
    addresses: {
    }
  },
};

export const enabledNetworkIds: NetworkId[] = Object.keys(networks).map(networkId => parseInt(networkId)).filter(networkId => networks[networkId].isEnabled);
export const enabledNetworkIdsExceptDexOnly: NetworkId[] = Object.keys(networks).map(networkId => parseInt(networkId)).filter(networkId => networks[networkId].isEnabled && networkId !== NetworkIds.Bsc && networkId !== NetworkIds.Ethereum && networkId !== NetworkIds.Avalanche && networkId !== NetworkIds.Polygon && networkId !== NetworkIds.Harmony && networkId !== NetworkIds.Arbitrum);
export const enabledMainNetworkIds: NetworkId[] = enabledNetworkIds.filter(networkId => !networks[networkId].isTestNet);
