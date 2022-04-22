import { ReactComponent as EthImg } from "src/assets/tokens/ETH.svg";
import { ReactComponent as LunaImg } from "src/assets/tokens/LUNA.svg";
import { ReactComponent as MemoImg } from "src/assets/tokens/MEMO.svg";
import { ReactComponent as MovrImg } from "src/assets/tokens/MOVR.svg";
import { ReactComponent as BtcImg } from "src/assets/tokens/wBTC.svg";
import { ReactComponent as GohmImg } from "src/assets/tokens/gOHM.svg";
import { ReactComponent as MaticImg } from "src/assets/tokens/MATIC.svg";
import { ReactComponent as BobaImg } from "src/assets/tokens/BOBA.svg";
import { ReactComponent as DotImg } from "src/assets/tokens/DOT.svg";
import { ReactComponent as DuskImg } from "src/assets/tokens/DUSK.svg";
import { ReactComponent as QntImg } from "src/assets/tokens/QNT.svg";
import { ReactComponent as QuartzImg } from "src/assets/tokens/QUARTZ.svg";
import { ReactComponent as VaderImg } from "src/assets/tokens/VADER.svg";
import { ReactComponent as TombFtmImg } from "src/assets/tokens/TOMB-FTM.svg";
import { ReactComponent as LqdrFtmImg } from "src/assets/tokens/LQDR-FTM.svg";
import { ReactComponent as BeetsFtmImg } from "src/assets/tokens/BEETS-FTM.svg";
import { ReactComponent as FhudImg } from "src/assets/tokens/FHUD.svg";
import { ReactComponent as UsdbImg } from "src/assets/tokens/USDB.svg";
import { ReactComponent as DaiImg } from "src/assets/tokens/DAI.svg";
import { ReactComponent as SpiritLinspiritImg } from "src/assets/tokens/SPIRIT-LINSPIRIT.svg";
import { CustomInvestment, HistoricPrices, TokenInvestment } from "src/lib/Investment";
import { getCoingeckoTokenPrice, getHistoricTokenPrice, getTokenPrice, roundToNearestHour } from "./index";
import { NetworkIds } from "src/networks";
import { chains } from "src/providers";
import { ethers } from "ethers";
import { abi as ierc20Abi } from "src/abi/IERC20.json";
import { abi as wMemoAbi } from "src/abi/wMEMO.json";
import { abi as gOHMAbi } from "src/abi/gohm.json";
import { abi as UniswapV2Pair } from "src/abi/UniswapV2Pair.json";
import { abi as TShareRewardPool } from "src/abi/TShareRewardPool.json";
import { abi as TombMasonry } from "src/abi/TombMasonry.json";
import { abi as MasterChefLqdr } from "src/abi/MasterChefLqdr.json";
import { abi as MasterChefBeets } from "src/abi/MasterChefBeets.json";
import { abi as BalancerVault } from "src/abi/BalancerVault.json";
import { abi as BalancerWeightedPool } from "src/abi/BalancerWeightedPool.json";

export const weth = new TokenInvestment({
  name: "weth",
  displayName: "wETH",
  decimals: 18,
  isLp: false,
  tokenIcon: EthImg,
  chainId: NetworkIds.Ethereum,
  chainName: "ethereum",
  contractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  daoAddress: "0x66a98CfCd5A0dCB4E578089E1D89134A3124F0b1",
});

export const wmemo = new TokenInvestment({
  name: "wmemo",
  displayName: "wMEMO",
  decimals: 18,
  isLp: false,
  tokenIcon: MemoImg,
  chainId: NetworkIds.FantomOpera,
  chainName: "fantom",
  contractAddress: "0xDDc0385169797937066bBd8EF409b5B3c0dFEB52",
  daoAddress: "0x34F93b12cA2e13C6E64f45cFA36EABADD0bA30fC",
  customAssetPriceFunc: async function (this: CustomInvestment) {
    const timePrice = await getTokenPrice("wonderland");

    // Convert wMemo balance to memo balance
    const avaxProvider = await chains[NetworkIds.Avalanche].provider;
    const avaxWmemoAddress = "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b";
    const avaxWmemoContract = new ethers.Contract(avaxWmemoAddress, wMemoAbi, avaxProvider);
    const oneWMemo = "1000000000000000000";
    const memoPerWMemo = (await avaxWmemoContract.wMEMOToMEMO(oneWMemo)) / Math.pow(10, 9);

    return timePrice * memoPerWMemo;
  },
  customHistoricPricesFunc: async function (this: TokenInvestment) {
    const timeHistoricPrices = await getHistoricTokenPrice('avalanche', '0xb54f16fb19478766a268f172c9480f8da1a7c9c3');

    // Convert wMemo balance to memo balance
    const avaxProvider = await chains[NetworkIds.Avalanche].provider;
    const avaxWmemoAddress = "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b";
    const avaxWmemoContract = new ethers.Contract(avaxWmemoAddress, wMemoAbi, avaxProvider);
    const oneWMemo = "1000000000000000000";
    const memoPerWMemo = (await avaxWmemoContract.wMEMOToMEMO(oneWMemo)) / Math.pow(10, 9);

    Object.keys(timeHistoricPrices).forEach(timestamp => timeHistoricPrices[timestamp] *= memoPerWMemo);
    return new HistoricPrices(timeHistoricPrices);
  },
});

export const luna = new TokenInvestment({
  name: "luna",
  displayName: "LUNA",
  decimals: 18,
  isLp: false,
  tokenIcon: LunaImg,
  chainId: NetworkIds.Ethereum,
  chainName: "ethereum",
  contractAddress: "0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9",
  daoAddress: "0x66a98CfCd5A0dCB4E578089E1D89134A3124F0b1",
});

export const movr = new TokenInvestment({
  name: "movr",
  displayName: "MOVR",
  decimals: 18,
  isLp: false,
  tokenIcon: MovrImg,
  chainId: NetworkIds.Moonriver,
  chainName: "moonriver",
  contractAddress: "0x98878B06940aE243284CA214f92Bb71a2b032B8A",
  daoAddress: "0xE3CD5475f18a97D3563307B4e1A6467470237927",
});

export const btc = new TokenInvestment({
  name: "wbtc",
  displayName: "wBTC",
  decimals: 8,
  isLp: false,
  tokenIcon: BtcImg,
  chainId: NetworkIds.Ethereum,
  chainName: "ethereum",
  contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  daoAddress: "0x66a98CfCd5A0dCB4E578089E1D89134A3124F0b1"
});

export const ohm = new TokenInvestment({
  name: "gohm",
  displayName: "gOHM",
  decimals: 18,
  isLp: false,
  tokenIcon: GohmImg,
  chainId: NetworkIds.Ethereum,
  chainName: "ethereum",
  contractAddress: "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f",
  daoAddress: "0x66a98CfCd5A0dCB4E578089E1D89134A3124F0b1",
  customAssetPriceFunc: async function (this: TokenInvestment) {
    const ohmPrice = await getTokenPrice("olympus");
    // Get gohm balance
    const ethProvider = await chains[NetworkIds.Ethereum].provider;
    const gohmAddress = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
    const gohmContract = new ethers.Contract(gohmAddress, gOHMAbi, ethProvider);
    const index = (await gohmContract.index()) / Math.pow(10, 9);

    return ohmPrice * index;
  },
});

export const matic = new TokenInvestment({
  name: "matic",
  displayName: "MATIC",
  decimals: 18,
  isLp: false,
  tokenIcon: MaticImg,
  chainId: NetworkIds.Ethereum,
  chainName: "ethereum",
  contractAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  daoAddress: "0x66a98CfCd5A0dCB4E578089E1D89134A3124F0b1"
});

export const dusk = new TokenInvestment({
  name: "dusk",
  displayName: "DUSK",
  decimals: 18,
  isLp: false,
  tokenIcon: DuskImg,
  chainId: NetworkIds.Ethereum,
  chainName: "ethereum",
  contractAddress: "0x940a2db1b7008b6c776d4faaca729d6d4a4aa551",
  daoAddress: "0x66a98CfCd5A0dCB4E578089E1D89134A3124F0b1"
});

export const qnt = new TokenInvestment({
  name: "qnt",
  displayName: "QNT",
  decimals: 18,
  isLp: false,
  tokenIcon: QntImg,
  chainId: NetworkIds.Ethereum,
  chainName: "ethereum",
  contractAddress: "0x4a220E6096B25EADb88358cb44068A3248254675",
  daoAddress: "0x66a98CfCd5A0dCB4E578089E1D89134A3124F0b1"
});

export const quartz = new TokenInvestment({
  name: "quartz",
  displayName: "QUARTZ",
  decimals: 18,
  isLp: false,
  tokenIcon: QuartzImg,
  chainId: NetworkIds.Ethereum,
  chainName: "ethereum",
  contractAddress: "0xbA8A621b4a54e61C442F5Ec623687e2a942225ef",
  daoAddress: "0x66a98CfCd5A0dCB4E578089E1D89134A3124F0b1"
});

export const dot = new TokenInvestment({
  name: "dot",
  displayName: "DOT",
  decimals: 18,
  isLp: false,
  tokenIcon: DotImg,
  chainId: NetworkIds.Bsc,
  chainName: "binance-smart-chain",
  contractAddress: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
  daoAddress: "0x3538Acb37Cf5a92eBE7091714975b2f8dDd5c6C1"
});

export const boba = new TokenInvestment({
  name: "boba",
  displayName: "BOBA",
  decimals: 18,
  isLp: false,
  tokenIcon: BobaImg,
  chainId: NetworkIds.Boba,
  chainName: "boba-network",
  contractAddress: "0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7",
  daoAddress: "0x3381e86306145b062cEd14790b01AC5384D23D82",
  customAssetPriceFunc: async function (this: TokenInvestment) {
    return await getTokenPrice("boba-network"); // coingecko use eth contract instead of boba contract for some reason
  },
  customHistoricPricesFunc: async function (this: TokenInvestment) {
    return new HistoricPrices(await getHistoricTokenPrice('ethereum', '0x42bbfa2e77757c645eeaad1655e0911a7553efbc'));
  },
});

export const xvader = new TokenInvestment({
  name: "xvader",
  displayName: "xVADER",
  decimals: 18,
  isLp: false,
  tokenIcon: VaderImg,
  chainId: NetworkIds.Ethereum,
  chainName: "ethereum",
  contractAddress: "0x665ff8faa06986bd6f1802fa6c1d2e7d780a7369",
  daoAddress: "0x3381e86306145b062cEd14790b01AC5384D23D82",
  customAssetPriceFunc: async function (this: TokenInvestment) {
    // xVader rate gotten from https://www.vaderprotocol.app/
    // TODO get rate from contract
    const xVaderRate = 1.01086;
    return (await getTokenPrice("vader-protocol")) * xVaderRate;
  },
  customHistoricPricesFunc: async function (this: TokenInvestment) {
    // xVader rate gotten from https://www.vaderprotocol.app/
    // TODO get rate from contract
    const xVaderRate = 1.01329;
    const vaderHistoricPrices = await getHistoricTokenPrice('ethereum', '0x2602278ee1882889b946eb11dc0e810075650983');

    Object.keys(vaderHistoricPrices).forEach(timestamp => vaderHistoricPrices[timestamp] *= xVaderRate);
    return new HistoricPrices(vaderHistoricPrices);
  },
});

/// leave it here as an example of tomb fork farming
// export const tomb_ftm_lp = new CustomInvestment({
//   name: "tomb-ftm-lp",
//   displayName: "TOMB-FTM LP",
//   decimals: 18,
//   isLp: true,
//   tokenIcon: TombFtmImg,
//   customAssetBalanceFunc: async function (this: CustomInvestment) {
//     return 0;
//   },
//   customAssetPriceFunc: async function (this: CustomInvestment) {
//     return 0;
//   },
//   customTreasuryBalanceFunc: async function (this: CustomInvestment) {
//     const ftmPrice = await getTokenPrice("fantom");
//     const tombPrice = await getTokenPrice("tomb");
//     const tsharePrice = await getTokenPrice("tomb-shares");
//
//     const ftmProvider = await chains[NetworkIds.FantomOpera].provider;
//     const daoAddress = "0x3381e86306145b062cEd14790b01AC5384D23D82";
//
//     // Contracts
//     const tsharePool = new ethers.Contract("0xcc0a87F7e7c693042a9Cc703661F5060c80ACb43", TShareRewardPool, ftmProvider);
//     const tshareContract = new ethers.Contract("0x4cdf39285d7ca8eb3f090fda0c069ba5f4145b37", ierc20Abi, ftmProvider);
//     const masonryContract = new ethers.Contract("0x8764DE60236C5843D9faEB1B638fbCE962773B67", TombMasonry, ftmProvider);
//     const tombContract = new ethers.Contract("0x6c021Ae822BEa943b2E66552bDe1D2696a53fbB7", ierc20Abi, ftmProvider);
//     const slpContract = new ethers.Contract("0x2a651563c9d3af67ae0388a5c8f89b867038089e", UniswapV2Pair, ftmProvider);
//
//     // Balances
//     const { balance, tshareClaimedBalance, tsharePendingBalance, masonryPendingBalance, tombPendingBalance, tombBalance, totalSupply, reserve0, reserve1 } = await Promise.all([
//       tsharePool.userInfo(0, daoAddress),
//       tshareContract.balanceOf(daoAddress),
//       tsharePool.pendingShare(0, daoAddress),
//       masonryContract.balanceOf(daoAddress),
//       masonryContract.earned(daoAddress),
//       tombContract.balanceOf(daoAddress),
//       slpContract.totalSupply(),
//       slpContract.getReserves(),
//     ]).then(([info, tshareClaimedBalance, tsharePendingBalance, masonryPendingBalance, tombPendingBalance, tombBalance, totalSupply, [reserve0, reserve1]]) => {
//       return {
//         // count ftm-tomb LP balance
//         balance: info[0] / Math.pow(10, this.decimals),
//         // count tshare claimed and unclaimed rewards
//         tshareClaimedBalance: tshareClaimedBalance / Math.pow(10, this.decimals),
//         tsharePendingBalance: tsharePendingBalance / Math.pow(10, this.decimals),
//         masonryPendingBalance: masonryPendingBalance / Math.pow(10, this.decimals),
//         // count earned tomb here on one place
//         tombPendingBalance: tombPendingBalance / Math.pow(10, this.decimals),
//         tombBalance: tombBalance / Math.pow(10, this.decimals),
//         // count ftm-tomb total value and amount of FTM and TOMB
//         totalSupply: totalSupply / Math.pow(10, this.decimals),
//         reserve0: reserve0 / Math.pow(10, this.decimals),
//         reserve1: reserve1 / Math.pow(10, this.decimals),
//       }
//     });
//
//     const totalValue = ftmPrice * reserve0 + tombPrice * reserve1;
//     const ftmTombValue = totalValue / totalSupply * balance;
//     const tshareValue = (tshareClaimedBalance + tsharePendingBalance + masonryPendingBalance) * tsharePrice;
//     const tombValue = (tombPendingBalance + tombBalance) * tombPrice;
//     return ftmTombValue + tshareValue + tombValue;
//   },
//   customHistoricPricesFunc: async function (this: CustomInvestment) {
//     return {
//       getPrice: (timestamp: number) => 0
//     };
//   },
// });

/// leave it as an example of liquiddriver's masterchef
// export const lqdr_ftm_lp = new CustomInvestment({
//   name: "lqdr-ftm-lp",
//   displayName: "LQDR-FTM LP",
//   decimals: 18,
//   isLp: true,
//   tokenIcon: LqdrFtmImg,
//   customAssetBalanceFunc: async function (this: CustomInvestment) {
//     return 0;
//   },
//   customAssetPriceFunc: async function (this: CustomInvestment) {
//     return 0;
//   },
//   customTreasuryBalanceFunc: async function (this: CustomInvestment) {
//     const ftmPrice = await getTokenPrice("fantom");
//     const lqdrPrice = await getTokenPrice("liquiddriver");
//
//     const ftmProvider = await chains[NetworkIds.FantomOpera].provider;
//     const daoAddress = "0x3381e86306145b062cEd14790b01AC5384D23D82";
//
//     // Contracts
//     const lqdrPool = new ethers.Contract("0x6e2ad6527901c9664f016466b8DA1357a004db0f", MasterChefLqdr, ftmProvider);
//     const lqdrContract = new ethers.Contract("0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9", ierc20Abi, ftmProvider);
//     const slpContract = new ethers.Contract("0x4Fe6f19031239F105F753D1DF8A0d24857D0cAA2", UniswapV2Pair, ftmProvider);
//
//     // Balances
//     const { balance, lqdrPendingBalance, lqdrBalance, totalSupply, reserve0, reserve1 } = await Promise.all([
//       lqdrPool.userInfo(0, daoAddress),
//       lqdrPool.pendingLqdr(0, daoAddress),
//       lqdrContract.balanceOf(daoAddress),
//       slpContract.totalSupply(),
//       slpContract.getReserves(),
//     ]).then(([info, lqdrPendingBalance, lqdrBalance, totalSupply, [reserve0, reserve1]]) => {
//       return {
//         // count lqdr-ftm LP balance
//         balance: info[0] / Math.pow(10, this.decimals),
//         // count earned lqdr
//         lqdrPendingBalance: lqdrPendingBalance / Math.pow(10, this.decimals),
//         // count lqdr in dao on once place
//         lqdrBalance: lqdrBalance / Math.pow(10, this.decimals),
//         // count ftm-lqdr total value and amount of FTM and LQDR
//         totalSupply: totalSupply / Math.pow(10, this.decimals),
//         reserve0: reserve0 / Math.pow(10, this.decimals),
//         reserve1: reserve1 / Math.pow(10, this.decimals),
//       }
//     });
//
//     const totalValue = lqdrPrice * reserve0 + ftmPrice * reserve1;
//     const ftmLqdrValue = totalValue / totalSupply * balance;
//     const lqdrValue = (lqdrPendingBalance + lqdrBalance) * lqdrPrice;
//     return ftmLqdrValue + lqdrValue;
//   },
//   customHistoricPricesFunc: async function (this: CustomInvestment) {
//     return {
//       getPrice: (timestamp: number) => 0
//     };
//   },
// });

export const beets_lqdr_ftm_lp_pirate_party = new CustomInvestment({
  name: "beets-lqdr-ftm-lp",
  displayName: "LQDR-FTM LP",
  decimals: 18,
  isLp: true,
  tokenIcon: LqdrFtmImg,
  customAssetBalanceFunc: async function (this: CustomInvestment) {
    return 0;
  },
  customAssetPriceFunc: async function (this: CustomInvestment) {
    return 0;
  },
  customTreasuryBalanceFunc: async function (this: CustomInvestment) {
    const ftmPrice = await getTokenPrice("fantom");
    const lqdrPrice = await getTokenPrice("liquiddriver");
    const beetsPrice = await getTokenPrice("beethoven-x");

    const ftmProvider = await chains[NetworkIds.FantomOpera].provider;
    const daoAddress = "0x3381e86306145b062cEd14790b01AC5384D23D82";
    const poolId = "0x5e02ab5699549675a6d3beeb92a62782712d0509000200000000000000000138";

    // Contracts
    const vault = new ethers.Contract("0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce", BalancerVault, ftmProvider);
    const masterChef = new ethers.Contract("0x8166994d9ebBe5829EC86Bd81258149B87faCfd3", MasterChefBeets, ftmProvider);
    const pool = new ethers.Contract("0x5E02aB5699549675A6d3BEEb92A62782712D0509", BalancerWeightedPool, ftmProvider);
    const beetsContract = new ethers.Contract("0xF24Bcf4d1e507740041C9cFd2DddB29585aDCe1e", ierc20Abi, ftmProvider);

    // Balances
    const { balance, beetsPendingBalance, beetsBalance, totalSupply, reserve0, reserve1 } = await Promise.all([
      masterChef.userInfo(36, daoAddress),
      masterChef.pendingBeets(36, daoAddress),
      beetsContract.balanceOf(daoAddress),
      pool.totalSupply(),
      vault.getPoolTokens(poolId),
    ]).then(([info, beetsPendingBalance, beetsBalance, totalSupply, poolTokens]) => {

      return {
        // count lqdr-ftm LP balance
        balance: info[0] / Math.pow(10, this.decimals),
        // count earned lqdr
        beetsPendingBalance: beetsPendingBalance / Math.pow(10, this.decimals),
        // count lqdr in dao on once place
        beetsBalance: beetsBalance / Math.pow(10, this.decimals),
        // count ftm-lqdr total value and amount of FTM and LQDR
        totalSupply: totalSupply / Math.pow(10, this.decimals),
        reserve0: poolTokens[1][0] / Math.pow(10, this.decimals),
        reserve1: poolTokens[1][1] / Math.pow(10, this.decimals),
      }
    });
    // console.log("balance", balance);
    // console.log("beetsPendingBalance", beetsPendingBalance);
    // console.log("beetsBalance", beetsBalance);
    // console.log("totalSupply", totalSupply);
    // console.log("reserve0", reserve0);
    // console.log("reserve1", reserve1);

    const totalValue = lqdrPrice * reserve0 + ftmPrice * reserve1;
    const ftmLqdrValue = totalValue / totalSupply * balance;
    const beetsValue = (beetsPendingBalance + beetsBalance) * beetsPrice;
    return ftmLqdrValue + beetsValue;
  },
  customHistoricPricesFunc: async function (this: CustomInvestment) {
    return {
      getPrice: (timestamp: number) => 0
    };
  },
});

export const beets_beets_ftm_lp_fidelio_duetto = new CustomInvestment({
  name: "beets_beets_ftm_lp",
  displayName: "BEETS-FTM LP",
  decimals: 18,
  isLp: true,
  tokenIcon: BeetsFtmImg,
  customAssetBalanceFunc: async function (this: CustomInvestment) {
    return 0;
  },
  customAssetPriceFunc: async function (this: CustomInvestment) {
    return 0;
  },
  customTreasuryBalanceFunc: async function (this: CustomInvestment) {
    const ftmPrice = await getTokenPrice("fantom");
    const beetsPrice = await getTokenPrice("beethoven-x");

    const ftmProvider = await chains[NetworkIds.FantomOpera].provider;
    const daoAddress = "0x3381e86306145b062cEd14790b01AC5384D23D82";
    const poolId = "0xcde5a11a4acb4ee4c805352cec57e236bdbc3837000200000000000000000019";

    // Contracts
    const vault = new ethers.Contract("0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce", BalancerVault, ftmProvider);
    const masterChef = new ethers.Contract("0x8166994d9ebBe5829EC86Bd81258149B87faCfd3", MasterChefBeets, ftmProvider);
    const pool = new ethers.Contract("0xcde5a11a4acb4ee4c805352cec57e236bdbc3837", BalancerWeightedPool, ftmProvider);

    // Balances
    const { fBeetsBalance, beetsPendingBalance, totalSupply, reserve0, reserve1 } = await Promise.all([
      masterChef.userInfo(22, daoAddress),
      masterChef.pendingBeets(22, daoAddress),
      pool.totalSupply(),
      vault.getPoolTokens(poolId),
    ]).then(([info, beetsPendingBalance, totalSupply, poolTokens]) => {
      return {
        // count fBeets balance
        fBeetsBalance: info[0] / Math.pow(10, this.decimals),
        // count earned lqdr
        beetsPendingBalance: beetsPendingBalance / Math.pow(10, this.decimals),
        // count ftm-beets total value and amount of FTM and BEETS
        totalSupply: totalSupply / Math.pow(10, this.decimals),
        // count total amount of FTM
        reserve0: poolTokens[1][0] / Math.pow(10, 18),
        // count total amount of BEETS
        reserve1: poolTokens[1][1] / Math.pow(10, 18),
      }
    });
    const totalValue = ftmPrice * reserve0 + beetsPrice * reserve1;
    const bptValue = totalValue / totalSupply * (fBeetsBalance * 1.0152 /* see exchange rate https://beets.fi/#/stake */);
    const beetsPendingValue = beetsPendingBalance * beetsPrice;
    return bptValue + beetsPendingValue;

  },
  customHistoricPricesFunc: async function (this: CustomInvestment) {
    return {
      getPrice: (timestamp: number) => 0
    };
  },
});

export const usdb = new TokenInvestment({
  name: "usdb",
  displayName: "USDB",
  decimals: 18,
  isLp: false,
  tokenIcon: UsdbImg,
  chainId: NetworkIds.FantomOpera,
  chainName: "fantom",
  contractAddress: "0x6Fc9383486c163fA48becdEC79d6058f984f62cA",
  daoAddress: "0x34f93b12ca2e13c6e64f45cfa36eabadd0ba30fc",
  customAssetPriceFunc: async function (this: TokenInvestment) {
    return 1;
  },
  customHistoricPricesFunc: async function (this: TokenInvestment) {
    return {
      getPrice: (_: number) => 1 // FHUD is always $1
    };
  },
});

export const usdb_dai_lp = new TokenInvestment({
  name: "usdb-dai-lp",
  displayName: "USDB-DAI LP",
  decimals: 18,
  isLp: false,
  tokenIcon: UsdbImg,
  chainId: NetworkIds.FantomOpera,
  chainName: "fantom",
  contractAddress: "0x7799f423534c319781b1b370B69Aaf2C75Ca16A3",
  daoAddress: "0x34f93b12ca2e13c6e64f45cfa36eabadd0ba30fc",
  customAssetPriceFunc: async function (this: TokenInvestment) {
    return 1;
  },
  customHistoricPricesFunc: async function (this: TokenInvestment) {
    return {
      getPrice: (_: number) => 1 // FHUD is always $1
    };
  },
});

// this is original 5m MIM for FHUD LP and 150k from wMEMO
export const DAI_INVESTMENT_AMOUNT = 5109678.179959074937232482 + 1579269.1;

export const fhud_dai_lp2 = new TokenInvestment({
  name: "dai",
  displayName: "DAI",
  decimals: 18,
  isLp: false,
  tokenIcon: DaiImg,
  chainId: NetworkIds.FantomOpera,
  chainName: "fantom",
  contractAddress: "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
  daoAddress: "0x34f93b12ca2e13c6e64f45cfa36eabadd0ba30fc",
  customAssetBalanceFunc: async function (this: TokenInvestment) {
    const contract = new ethers.Contract(this.contractAddress, ierc20Abi, await this.provider);
    return await contract.balanceOf(this.daoAddress) / Math.pow(10, this.decimals);
  }
});

// HOW TO ADD A NEW INVESTMENT:
// Is it a token? use `new TokenInvestment`
// Does it need custom balance function? use `new CustomInvestment`
// Add new investments to this array!!
export const allInvestments = [
    wmemo,
    weth,
    luna,
    movr,
    btc,
    ohm,
    matic,
    dusk,
    qnt,
    dot,
    boba,
    quartz,
    xvader,
    fhud_dai_lp2,
    usdb,
    usdb_dai_lp,
    beets_lqdr_ftm_lp_pirate_party,
    beets_beets_ftm_lp_fidelio_duetto
];
export const allInvestmentsMap = allInvestments.reduce((prevVal, investment) => {
  return { ...prevVal, [investment.name]: investment };
}, {});

// Debug Log
// console.log(allInvestmentsMap);
export default allInvestments;
