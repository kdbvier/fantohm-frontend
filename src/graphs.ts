export const getInvestmentMarketValueKey = (token: GraphToken) => `investment${token.graphKey}MarketValue`
export const getBalanceKey = (token: GraphToken) => `investment${token.graphKey}Balance`
export const getMarketValueKey = (token: GraphToken) => `treasury${token.graphKey}MarketValue`
export const getRiskFreeValueKey = (token: GraphToken) => `treasury${token.graphKey}RiskFreeValue`
export const getPolKey = (token: GraphToken) => `treasury${token.graphKey}POL`
export const getTokenPriceKey = (token: GraphToken) => `${token.graphKey}Price`

interface GraphTokenConfig {
  name: string,
  graphKey: string,
  displayName: string,
  isRiskFree?: boolean,
  stopColor: [string, string],
}

export class GraphToken {
  public readonly name: string; // Must match AllBonds or AllInvestments name
  public readonly graphKey: string; // Must match thegraph key
  public readonly displayName: string;
  public readonly isRiskFree: boolean;
  public readonly stopColor: [string, string];

  constructor(config: GraphTokenConfig) {
    this.name = config.name;
    this.graphKey = config.graphKey;
    this.stopColor = config.stopColor;
    this.isRiskFree = config.isRiskFree || false;
    this.displayName = config.displayName;
  }

  get marketValueKey(): string {
    return `treasury${this.name}MarketValue`;
  }

  get bulletPointColor(): any {
    return {
      right: 25,
      top: -12,
      background: `linear-gradient(180deg, ${this.stopColor[0]} -10%, ${this.stopColor[1]} 100%)`,
    };
  }

}

export class Graph {
  public name: string;
  public displayName: string;
  public url: string;
  public tokenBonds: GraphToken[];
  public lpBonds: GraphToken[];
  public investments: GraphToken[];

  constructor(name: string, displayName: string, url: string, tokenBonds: GraphToken[], lpBonds: GraphToken[], investments: GraphToken[]) {
    this.name = name;
    this.displayName = displayName;
    this.url = url;
    this.tokenBonds = tokenBonds;
    this.lpBonds = lpBonds;
    this.investments = investments;
  }

  get marketValueKeys(): string[] {
    return this.tokenBonds.concat(this.lpBonds).map(getMarketValueKey);
  }

  get riskFreeValueKeys(): string[] {
    return this.tokenBonds.filter(bond => bond.isRiskFree).map(getRiskFreeValueKey);
  }

  get polKeys(): string[] {
    return this.lpBonds.map(getPolKey);
  }

  get balanceKeys(): string[] {
    return this.investments.map(getBalanceKey);
  }

  get hasInvestmentMetrics(): boolean {
    return this.investments.length > 0;
  }

  get hasProtocolMetrics(): boolean {
    return this.tokenBonds.length > 0 || this.lpBonds.length > 0;
  }

}

const dai = new GraphToken({
  name: 'dai',
  graphKey: 'DAI',
  displayName: 'DAI',
  isRiskFree: true,
  stopColor: ['#e6f775', '#a8b455'],
});

const mim = new GraphToken({
  name: 'mim',
  graphKey: 'MIM',
  displayName: 'MIM',
  isRiskFree: true,
  stopColor: ['#fff8d9', '#c4bd9f'],
});

const fhud = new GraphToken({
  name: 'fhud',
  graphKey: 'FHUD',
  displayName: 'FHUD',
  isRiskFree: true,
  stopColor: ['#6175ad', '#46547c'],
});

const usdb = new GraphToken({
  name: 'usdb',
  graphKey: 'USDB',
  displayName: 'USDB',
  isRiskFree: true,
  stopColor: ['#39ab25', '#e3a94c'],
});

const usdcm = new GraphToken({
  name: 'usdcm',
  graphKey: 'USDCm',
  displayName: 'USDCm',
  isRiskFree: true,
  stopColor: ['#977bf7', '#705bb6'],
});

const usdtm = new GraphToken({
  name: 'usdtm',
  graphKey: 'USDTm',
  displayName: 'USDTm',
  isRiskFree: true,
  stopColor:  ['#cc51a8', '#933a79'],
});

const sspell = new GraphToken({
  name: 'sspell',
  graphKey: 'sSPELL',
  displayName: 'sSPELL',
  stopColor:  ['#51c4cc', '#398b91'],
});

const wftm = new GraphToken({
  name: 'wftm',
  graphKey: 'wFTM',
  displayName: 'wFTM',
  stopColor:  ['#ad8e61', '#806947'],
});

const fhmdai = new GraphToken({
  name: 'fhm_dai_lp',
  graphKey: 'FHMDAI',
  displayName: 'FHM-DAI',
  stopColor: ['#8f7f39', '#625728'],
});

const fhmmim = new GraphToken({
  name: 'fhm_mim_lp',
  graphKey: 'FHMMIM',
  displayName: 'FHM-MIM',
  stopColor: ['#445279', '#283047'],
});

const fhmusdcm = new GraphToken({
  name: 'fhm_usdcm_lp',
  graphKey: 'FHMUSDCm',
  displayName: 'FHM-USDCm',
  stopColor: ['#e3eaff', '#aaafbe'],
});

const usdbdai = new GraphToken({
  name: 'usdb_dai_lp',
  graphKey: 'USDBDAI',
  displayName: 'USDB-DAI',
  stopColor: ['#2e49ab', '#b3f20b'],
  isRiskFree: true,
});

const weth = new GraphToken({
  name: 'weth',
  graphKey: 'wETH',
  displayName: 'wETH',
  stopColor: ['#56f9c3', '#5bbf0e'],
});

const luna = new GraphToken({
  name: 'luna',
  graphKey: 'LUNA',
  displayName: 'LUNA',
  stopColor: ['#334a91', '#ac3005'],
});

const wbtc = new GraphToken({
  name: 'wbtc',
  graphKey: 'wBTC',
  displayName: 'wBTC',
  stopColor: ['#9c4e23', '#7a3581'],
});

const matic = new GraphToken({
  name: 'matic',
  graphKey: 'MATIC',
  displayName: 'MATIC',
  stopColor: ['#84fa27', '#4c6e8b'],
});

const dusk = new GraphToken({
  name: 'dusk',
  graphKey: 'DUSK',
  displayName: 'DUSK',
  stopColor: ['#809da8', '#ef6d5d'],
});

const gohm = new GraphToken({
  name: 'gohm',
  graphKey: 'gOHM',
  displayName: 'gOHM',
  stopColor: ['#0fb13b', '#bcba20'],
});

const qnt = new GraphToken({
  name: 'qnt',
  graphKey: 'QNT',
  displayName: 'QNT',
  stopColor: ['#5f5bc4', '#ce402a'],
});

const quartz = new GraphToken({
  name: 'quartz',
  graphKey: 'QUARTZ',
  displayName: 'QUARTZ',
  stopColor: ['#e52706', '#cc54de'],
});

const xvader = new GraphToken({
  name: 'xvader',
  graphKey: 'xVADER',
  displayName: 'xVADER',
  stopColor: ['#6c44f0', '#a27b4e'],
});

const wmemo = new GraphToken({
  name: 'wmemo',
  graphKey: 'wMEMO',
  displayName: 'wMEMO',
  stopColor: ['#916c7d', '#d95b67'],
});

const movr = new GraphToken({
  name: 'movr',
  graphKey: 'MOVR',
  displayName: 'MOVR',
  stopColor: ['#6bbabf', '#f9d675'],
});

const dot = new GraphToken({
  name: 'dot',
  graphKey: 'DOT',
  displayName: 'DOT',
  stopColor: ['#e7e527', '#4980a2'],
});

const boba = new GraphToken({
  name: 'boba',
  graphKey: 'BOBA',
  displayName: 'BOBA',
  stopColor: ['#805635', '#bf6b47'],
});

const fhuddailp = new GraphToken({
  name: 'fhuddailp',
  graphKey: 'FHUDDAI',
  displayName: 'FHUD-DAI LP',
  stopColor: ['#f38d93', '#3de934'],
  isRiskFree: true,
});

export const ftmGraph: Graph = new Graph(
  'FTM',
  'Fantom',
  'https://api.thegraph.com/subgraphs/id/QmczXUGZ6G2gkVJyyZXe1a9NzCnwe8D8rQc2cxPMg6MSSq',
  [dai, mim, fhud, sspell, wftm, fhuddailp, usdb, usdbdai],
  [fhmdai, fhmmim],
  [wmemo, dai, fhud, usdb],
);

export const movrGraph: Graph = new Graph(
  'MOVR',
  'Moonriver',
  'https://api.thegraph.com/subgraphs/id/QmcECPwqxJPcodD9GjoS9oLX6suX4Gh1MV5PffuHRkPKkU',
  [usdcm, usdtm, fhud, usdb],
  [fhmusdcm],
  [movr],
);

export const ethGraph: Graph = new Graph(
  'ETH',
  'Ethereum',
  'https://api.thegraph.com/subgraphs/name/chinu-dev/fantohm-eth',
  [],
  [],
  [weth, luna, wbtc, matic, dusk, gohm, qnt, quartz, xvader],
);

export const bscGraph: Graph = new Graph(
  'BSC',
  'Binance Smart Chain',
  'https://api.thegraph.com/subgraphs/name/chinu-dev/fantohm-bsc',
  [],
  [],
  [dot],
);

export const graphs: Graph[] = [ftmGraph, movrGraph, ethGraph, bscGraph];

export const graphTokens: GraphToken[] = graphs.flatMap(graph => graph.tokenBonds.concat(graph.lpBonds)).filter((v, i, a) => a.indexOf(v) === i);
export const stableGraphTokens: GraphToken[] = graphTokens.filter(token => token.isRiskFree);
export const lpGraphTokens: GraphToken[] = graphs.flatMap(graph => graph.lpBonds).filter((v, i, a) => a.indexOf(v) === i);
export const investmentTokens: GraphToken[] = graphs.flatMap(graph => graph.investments).filter((v, i, a) => a.indexOf(v) === i).concat([boba]);

export const marketValueTokens: GraphToken[] = graphTokens.concat(investmentTokens).filter((v, i, a) => a.indexOf(v) === i);
