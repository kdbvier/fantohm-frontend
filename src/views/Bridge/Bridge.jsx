import { useCallback, useState, useEffect } from "react";
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
import { changeApproval, convert, getBridgeFee, getBridgeBalances } from "../../slices/BridgeThunk";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./bridge.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import { error } from "../../slices/MessagesSlice";
import { ethers } from "ethers";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const sOhmImg = getTokenImage("sfhm");
const ohmImg = getOhmTokenImage(16, 16);

function Bridge() {
  const dispatch = useDispatch();
  const { provider, address, connect, chainId } = useWeb3Context();

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState("0");
  const [fee, setFee] = useState(0);
  const [bridgeOhmBalance, setBridgeOhmBalance] = useState(0);
  const [bridgeBridgeBalance, setBridgeBridgeBalance] = useState(0);

  const isAppLoading = useSelector(state => state.app.loading);

  const bridgeBalance = useSelector(state => {
    // FHM.m
    return state.account.balances && state.account.balances.bridge;
  });
  const ohmBalance = useSelector(state => {
    // FHM
    return state.account.balances && state.account.balances.ohm;
  });
  const bridgeDownstreamAllowance = useSelector(state => {
    // for incoming (in FHM.m)
    return state.account.bridging && state.account.bridging.bridgeDownstreamAllowance;
  });
  const bridgeUpstreamAllowance = useSelector(state => {
    // for outgoing (in FHM)
    return state.account.bridging && state.account.bridging.bridgeUpstreamAllowance;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(bridgeBalance);
    } else {
      setQuantity(ohmBalance);
    }
  };

  const onSeekApproval = async token => {
    await dispatch(changeApproval({ address, token, provider, networkId: chainId }));
  };

  const onChangeConvert = async action => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(quantity) || quantity === 0 || quantity === "") {
      // eslint-disable-next-line no-alert
      return dispatch(error("Please enter a value!"));
    }

    // 1st catch if quantity > balance
    let gweiValue = ethers.utils.parseUnits(quantity, "gwei");
    if (action === "downstream" && gweiValue.gt(ethers.utils.parseUnits(bridgeBalance, "gwei"))) {
      return dispatch(error("You cannot convert more than your FHM.m balance."));
    }

    if (action === "upstream" && gweiValue.gt(ethers.utils.parseUnits(ohmBalance, "gwei"))) {
      return dispatch(error("You cannot convert more than your FHM balance."));
    }

    await dispatch(convert({ address, action, value: quantity.toString(), provider, networkId: chainId }));
  };

  useEffect(() => {
    loadData();
    return () => {};
    async function loadData() {
      const bridgeFee = await getBridgeFee(chainId);
      setFee(''+bridgeFee);
      const bridgeBalance = await getBridgeBalances(chainId);
      setBridgeOhmBalance(ethers.utils.formatUnits(bridgeBalance.ohm, 'gwei'));
      setBridgeBridgeBalance(ethers.utils.formatUnits(bridgeBalance.bridge, 'gwei'));
    }
  }, [chainId]);

  const hasAllowance = useCallback(
    token => {
      if (token === "fhm") return bridgeUpstreamAllowance > 0;
      if (token === "fhm.m") return bridgeDownstreamAllowance > 0;
      return 0;
    },
    [bridgeUpstreamAllowance, bridgeDownstreamAllowance],
  );

  const isAllowanceDataLoading = (bridgeDownstreamAllowance == null && view === 0) || (bridgeUpstreamAllowance == null && view === 1);

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  );

  const changeView = (event, newView) => {
    setView(newView);
  };

  return (
    <div id="bridge-view">
      <Zoom in={true} onEntered={() => setZoomed(true)}>
        <Paper className={`ohm-card`}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <div className="card-header">
                <Typography variant="h5">Bridge</Typography>
                <Typography variant="body2">
                  Convert from and to <strong>Fantom</strong> and <strong>Moonriver</strong>
                </Typography>
              </div>
            </Grid>

            <div className="bridging-area">
              {!address ? (
                <div className="bridge-wallet-notification">
                  <div className="wallet-menu" id="wallet-menu">
                    {modalButton}
                  </div>
                  <Typography variant="h6">Connect your wallet to bridge FHM</Typography>
                </div>
              ) : (
                <>
                  <Box className="bridge-action-area">
                    <Tabs
                      key={String(zoomed)}
                      centered
                      value={view}
                      textColor="primary"
                      indicatorColor="primary"
                      className="bridge-tab-buttons"
                      onChange={changeView}
                      aria-label="bridge tabs"
                    >
                      <Tab label="Incoming" {...a11yProps(0)} />
                      <Tab label="Outgoing" {...a11yProps(1)} />
                    </Tabs>

                    <Box className="bridge-action-row " display="flex" alignItems="center">
                      {address && !isAllowanceDataLoading ? (
                        (!hasAllowance("fhm.m") && view === 0) || (!hasAllowance("fhm") && view === 1) ? (
                          <Box className="help-text">
                            <Typography variant="body1" className="bridge-note" color="textSecondary">
                              {view === 0 ? (
                                <>
                                  First time bridging with <b>FHM.m</b>?
                                  <br />
                                  Please approve Fantohm to use your <b>FHM.m</b> for bridging.
                                </>
                              ) : (
                                <>
                                  First time bridging <b>FHM</b>?
                                  <br />
                                  Please approve Fantohm to use your <b>FHM</b> for bridging.
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
                              className="bridge-input"
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

                      <TabPanel value={view} index={0} className="bridge-tab-panel">
                        {isAllowanceDataLoading ? (
                          <Skeleton />
                        ) : address && hasAllowance("fhm.m") ? (
                          <Button
                            className="bridge-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "downstream")}
                            onClick={() => {
                              onChangeConvert("downstream");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "downstream", "Convert to FHM")}
                          </Button>
                        ) : (
                          <Button
                            className="bridge-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "approve_downstream")}
                            onClick={() => {
                              onSeekApproval("fhm.m");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "approve_downstream", "Approve")}
                          </Button>
                        )}
                      </TabPanel>
                      <TabPanel value={view} index={1} className="bridge-tab-panel">
                        {isAllowanceDataLoading ? (
                          <Skeleton />
                        ) : address && hasAllowance("fhm") ? (
                          <Button
                            className="bridge-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "upstream")}
                            onClick={() => {
                              onChangeConvert("upstream");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "upstream", "Convert to FHM.m")}
                          </Button>
                        ) : (
                          <Button
                            className="bridge-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "approve_upstream")}
                            onClick={() => {
                              onSeekApproval("fhm");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "approve_upstream", "Approve")}
                          </Button>
                        )}
                      </TabPanel>
                    </Box>
                  </Box>

                  {view === 0 && hasAllowance('fhm.m') ? (
                  <div className={`bridge-user-data`}>
                    <div className="data-row">
                      <Typography variant="body1">Your balance</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(bridgeBalance, 2)} FHM.m</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">Converting</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(quantity, 2)} FHM.m</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">Fee</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{fee/10}%</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">You get</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(quantity*(1-(fee/1000)), 2)} FHM</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">You have</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(ohmBalance, 2)} FHM</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">Pool</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{bridgeOhmBalance} FHM &#47; {bridgeBridgeBalance} FHM.m</>}
                      </Typography>
                    </div>
                  </div>) : <></>}

                  {view === 1 && hasAllowance('fhm') ? (
                  <div className={`bridge-user-data`}>
                    <div className="data-row">
                      <Typography variant="body1">Your balance</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(ohmBalance, 2)} FHM</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">Converting</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(quantity, 2)} FHM</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">Fee</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{fee/10}%</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">You get</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(quantity*(1-(fee/1000)), 2)} FHM.m</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">You have</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(bridgeBalance, 2)} FHM.m</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">Pool</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{bridgeOhmBalance} FHM &#47; {bridgeBridgeBalance} FHM.m</>}
                      </Typography>
                    </div>
                  </div>) : <></>}

                  {/*
                  <div className="bridge-wallet-notification">
                    <div className="wallet-menu" id="wallet-menu">
                      <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
                        Convert
                      </Button>
                    </div>
                  </div>
                  */}
                </>
              )}
            </div>
          </Grid>
        </Paper>
      </Zoom>
    </div>
  );
}

export default Bridge;
