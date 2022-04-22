import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  Typography,
  Zoom,
} from "@material-ui/core";
import NewReleases from "@material-ui/icons/NewReleases";
import RebaseTimer from "../../components/RebaseTimer/RebaseTimer";
import TabPanel from "../../components/TabPanel";
import { getOhmTokenImage, getTokenImage, trim } from "../../helpers";
import { changeApproval, changeStake, changeClaim, changeForfeit } from "../../slices/StakeThunk";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./stake.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import ExternalStakePool from "./ExternalStakePool";
import { error } from "../../slices/MessagesSlice";
import { ethers } from "ethers";
import WarmUp from "../../components/WarmUp/WarmUp";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const sOhmImg = getTokenImage("sfhm");
const ohmImg = getOhmTokenImage(16, 16);

function Stake() {
  const dispatch = useDispatch();
  const { provider, address, connected, connect, chainId } = useWeb3Context();

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState("");

  const isAppLoading = useSelector(state => state.app.loading);
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });
  const fiveDayRate = useSelector(state => {
    return state.app.fiveDayRate;
  });
  const ohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.ohm;
  });
  const oldSohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.oldsohm;
  });
  const sohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.sohm;
  });
  const fsohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.fsohm;
  });
  const wsohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.wsohm;
  });
  const stakeAllowance = useSelector(state => {
    return state.account.staking && state.account.staking.ohmStake;
  });
  const unstakeAllowance = useSelector(state => {
    return state.account.staking && state.account.staking.ohmUnstake;
  });
  const stakingRebase = useSelector(state => {
    return state.app.stakingRebase;
  });
  const stakingAPY = useSelector(state => {
    return state.app.stakingAPY;
  });
  const stakingTVL = useSelector(state => {
    return state.app.stakingTVL;
  });
  const currentEpochNumber = useSelector(state => {
    return state.app.epochNumber;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(ohmBalance);
    } else {
      setQuantity(sohmBalance);
    }
  };

  const onSeekApproval = async token => {
    await dispatch(changeApproval({ address, token, provider, networkId: chainId }));
  };

  const onChangeStake = async action => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(quantity) || quantity === 0 || quantity === "") {
      // eslint-disable-next-line no-alert
      return dispatch(error("Please enter a value!"));
    }

    // 1st catch if quantity > balance
    let gweiValue = ethers.utils.parseUnits(quantity, "gwei");
    if (action === "stake" && gweiValue.gt(ethers.utils.parseUnits(ohmBalance, "gwei"))) {
      return dispatch(error("You cannot stake more than your FHM balance."));
    }

    if (action === "unstake" && gweiValue.gt(ethers.utils.parseUnits(sohmBalance, "gwei"))) {
      return dispatch(error("You cannot unstake more than your sFHM balance."));
    }

    await dispatch(changeStake({ address, action, value: quantity.toString(), provider, networkId: chainId }));
  };

  const hasAllowance = useCallback(
    token => {
      if (token === "fhm") return stakeAllowance > 0;
      if (token === "sfhm") return unstakeAllowance > 0;
      return 0;
    },
    [stakeAllowance, unstakeAllowance],
  );

  const isAllowanceDataLoading = (stakeAllowance == null && view === 0) || (unstakeAllowance == null && view === 1);

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  );

  const changeView = (event, newView) => {
    setView(newView);
  };

  const trimmedBalance = Number(
    // TODO show better next yield for wrapped token [sohmBalance, fsohmBalance, wsohmBalance]
    [sohmBalance, fsohmBalance]
      .filter(Boolean)
      .map(balance => Number(balance))
      .reduce((a, b) => a + b, 0)
      .toFixed(4),
  );
  const trimmedStakingAPY = trim(stakingAPY * 100, 1);
  const stakingRebasePercentage = trim(stakingRebase * 100, 4);
  const nextRewardValue = trim((stakingRebasePercentage / 100) * trimmedBalance, 4);


  const warmUpAmount = useSelector(state => {
    return state.account.warmup && state.account.warmup.warmUpAmount;
  });
  const depositAmount = useSelector(state => {
    return state.account.warmup && state.account.warmup.depositAmount;
  });
  const expiry = useSelector(state => {
    return state.account.warmup && state.account.warmup.expiryBlock;
  });
  const onClaim = async () => {
    await dispatch(changeClaim({ address, provider, networkId: chainId }));
  };
  const onForfeit = async () => {
    await dispatch(changeForfeit({ address, provider, networkId: chainId }));
  };

  const warmupRebaseTime = expiry - currentEpochNumber;
  const trimmedWarmUpAmount = Number(
    [warmUpAmount]
      .filter(Boolean)
      .map(amount => Number(amount))
      .reduce((a, b) => a + b, 0),
  );

  return (
    <div class="stake">
      {connected ? (
        <WarmUp
          depositAmount={depositAmount}
          trimmedWarmUpAmount={trimmedWarmUpAmount}
          warmupRebaseTime={warmupRebaseTime}
          pendingTransactions={pendingTransactions}
          onClaim={onClaim}
          onForfeit={onForfeit}
        />
      ) : <></>}
      <div id="stake-view">
        <Zoom in={true} onEntered={() => setZoomed(true)}>
          <Paper className={`ohm-card`}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <div className="card-header">
                  <Typography variant="h5">Single Stake (👻, 👻)</Typography>
                  <RebaseTimer />

                  {/*{address && oldSohmBalance > 0.01 && (*/}
                  {/*  <Link*/}
                  {/*    className="migrate-sohm-button"*/}
                  {/*    style={{ textDecoration: "none" }}*/}
                  {/*    href="https://docs.olympusdao.finance/using-the-website/migrate"*/}
                  {/*    aria-label="migrate-sohm"*/}
                  {/*    target="_blank"*/}
                  {/*  >*/}
                  {/*    <NewReleases viewBox="0 0 24 24" />*/}
                  {/*    <Typography>Migrate sOHM!</Typography>*/}
                  {/*  </Link>*/}
                  {/*)}*/}
                </div>
              </Grid>

              <Grid item>
                <div className="stake-top-metrics">
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={4} md={4} lg={4}>
                      <div className="stake-apy">
                        <Typography variant="h5" color="textSecondary">
                          APY
                        </Typography>
                        <Typography variant="h4">
                          {stakingAPY != null ? (
                            <>{new Intl.NumberFormat("en-US").format(trimmedStakingAPY)}%</>
                          ) : (
                            <Skeleton width="150px" />
                          )}
                        </Typography>
                      </div>
                    </Grid>

                    <Grid item xs={12} sm={4} md={4} lg={4}>
                      <div className="stake-tvl">
                        <Typography variant="h5" color="textSecondary">
                          Total Value Deposited
                        </Typography>
                        <Typography variant="h4">
                          {stakingTVL ? (
                            new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                              minimumFractionDigits: 0,
                            }).format(stakingTVL)
                          ) : (
                            <Skeleton width="150px" />
                          )}
                        </Typography>
                      </div>
                    </Grid>

                    {/*<Grid item xs={12} sm={4} md={4} lg={4}>*/}
                    {/*  <div className="stake-index">*/}
                    {/*    <Typography variant="h5" color="textSecondary">*/}
                    {/*      Current Index*/}
                    {/*    </Typography>*/}
                    {/*    <Typography variant="h4">*/}
                    {/*      {currentIndex ? <>{trim(currentIndex, 1)} FHM</> : <Skeleton width="150px" />}*/}
                    {/*    </Typography>*/}
                    {/*  </div>*/}
                    {/*</Grid>*/}
                  </Grid>
                </div>
              </Grid>

              {connected ? (
                <Paper className="ohm-card ohm-modal">
                  <Typography className="body1" style={{ lineHeight: 1.5}}>
                    {(trimmedWarmUpAmount - depositAmount) > 0 && (isNaN(warmupRebaseTime) || warmupRebaseTime > 0) ? (
                      <>
                        If you do not claim the rewards after the warmup period expires, you will continue to earn rebase rewards until you chose to claim them.
                      </>
                    ) : (
                      <>
                        FHM that is staked will be placed into a warmup period that is 2 rebases long. Rewards will still be earned while you are in the warmup. Tokens in warmup will not appear in your wallet.  You will need to claim (via the claim button above) the tokens and rebase rewards after that warmup period expires.
                        <br/><br/>
                        If you would like to remove your initial deposit before the end of the warmup period, you can do so at any time but you will forfeit any earned rewards.
                      </>
                    )}
                  </Typography>
                </Paper>
              ) : <></>}

              <div className="staking-area">
                {!address ? (
                  <div className="stake-wallet-notification">
                    <div className="wallet-menu" id="wallet-menu">
                      {modalButton}
                    </div>
                    <Typography variant="h6">Connect your wallet to stake FHM</Typography>
                  </div>
                ) : (
                  <>
                    <Box className="stake-action-area">
                      <Tabs
                        key={String(zoomed)}
                        centered
                        value={view}
                        textColor="primary"
                        indicatorColor="primary"
                        className="stake-tab-buttons"
                        onChange={changeView}
                        aria-label="stake tabs"
                      >
                        <Tab label="Stake" {...a11yProps(0)} />
                        <Tab label="Unstake" {...a11yProps(1)} />
                      </Tabs>

                      <Box className="stake-action-row " display="flex" alignItems="center">
                        {address && !isAllowanceDataLoading ? (
                          (!hasAllowance("fhm") && view === 0) || (!hasAllowance("sfhm") && view === 1) ? (
                            <Box className="help-text">
                              <Typography variant="body1" className="stake-note" color="textSecondary">
                                {view === 0 ? (
                                  <>
                                    First time staking <b>FHM</b>?
                                    <br />
                                    Please approve Fantohm to use your <b>FHM</b> for staking.
                                  </>
                                ) : (
                                  <>
                                    First time unstaking <b>sFHM</b>?
                                    <br />
                                    Please approve Fantohm to use your <b>sFHM</b> for unstaking.
                                  </>
                                )}
                              </Typography>
                            </Box>
                          ) : (
                            <FormControl className="ohm-input" variant="outlined" color="primary">
                              <InputLabel htmlFor="amount-input"></InputLabel>
                              <OutlinedInput
                                id="amount-input"
                                type="number"
                                placeholder="Enter an amount"
                                className="stake-input"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                labelWidth={0}
                                endAdornment={
                                  <InputAdornment position="end">
                                    <Button variant="text" onClick={setMax} color="inherit">
                                      Max
                                    </Button>
                                  </InputAdornment>
                                }
                              />
                            </FormControl>
                          )
                        ) : (
                          <Skeleton width="150px" />
                        )}

                        <TabPanel value={view} index={0} className="stake-tab-panel">
                          {isAllowanceDataLoading ? (
                            <Skeleton />
                          ) : address && hasAllowance("fhm") ? (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "staking")}
                              onClick={() => {
                                onChangeStake("stake");
                              }}
                            >
                              {txnButtonText(pendingTransactions, "staking", "Stake FHM")}
                            </Button>
                          ) : (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "approve_staking")}
                              onClick={() => {
                                onSeekApproval("fhm");
                              }}
                            >
                              {txnButtonText(pendingTransactions, "approve_staking", "Approve")}
                            </Button>
                          )}
                        </TabPanel>
                        <TabPanel value={view} index={1} className="stake-tab-panel">
                          {isAllowanceDataLoading ? (
                            <Skeleton />
                          ) : address && hasAllowance("sfhm") ? (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "unstaking")}
                              onClick={() => {
                                onChangeStake("unstake");
                              }}
                            >
                              {txnButtonText(pendingTransactions, "unstaking", "Unstake FHM")}
                            </Button>
                          ) : (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "approve_unstaking")}
                              onClick={() => {
                                onSeekApproval("sfhm");
                              }}
                            >
                              {txnButtonText(pendingTransactions, "approve_unstaking", "Approve")}
                            </Button>
                          )}
                        </TabPanel>
                      </Box>
                    </Box>

                    <div className={`stake-user-data`}>
                      <div className="data-row">
                        <Typography variant="body1">Your Balance</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trim(ohmBalance, 4)} FHM</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">Your Staked Balance</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trimmedBalance} sFHM</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">Next Reward Amount</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{nextRewardValue} sFHM</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">Next Reward Yield</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{stakingRebasePercentage}%</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">ROI (5-Day Rate)</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trim(fiveDayRate * 100, 4)}%</>}
                        </Typography>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Grid>
          </Paper>
        </Zoom>

        {/*<ExternalStakePool />*/}
      </div>
    </div>
  );
}

export default Stake;
