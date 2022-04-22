import { useQuery } from "react-query";
import { graphs, lpGraphTokens, marketValueTokens, stableGraphTokens, investmentTokens, getMarketValueKey, getPolKey, getBalanceKey, getRiskFreeValueKey, getInvestmentMarketValueKey, getTokenPriceKey  } from "src/graphs";
import { apolloExt as apollo } from "src/lib/apolloClient";
import { treasuryDataQuery, investmentDataQuery } from "./treasuryData";
import { getRunway, roundToNearestHour } from "../../helpers";
import { useSelector } from "react-redux";
import allInvestments, { DAI_INVESTMENT_AMOUNT } from "src/helpers/AllInvestments";
import { fhud_dai_lp } from "src/helpers/AllBonds";
import { NetworkIds } from "src/networks";

function getBaseMetric() {
  const base = {
    fhmCirculatingSupply: 0, 
    sFhmCirculatingSupply: 0,
    totalSupply: 0,
    marketCap: 0,
    totalValueLocked: 0,
    treasuryRiskFreeValue: 0,
    treasuryMarketValue: 0,
    nextDistributedFhm: 0,
    holders: 0,
    runwayValue: 0,
    fhmPrice: [],
    currentAPY: [],
  }
  marketValueTokens.map(getMarketValueKey).forEach(key => base[key] = 0);
  stableGraphTokens.map(getRiskFreeValueKey).forEach(key => base[key] = 0);
  lpGraphTokens.map(getPolKey).forEach(key => base[key] = []);
  investmentTokens.map(getBalanceKey).forEach(key => base[key] = 0);
  investmentTokens.map(getInvestmentMarketValueKey).forEach(key => base[key] = 0);
  return base;
}

export const useTreasuryMetrics = () => {
  const tokenPrices = useSelector(state => state.tokenPrices);
  // TODO: Find a better way to determine if all token prices are loaded
  const allTokensLoaded = investmentTokens.every(investment => investment.name in tokenPrices);
  return useQuery(
    "treasury_metrics",
    async () => {
      const networkMetrics = await Promise.all(graphs.filter(graph => graph.hasProtocolMetrics).map(async config => {
        const response = await apollo(treasuryDataQuery(config), config.url);
        return response.data.protocolMetrics.map(metric => {
          return Object.entries(metric).reduce((obj, [key, value]) => {
            obj[key] = parseFloat(value);
            return obj;
          }, {});
        });
      }));

      // Need to make sure to only include intvestment and hardcoded metrics after the earliest protocol metrics
      const earliestTimestamp = networkMetrics[0][networkMetrics[0].length - 1].timestamp;

      const investmentMetrics = await Promise.all(graphs.filter(graph => graph.hasInvestmentMetrics).map(async config => {
        const response = await apollo(investmentDataQuery(config), config.url);
        return response.data.investmentMetrics.map(metric => {
          return Object.entries(metric).reduce((obj, [key, value]) => {
            obj[key] = parseFloat(value);
            return obj;
          }, {});
        });
      }));

      // Hardcoding investments that are not available on the graph
      const hardcodedTransactions = [[
        {
          timestamp: 1641247407,
          investmentBOBABalance: 56852.78,
        },
        {
          timestamp: 1640721020,
          investmentBOBABalance: 40665.404,
        },
        {
          timestamp: 1640811711,
          investmentBOBABalance: 27199.769,
        },
        {
          timestamp: 1640721019,
          investmentBOBABalance: 13457.742,
        },
      ]];

      // TODO hack: I have no idea how best to put LP investments on the graph, so hard coding it for runway calc
      const lpInvestmentBalance = (await Promise.all(allInvestments.filter(investment => investment.isLp).map(async investment => investment.treasuryBalance))).reduce((prev, curr) => prev + curr, 0);

      const allMetrics = networkMetrics.concat(investmentMetrics).concat(hardcodedTransactions);

      // We need to combine all metrics across all networks, but this is tricky because the timestamps of the elements
      // between networks do not match. In order to combine them, we take the network with latest timestamp and use the first
      // element from that network (the arrays are sorted in descending order by timestamp) as the timestamp of the combined
      // metric, and then combine the first element of all the networks appropriately. Finally we remove that latest element
      // from the latest network and loop until all the elements across all networks are empty.
      // 
      // Visually speaking if we had two networks (in DESC timestamp order):
      //
      // network 1:         a                       b      c
      // network 2: A             B        C      
      //
      // combined:  A+a     a+B   b+B      b+C      b      c
      //
      // Notice that once we have "passed" an element, we no longer consider it for the next combination

      var combinedMetrics = [];
      while (allMetrics.some(metric => metric.length > 0)) {

        // Find network with latest timestamp
        const latestMetric = allMetrics.reduce(function(prev, current) {
          if (prev.length == 0) return current;
          else if (current.length == 0) return prev;
          else return (prev[0].timestamp > current[0].timestamp) ? prev : current;
        });

        // Combine the first element of all network values
        const combinedMetric = allMetrics.reduce((prev, current) => {
          if (current.length == 0) {
            // no more values left from the current network to combine
            return prev;
          }

          // These values are simply sumation between networks
          prev.fhmCirculatingSupply += current[0].fhmCirculatingSupply || 0;
          prev.sFhmCirculatingSupply += current[0].sFhmCirculatingSupply || 0;
          prev.totalSupply += current[0].totalSupply || 0;
          prev.marketCap += current[0].marketCap || 0;
          prev.totalValueLocked += current[0].totalValueLocked || 0;
          prev.treasuryRiskFreeValue += current[0].treasuryRiskFreeValue || 0;
          prev.treasuryMarketValue += current[0].treasuryMarketValue || 0;
          prev.nextDistributedFhm += current[0].nextDistributedFhm || 0;
          prev.holders += current[0].holders || 0;
          marketValueTokens.map(getMarketValueKey).forEach(key => prev[key] += current[0][key] || 0);
          stableGraphTokens.map(getRiskFreeValueKey).forEach(key => prev[key] += current[0][key] || 0);
          investmentTokens.map(getBalanceKey).forEach(key => prev[key] += current[0][key] || 0);

          // These values need to be averaged across networks
          if ('fhmPrice' in current[0]) prev.fhmPrice.push(current[0].fhmPrice);
          if ('currentAPY' in current[0]) prev.currentAPY.push(current[0].currentAPY);
          lpGraphTokens.map(getPolKey).forEach(key => {
            if (key in current[0]) prev[key].push(current[0][key]);
          });

          return prev;
        }, getBaseMetric());

        // Set combined timestamp as latest metric timestamp
        combinedMetric.timestamp = latestMetric[0].timestamp;

        // These values need to be converted to an average
        combinedMetric.fhmPrice = combinedMetric.fhmPrice.reduce((prev, curr) => prev + curr, 0) / combinedMetric.fhmPrice.length;
        combinedMetric.currentAPY = combinedMetric.currentAPY.reduce((prev, curr) => prev + curr, 0) / combinedMetric.currentAPY.length;
        lpGraphTokens.map(getPolKey).forEach(key => {
          combinedMetric[key] = combinedMetric[key].reduce((prev, curr) => prev + curr, 0) / combinedMetric[key].length;
        });

        // Keep track of runway value (risk free + all investments)
        combinedMetric.runwayValue = combinedMetric.treasuryRiskFreeValue;

        // TODO Hack DAI amounts for treaury and funding are mixed up
        combinedMetric['investmentDAIBalance'] = Math.min(combinedMetric.investmentDAIBalance, DAI_INVESTMENT_AMOUNT);

        // Combine investment balances with token prices
        combinedMetric.totalInvestmentValue = investmentTokens.filter(investment => combinedMetric[getBalanceKey(investment)] > 0).map(investment => {
          const tokenPriceHistory = tokenPrices[investment.name];
          const tokenPrice = tokenPriceHistory.getPrice(combinedMetric.timestamp);
          const investmentValue = combinedMetric[getBalanceKey(investment)] * tokenPrice;
          combinedMetric[getTokenPriceKey(investment)] = tokenPrice;
          combinedMetric[getMarketValueKey(investment)] += investmentValue;
          // We do not want to include dai or fhud in our investments
          combinedMetric[getInvestmentMarketValueKey(investment)] += investment.name === 'dai' || investment.name === 'fhud' ? 0 : investmentValue;
          combinedMetric.treasuryMarketValue += investmentValue;
          combinedMetric.runwayValue += investmentValue;
          if (investment.isRiskFree) {
            combinedMetric[getRiskFreeValueKey(investment)] += investmentValue;
            combinedMetric.treasuryRiskFreeValue += investmentValue;
          }
          return combinedMetric[getInvestmentMarketValueKey(investment)];
        }).reduce((prev, curr) => prev + curr, 0);

        // TODO Hack manually add lp investment totals to metric
        combinedMetric.totalInvestmentValue += lpInvestmentBalance;
        combinedMetric.runwayValue += lpInvestmentBalance;
        combinedMetric.treasuryMarketValue += lpInvestmentBalance;

        // These valuse are calculated 
        combinedMetric.nextEpochRebase = combinedMetric.nextDistributedFhm / combinedMetric.sFhmCirculatingSupply * 100;
        combinedMetric.runwayCurrent = getRunway(combinedMetric.sFhmCirculatingSupply, combinedMetric.runwayValue, combinedMetric.nextEpochRebase);
        combinedMetric.staked = (combinedMetric.sFhmCirculatingSupply / combinedMetric.fhmCirculatingSupply) * 100;

        combinedMetrics.push(combinedMetric);

        // Remove first element from latest metric as they no longer "apply" before this timestamp
        latestMetric.splice(0, 1);
      }
      
      // Filter out old metrics that should not be included in graph
      return combinedMetrics.filter(metric => metric.timestamp >= earliestTimestamp);
    },
    { enabled: allTokensLoaded }
  );
};