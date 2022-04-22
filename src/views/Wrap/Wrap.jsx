import { useCallback, useState, useEffect, useMemo } from "react";
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
import { changeApproval, changeWrap, calcWrapValue } from "../../slices/WrapThunk";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./wrap.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import { error } from "../../slices/MessagesSlice";
import { ethers, BigNumber } from "ethers";
import fromExponential from 'from-exponential';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function Wrap() {
  const dispatch = useDispatch();
  const { provider, address, connect, chainId } = useWeb3Context();

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState("0");
  const [convertedQuantity, setConvertedQuantity] = useState("0");

  const wsohmSymbol = useMemo(() => {
    if (chainId == 250 || chainId == 4002) {
      // Fantom
      return 'fwsFHM';
    } else if (chainId == 1285 || chainId == 1287) {
      // Moonriver
      return 'mwsFHM';
    }
    return 'wsFHM';
  }, [chainId]);

  const isAppLoading = useSelector(state => state.app.loading);
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });

  const sohmBalance = useSelector(state => {
    // sFHM
    return state.account.balances && state.account.balances.sohm;
  });
  const wsohmBalance = useSelector(state => {
    // wsFHM
    return state.account.balances && state.account.balances.wsohm;
  });

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });
  const wsOhmPrice = useSelector(state => {
    return state.app.marketPrice * currentIndex; // state.app.currentIndex;
  });

  const sohmWrappingAllowance = useSelector(state => {
    // for wrapping (in SFHM)
    return state.account.wrapping && state.account.wrapping.sohmWrappingAllowance;
  });
  const wsohmUnwrappingAllowance = useSelector(state => {
    // for unwrapping (in WSFHM)
    return state.account.wrapping && state.account.wrapping.wsohmUnwrappingAllowance;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(sohmBalance);
    } else {
      setQuantity(wsohmBalance);
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
    if (action === "wrap") {
      let gweiValue = ethers.utils.parseUnits(quantity, 9);
      if (gweiValue.gt(ethers.utils.parseUnits(sohmBalance, 9))) {
        return dispatch(error("You cannot wrap more than your sFHM balance."));
      }
    }

    if (action === "unwrap") {
      let gweiValue = ethers.utils.parseUnits(quantity, 18);
      if (gweiValue.gt(ethers.utils.parseUnits(wsohmBalance, 18))) {
        return dispatch(error("You cannot unwrap more than your "+ wsohmSymbol +" balance."));
      }
    }

    await dispatch(changeWrap({ address, action, value: quantity.toString(), provider, networkId: chainId }));
  };

  const hasAllowance = useCallback(
    token => {
      if (token === "sfhm") return sohmWrappingAllowance > 0;
      if (token === "wsfhm") return wsohmUnwrappingAllowance > 0;
      return 0;
    },
    [sohmWrappingAllowance, wsohmUnwrappingAllowance],
  );

  const isAllowanceDataLoading = (sohmWrappingAllowance == null && view === 0) || (wsohmUnwrappingAllowance == null && view === 1);

  useEffect(() => {
    if (
      isNaN(quantity) || quantity === 0 ||
      quantity === "" || quantity === "0" ||
      !currentIndex || Number(quantity) < 0
    ) {
      setConvertedQuantity(0);
      return;
    }
    if (typeof(quantity) === 'string' && quantity.startsWith('-')) {
      setConvertedQuantity(0);
      return;
    }

    calcWrapValue({
      networkId: chainId,
      isWrap: view === 0,
      value: quantity,
    }).then((value) => {
      setConvertedQuantity(value);
    });
  }, [quantity, chainId, view]);

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
    <div id="wrap-view">
      <Zoom in={true} onEntered={() => setZoomed(true)}>
        <Paper className={`ohm-card`}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <div className="card-header">
                <Typography variant="h5">Wrap / Unwrap</Typography>
                <Typography variant="body2">
                  
                </Typography>
              </div>
            </Grid>

            <Grid item>
              <div className="wrap-top-metrics">
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} sm={4} md={4} lg={4}>
                    <div className="wrap-apy">
                      <Typography variant="h5" color="textSecondary">
                        sFHM Price
                      </Typography>
                      <Typography variant="h4">
                        {marketPrice ? (
                          new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 0,
                          }).format(marketPrice)
                        ) : (
                          <Skeleton width="150px" />
                        )}
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={4} md={4} lg={4}>
                    <div className="wrap-tvl">
                      <Typography variant="h5" color="textSecondary">
                        Current Index
                      </Typography>
                      <Typography variant="h4">
                        {currentIndex ? (
                          new Intl.NumberFormat("en-US", {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 0,
                          }).format(currentIndex)
                          + ' FHM'
                        ) : (
                          <Skeleton width="150px" />
                        )}
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={4} md={4} lg={4}>
                    <div className="wrap-tvl">
                      <Typography variant="h5" color="textSecondary">
                        {wsohmSymbol}
                      </Typography>
                      <Typography variant="h4">
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
                    </div>
                  </Grid>

                </Grid>
              </div>
            </Grid>


            <div className="wrapping-area">
              {!address ? (
                <div className="wrap-wallet-notification">
                  <div className="wallet-menu" id="wallet-menu">
                    {modalButton}
                  </div>
                  <Typography variant="h6">Connect your wallet to wrap and unwrap sFHM</Typography>
                </div>
              ) : (
                <>
                  <Box className="wrap-action-area">
                    <Tabs
                      key={String(zoomed)}
                      centered
                      value={view}
                      textColor="primary"
                      indicatorColor="primary"
                      className="wrap-tab-buttons"
                      onChange={changeView}
                      aria-label="wrap tabs"
                    >
                      <Tab label="Wrap" {...a11yProps(0)} />
                      <Tab label="Unwrap" {...a11yProps(1)} />
                    </Tabs>

                    <Box className="wrap-action-row " display="flex" alignItems="center">
                      {address && !isAllowanceDataLoading ? (
                        (!hasAllowance("sfhm") && view === 0) || (!hasAllowance("wsfhm") && view === 1) ? (
                          <Box className="help-text">
                            <Typography variant="body1" className="wrap-note" color="textSecondary">
                              {view === 0 ? (
                                <>
                                  First time wrapping <b>sFHM</b>?
                                  <br />
                                  Please approve Fantohm to use your <b>sFHM</b> for wrapping.
                                </>
                              ) : (
                                <>
                                  First time unwrapping <b>{wsohmSymbol}</b>?
                                  <br />
                                  Please approve Fantohm to use your <b>{wsohmSymbol}</b> for unwrapping.
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
                              className="wrap-input"
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

                      <TabPanel value={view} index={0} className="wrap-tab-panel">
                        {isAllowanceDataLoading ? (
                          <Skeleton />
                        ) : address && hasAllowance("sfhm") ? (
                          <Button
                            className="wrap-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "wrap")}
                            onClick={() => {
                              onChangeConvert("wrap");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "wrap", "Wrap")}
                          </Button>
                        ) : (
                          <Button
                            className="wrap-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "approve_wrap")}
                            onClick={() => {
                              onSeekApproval("sfhm");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "approve_wrap", "Approve")}
                          </Button>
                        )}
                      </TabPanel>
                      <TabPanel value={view} index={1} className="wrap-tab-panel">
                        {isAllowanceDataLoading ? (
                          <Skeleton />
                        ) : address && hasAllowance("wsfhm") ? (
                          <Button
                            className="wrap-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "unwrap")}
                            onClick={() => {
                              onChangeConvert("unwrap");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "unwrap", "Unwrap")}
                          </Button>
                        ) : (
                          <Button
                            className="wrap-button"
                            variant="contained"
                            color="primary"
                            disabled={isPendingTxn(pendingTransactions, "approve_unwrap")}
                            onClick={() => {
                              onSeekApproval("wsfhm");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "approve_unwrap", "Approve")}
                          </Button>
                        )}
                      </TabPanel>
                    </Box>
                  </Box>

                  {view === 0 && hasAllowance('sfhm') ? (
                  <div className={`wrap-user-data`}>
                    <div className="data-row">
                      <Typography variant="body1">Your balance</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(sohmBalance, 9)} sFHM</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">Wrapping</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(quantity, 9)} sFHM</>}
                      </Typography>
                    </div>

                    {/*
                    <div className="data-row">
                      <Typography variant="body1">Fee</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{fee/10}%</>}
                      </Typography>
                    </div>
                    */}

                    <div className="data-row">
                      <Typography variant="body1">You get</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(convertedQuantity, 9)} {wsohmSymbol}</>}
                        {/*isAppLoading ? <Skeleton width="80px" /> : <>{trim(quantity*(1-(fee/1000)), 2)} {wsohmSymbol}</>*/}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">You have</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(wsohmBalance, 9)} {wsohmSymbol}</>}
                      </Typography>
                    </div>

                  </div>) : <></>}

                  {view === 1 && hasAllowance('wsfhm') ? (
                  <div className={`wrap-user-data`}>
                    <div className="data-row">
                      <Typography variant="body1">Your balance</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(wsohmBalance, 9)} {wsohmSymbol}</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">Unwrapping</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(quantity, 9)} {wsohmSymbol}</>}
                      </Typography>
                    </div>

                    {/*
                    <div className="data-row">
                      <Typography variant="body1">Fee</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{fee/10}%</>}
                      </Typography>
                    </div>
                    */}

                    <div className="data-row">
                      <Typography variant="body1">You get</Typography>
                      <Typography variant="body1">
                        {/*isAppLoading ? <Skeleton width="80px" /> : <>{trim(quantity*(1-(fee/1000)), 2)} sFHM</>*/}
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(convertedQuantity, 9)} sFHM</>}
                      </Typography>
                    </div>

                    <div className="data-row">
                      <Typography variant="body1">You have</Typography>
                      <Typography variant="body1">
                        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(sohmBalance, 9)} sFHM</>}
                      </Typography>
                    </div>

                  </div>) : <></>}

                </>
              )}
            </div>
          </Grid>
        </Paper>
      </Zoom>
    </div>
  );
}

export default Wrap;
