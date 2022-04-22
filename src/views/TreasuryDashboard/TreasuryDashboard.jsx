import { useMemo, useState } from "react";
import { Box, Paper, Typography, useMediaQuery } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useSelector } from "react-redux";
import { formatCurrency, trim } from "../../helpers";
import {
  FHMStakedGraph,
  MarketValueGraph,
  ProtocolOwnedLiquidityGraph,
  RiskFreeValueGraph,
  RunwayAvailableGraph,
  TotalValueDepositedGraph,
} from "./Graph";
import { useTheme } from "@material-ui/core/styles";
import "./treasury-dashboard.scss";
import { QueryClient, QueryClientProvider } from "react-query";
import { useWeb3Context } from "../../hooks";
import useTreasury from "src/hooks/Treasury";
import { useFlags } from "launchdarkly-react-client-sdk";

function TreasuryDashboard() {
  const [data, setData] = useState(null);
  const [apy, setApy] = useState(null);
  const [runway, setRunway] = useState(null);
  const [staked, setStaked] = useState(null);
  const theme = useTheme();
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");
  const { chainId } = useWeb3Context();

  const isAppLoading = useSelector(state => state.app.loading);

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });
  const circSupply = useSelector(state => {
    return state.app.circSupply;
  });
  const totalSupply = useSelector(state => {
    return state.app.totalSupply;
  });
  const marketCap = useSelector(state => {
    return state.app.marketCap;
  });
  const globalMarketCap = useSelector(state => {
    return state.app.globalMarketCap;
  });
  const globalCircSupply = useSelector(state => {
    return state.app.globalCircSupply;
  });
  const globalTotalSupply = useSelector(state => {
    return state.app.globalTotalSupply;
  });
  const globalStakingTVL = useSelector(state => {
    return state.app.globalStakingTVL;
  });
  const globalFiveDayRate = useSelector(state => {
    return state.app.globalFiveDayRate;
  });
  const globalStakingAPY = useSelector(state => {
    return state.app.globalStakingAPY;
  });
  const globalStakingRebase = useSelector(state => {
    return state.app.globalStakingRebase;
  });
  const globalStakingReward = useSelector(state => {
    return state.app.globalStakingRewardFHM;
  });

  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });

  const backingPerOhm = useSelector(state => {
    return state.app.treasuryMarketValue / state.app.circSupply;
  });

  const wsOhmPrice = useSelector(state => {
    return state.app.marketPrice * state.app.currentIndex;
  });

  const stakingTVL = useSelector(state => {
    return state.app.stakingTVL;
  });

  const stakingAPY = useSelector(state => {
    return state.app.stakingAPY;
  });

  const fiveDayRate = useSelector(state => {
    return state.app.fiveDayRate;
  });

  const stakingRebase = useSelector(state => {
    return state.app.stakingRebase;
  });

  const currentBlock = useSelector(state => {
    return state.app.currentBlock;
  });

  const stakingReward = useSelector(state => {
    return state.app.stakingRewardFHM;
  });

  const stakingCircSupply = useSelector(state => {
    return state.app.stakingCircSupply;
  });

  const secondsPerEpoch = useSelector(state => {
    return state.app.secondsPerEpoch;
  });

  const { globalTreasuryBalance, globalBackingPerFHM } = useTreasury();

  // useEffect(() => {
  //   apollo(treasuryDataQuery).then(r => {
  //     let metrics = r.data.protocolMetrics.map(entry =>
  //       Object.entries(entry).reduce((obj, [key, value]) => ((obj[key] = parseFloat(value)), obj), {}),
  //     );
  //     metrics = metrics.filter(pm => pm.treasuryMarketValue > 0);
  //     setData(metrics);
  //
  //     let staked = r.data.protocolMetrics.map(entry => ({
  //       staked: (parseFloat(entry.sOhmCirculatingSupply) / parseFloat(entry.ohmCirculatingSupply)) * 100,
  //       timestamp: entry.timestamp,
  //     }));
  //     staked = staked.filter(pm => pm.staked < 100);
  //     setStaked(staked);
  //
  //     let runway = metrics.filter(pm => pm.runway10k > 5);
  //     setRunway(runway);
  //   });
  //
  //   apollo(rebasesDataQuery).then(r => {
  //     let apy = r.data.rebases.map(entry => ({
  //       apy: Math.pow(parseFloat(entry.percentage) + 1, 365 * 3) * 100,
  //       timestamp: entry.timestamp,
  //     }));
  //
  //     apy = apy.filter(pm => pm.apy < 300000);
  //
  //     setApy(apy);
  //   });
  // }, []);

  const trimmedRebaseFHM = trim(stakingReward, 2) + " sFHM";
  const trimmedStakingAPY = trim(stakingAPY * 100, 1);
  const trimmedFiveDayRate = trim(fiveDayRate * 100, 1);
  const trimmedStakingRebase = trim(stakingRebase * 100, 2);
  const trimmedTokenStaked = circSupply != null ? trim(stakingCircSupply / circSupply  * 100, 2) : null;
  const trimmedHoursPerEpoch = secondsPerEpoch != null ? trim(secondsPerEpoch / (60 * 60), 1) : null;

  const trimmedGlobalStakingReward = trim(globalStakingReward, 2) + " sFHM";
  const trimmedGlobalStakingAPY = trim(globalStakingAPY * 100, 1);
  const trimmedGlobalFiveDayRate = trim(globalFiveDayRate * 100, 1);
  const trimmedGlobalStakingRebase = trim(globalStakingRebase * 100, 2);
  const { hideGraphs } = useFlags();

  const wsohmSymbol = useMemo(() => {
    if (chainId == 250 || chainId == 4002) {
      // Fantom
      return "FwsFHM";
    } else if (chainId == 1285 || chainId == 1287) {
      // Moonriver
      return "MwsFHM";
    }
    return "WsFHM";
  }, [chainId]);

  const chainName = useMemo(() => {
    if (chainId == 250 || chainId == 4002) return "Fantom";
    else if (chainId == 1285 || chainId == 1287) return "Moonriver";
    else if (chainId == 1 || chainId == 4) return "Ethereum";
    return "Unknown";
  }, [chainId]);

  return (
    <div id="treasury-dashboard-view" className={`${smallerScreen && "smaller"} ${verySmallScreen && "very-small"}`}>
      <div className="treasury-dashboard__separator-box">
        <div className="treasury-dashboard__main-info">
          <Box>
            <Paper elevation={2} className="treasury-dashboard__visual-box">
              <div>
                <Typography variant="h6" color="textSecondary">
                  FHM Price
                </Typography>
                <Typography variant="h5">
                  {marketPrice ? formatCurrency(marketPrice, 2) : <Skeleton type="text" />}
                </Typography>
              </div>
              <div>
                <Typography variant="h6" color="textSecondary">
                  Market Cap
                </Typography>
                <Typography variant="h5">
                  {globalMarketCap && formatCurrency(globalMarketCap, 0)}
                  {!globalMarketCap && <Skeleton type="text" />}
                </Typography>
              </div>
              <div>
                <Typography variant="h6" color="textSecondary">
                  Circulating Supply
                </Typography>
                <Typography variant="h5">
                  {globalCircSupply && globalTotalSupply ? (
                    parseInt(globalCircSupply) + " / " + parseInt(globalTotalSupply)
                  ) : (
                    <Skeleton type="text" />
                  )}
                </Typography>
              </div>
              <div>
                <Typography variant="h6" color="textSecondary">
                  Global APY
                </Typography>
                <Typography variant="h5">
                  {globalStakingAPY != null ? (
                    <>{new Intl.NumberFormat("en-US").format(trimmedGlobalStakingAPY)}%</>
                  ) : (
                    <Skeleton width="150px" />
                  )}
                </Typography>
              </div>
              <div>
                <Typography variant="h6" color="textSecondary">
                  Treasury Balance
                </Typography>
                <Typography variant="h5">
                  {!isAppLoading ? (
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(globalTreasuryBalance)
                  ) : (
                    <Skeleton width="180px" />
                  )}
                </Typography>
              </div>
              <div>
                <Typography variant="h6" color="textSecondary">
                  Book value per FHM
                </Typography>
                <Typography variant="h5">
                  {!isAppLoading ? formatCurrency(globalBackingPerFHM, 2) : <Skeleton width="100px" />}
                </Typography>
              </div>
            </Paper>
          </Box>
        </div>

        <div className="treasury-dashboard__info-set">
          <Paper elevation={2} className="treasury-dashboard__chart-box">
            <TotalValueDepositedGraph />
          </Paper>
          <Paper elevation={2} className="treasury-dashboard__visual-box treasury-dashboard__ftm-info">
            <Box class="treasury-dashboard__hero-second-wrapper">
              <Box class="treasury-dashboard__info-heading">
                <small>Current network values</small>
                <div>{chainName} network</div>
              </Box>
              <Box class="treasury-dashboard__hero-second">
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    {wsohmSymbol} Price
                  </Typography>
                  <Typography variant="h5">
                    {wsOhmPrice ? (
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 0,
                      }).format(wsOhmPrice)
                    ) : (
                      <Skeleton width="150px" />
                    )}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    Current Index
                  </Typography>
                  <Typography variant="h5">
                    {currentIndex ? (
                      new Intl.NumberFormat("en-US", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 0,
                      }).format(currentIndex)
                    ) : (
                      <Skeleton width="150px" />
                    )}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="textSecondary">
                    APY
                  </Typography>
                  <Typography variant="h5">
                    {stakingAPY != null ? (
                      <>{new Intl.NumberFormat("en-US").format(trimmedStakingAPY)}%</>
                    ) : (
                      <Skeleton width="150px" />
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" color="textSecondary">
                    5-Day Rate
                  </Typography>
                  <Typography variant="h5">
                    {fiveDayRate != null ? (
                      <>{new Intl.NumberFormat("en-US").format(trimmedFiveDayRate)}%</>
                    ) : (
                      <Skeleton width="150px" />
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" color="textSecondary">
                    Epoch
                  </Typography>
                  <Typography variant="h5">
                    {trimmedHoursPerEpoch != null ? (
                      <>{new Intl.NumberFormat("en-US").format(trimmedHoursPerEpoch)}</>
                    ) : (
                      <Skeleton width="150px" />
                    )}{" "}
                    hours
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" color="textSecondary">
                    Staked FHM
                  </Typography>
                  <Typography variant="h5">
                    {trimmedTokenStaked != null ? (
                      <>{new Intl.NumberFormat("en-US").format(trimmedTokenStaked)}%</>
                    ) : (
                      <Skeleton width="150px" />
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" color="textSecondary">
                    Epoch Rebase
                  </Typography>
                  <Typography variant="h5">
                    {stakingRebase != null ? (
                      <>
                        {new Intl.NumberFormat("en-US").format(trimmedStakingRebase)}% / {trimmedRebaseFHM}
                      </>
                    ) : (
                      <Skeleton width="150px" />
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={2} className="treasury-dashboard__chart-box">
              <MarketValueGraph />
          </Paper>

          <Paper elevation={2} className="treasury-dashboard__chart-box">
              <RiskFreeValueGraph />
          </Paper>

          {/* <Paper elevation={2} className="treasury-dashboard__chart-box">
            <InvestmentMarketValueGraph />
          </Paper> */}

          <Paper elevation={2} className="treasury-dashboard__chart-box">
            <ProtocolOwnedLiquidityGraph />
          </Paper>

          {/*  Temporarily removed until correct data is in the graph */}
          {/* <Grid item lg={6} md={12} sm={12} xs={12}>
              <Paper className="ohm-card">
                <Chart
                  type="bar"
                  data={data}
                  dataKey={["holders"]}
                  headerText="Holders"
                  stroke={[theme.palette.text.secondary]}
                  headerSubText={`${data.length > 0 && data[0].holders}`}
                  bulletpointColors={bulletpoints.holder}
                  itemNames={tooltipItems.holder}
                  itemType={undefined}
                  infoTooltipMessage={tooltipInfoMessages.holder}
                  expandedGraphStrokeColor={theme.palette.graphStrokeColor}
                  scale={undefined}
                  color={undefined}
                  stroke={undefined}
                  dataFormat={undefined}
                  isPOL={undefined}
                  isStaked={undefined}
                />
              </Paper>
            </Grid> */}

          <Paper elevation={2} className="treasury-dashboard__chart-box">
            <FHMStakedGraph />
          </Paper>

          <Paper elevation={2} className="treasury-dashboard__chart-box">
              <RunwayAvailableGraph />
          </Paper>
        </div>
      </div>
    </div>
  );
}

const twentyFourHoursInMs = 1000 * 60 * 60 * 24;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: twentyFourHoursInMs,
    },
  },
});

// Normally this would be done
// much higher up in our App.
export default () => (
  <QueryClientProvider client={queryClient}>
    <TreasuryDashboard />
  </QueryClientProvider>
);
