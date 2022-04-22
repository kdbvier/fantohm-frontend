export function investmentDataQuery(graphConfig) {
  const balanceKeys = graphConfig.balanceKeys.join(`
      `);

  const query = `
  query {
    investmentMetrics(first: 90, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      ${balanceKeys}
    }
  }
  `;
  return query;
}

export function treasuryDataQuery(graphConfig) {
  const marketValueKeys = graphConfig.marketValueKeys.join(`
      `);
  const riskFreeValueKeys = graphConfig.riskFreeValueKeys.join(`
      `);
  const polKeys = graphConfig.polKeys.join(`
      `);

  const query = `
  query {
    protocolMetrics(first: 90, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      fhmCirculatingSupply
      sFhmCirculatingSupply
      totalSupply
      fhmPrice
      marketCap
      totalValueLocked
      treasuryRiskFreeValue
      treasuryMarketValue
      nextEpochRebase
      nextDistributedFhm
      ${marketValueKeys}
      ${riskFreeValueKeys}
      currentAPY
      runway10k
      runway20k
      runway50k
      runwayCurrent
      holders
      ${polKeys}
    }
  }
  `;
  return query;
}

export const rebasesDataQuery = `
query {
  rebases(where: {contract: "0xcb9297425C889A7CbBaa5d3DB97bAb4Ea54829c2"}, orderBy: timestamp, first: 1000, orderDirection: desc) {
    percentage
    timestamp
  }
}
`;

// export default treasuryData;
export const bulletpoints = {
  tvl: [
    {
      right: 20,
      top: -12,
      background: "#f7c775",
    },
  ],
  coin: [
    {
      right: 15,
      top: -12,
      background: "#f7c775",
    },
    {
      right: 25,
      top: -12,
      background: "#111111",
    },
    {
      right: 29,
      top: -12,
      background: "#cca551",
    },
    {
      right: 29,
      top: -12,
      background: "#c9c9c9",
    },
    {
      right: 29,
      top: -12,
      background: "#5b503d",
    },
  ],
  rfv: [
    {
      right: 15,
      top: -12,
      background: "#f7c775",
    },
    {
      right: 25,
      top: -12,
      background: "#cca551",
    },
    {
      right: 29,
      top: -12,
      background: "#111111",
    },
    {
      right: 29,
      top: -12,
      background: "#c9c9c9",
    },
    {
      right: 29,
      top: -12,
      background: "#5b503d",
    },
  ],
  holder: [
    {
      right: 40,
      top: -12,
      background: "#A3A3A3",
    },
  ],
  apy: [
    {
      right: 20,
      top: -12,
      background: "#49A1F2",
    },
  ],
  runway: [
    {
      right: 45,
      top: -12,
      background: "#000000",
    },
    {
      right: 48,
      top: -12,
      background: "#2EC608",
    },
    {
      right: 48,
      top: -12,
      background: "#49A1F2",
    },
    {
      right: 48,
      top: -12,
      background: "#c9184a",
    },
  ],
  staked: [
    {
      right: 45,
      top: -11,
      background: "#f7c775",
    },
    {
      right: 68,
      top: -12,
      background: "#cca551",
    },
  ],
  pol: [
    {
      right: 15,
      top: -12,
      background: "#f7c775",
    },
    {
      right: 25,
      top: -12,
      background: "#c9c9c9",
    },
  ],
};

export const tooltipItems = {
  tvl: ["Total Value Deposited"],
  coin: ["DAI", "MIM", "SPELL", "FTM"],
  holder: ["FANTOHMies"],
  apy: ["APY"],
  runway: ["Days"],
  pol: ["SLP Treasury", "Market SLP"],
  rfv: ["DAI", "MIM"],
};

export const tooltipInfoMessages = {
  tvl: "Total Value Deposited, is the dollar amount of all FHM Staked in the protocol. This metric is often used as growth or health indicator in DeFi projects.",
  mvt: "Market Value of Treasury Assets, is the sum of the value (in dollars) of all assets held by the treasury.",
  mvi: "Market Value of Investment Assets, is the sum of the value (in dollars) of all investments held by the treasury.",
  rfv: "Risk Free Value, is the amount of funds the treasury guarantees to use for backing FHM.",
  pol: "Protocol Owned Liquidity, is the amount of LP the treasury owns and controls. The more POL the better for the protocol and its users.",
  holder: "Holders, represents the total number of Fantohmies (sFHM holders)",
  staked: "FHM Staked, is the ratio of sFHM to FHM (staked vs unstaked)",
  apy: "Annual Percentage Yield, is the normalized representation of an interest rate, based on a compounding period over one year. Note that APYs provided are rather ballpark level indicators and not so much precise future results.",
  runway: "Runway, is the number of days sFHM emissions can be sustained at a given rate. Lower APY = longer runway",
};

export const itemType = {
  dollar: "$",
  percentage: "%",
};
