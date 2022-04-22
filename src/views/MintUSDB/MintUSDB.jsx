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
import TabPanel from "../../components/TabPanel";
import { getOhmTokenImage, getTokenImage, trim } from "../../helpers";
import {
  changeApproval,
  changeStake,
  changeClaim,
  changeForfeit,
  changeMint,
  changeFHUDApproval
} from "../../slices/StakeThunk";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./stake.scss";
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

function MintUSDB() {
  const dispatch = useDispatch();
  const { provider, address, connected, connect, chainId } = useWeb3Context();

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState("");

  const isAppLoading = useSelector(state => state.app.loading);
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });

  const fhudBalance = useSelector(state => {
    return state.account.balances && state.account.balances.fhud;
  });
  const usdbBalance = useSelector(state => {
    return state.account.balances && state.account.balances.usdb;
  });
  const fhudAllowance = useSelector(state => {
    console.log("accountInformation",state.account)
    return state.account.staking && state.account.staking.fhudAllowance;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    setQuantity(trim(fhudBalance, 4));
  };

  const onSeekApproval = async token => {
    await dispatch(changeFHUDApproval({ address, token, provider, networkId: chainId }));
  };

  const onChangeStake = async action => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(quantity) || quantity === 0 || quantity === "") {
      // eslint-disable-next-line no-alert
      return dispatch(error("Please enter a value!"));
    }

    // 1st catch if quantity > balance
    let gweiValue = ethers.utils.parseUnits(quantity, "gwei");
    if (action === "mint" && gweiValue.gt(ethers.utils.parseUnits(trim(fhudBalance, 4), 18))) {
      return dispatch(error("You cannot mint more than your FHUD balance."));
    }
    if (chainId === 250) {
      await dispatch(changeMint({ address, action, value: quantity.toString(), provider, networkId: chainId }));
    }
  };

  const hasAllowance = useCallback(
    token => {
      if (token === "fhud") return fhudAllowance > 0;
      return 0;
    },
    [fhudAllowance],
  );

  const isAllowanceDataLoading = fhudAllowance == null && view === 0;

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
    [fhudBalance]
      .filter(Boolean)
      .map(balance => Number(balance))
      .reduce((a, b) => a + b, 0)
      .toFixed(4),
  );

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

  return (
    <div class="stake">
      <div id="stake-view">
        <Zoom in={true} onEntered={() => setZoomed(true)}>
          <Paper className={`ohm-card`}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <div className="card-header">
                  <Typography variant="h5">FHUD ➜ USDB</Typography>
                </div>
              </Grid>

              <div className="staking-area">
                {!address ? (
                  <div className="stake-wallet-notification">
                    <div className="wallet-menu" id="wallet-menu">
                      {modalButton}
                    </div>
                    <Typography variant="h6">Connect your wallet to claim USDB</Typography>
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
                        <Tab label="Claim" {...a11yProps(0)} />
                      </Tabs>

                      <Box className="stake-action-row " display="flex" alignItems="center">
                        {address && !isAllowanceDataLoading ? (
                          !hasAllowance("fhud") && view === 0 ? (
                            <Box className="help-text">
                              <Typography variant="body1" className="stake-note" color="textSecondary">
                                {view === 0 ? (
                                  <>
                                    Please approve Fantohm to use your <b>FHUD</b> to claim USDB.
                                  </>
                                ) : (
                                  <></>
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
                          ) : address && hasAllowance("fhud") ? (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "approve_minting")}
                              onClick={() => {
                                onChangeStake("mint");
                              }}
                            >
                              {txnButtonText(pendingTransactions, "minting", "Claim USDB")}
                            </Button>
                          ) : (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "approve_minting")}
                              onClick={() => {
                                onSeekApproval("fhud");
                              }}
                            >
                              {txnButtonText(pendingTransactions, "approve_minting", "Approve")}
                            </Button>
                          )}
                        </TabPanel>
                      </Box>
                    </Box>

                    <div className={`stake-user-data`}>
                      <div className="data-row">
                        <Typography variant="body1">Your Balance</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trim(fhudBalance, 4)} FHUD</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">Your USDB Balance</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trim(usdbBalance, 4)} USDB</>}
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

export default MintUSDB;
