import {
  Box,
  Typography,
  Zoom,
  Paper,
  Button, Grid, Tooltip,
} from "@material-ui/core";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { useEffect, useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BestRouteResponse,
  RangoClient,
  TransactionStatus,
} from "rango-sdk";
import ReactLoading from "react-loading";

import BestRoute from "./BestRoute";
import FromTokenSection from "./FromTokenSection";
import ToTokenSection from "./ToTokenSection";
import BondSection from "./BondSection";
import {closeAll, info, multiChainSwap} from "../../slices/MessagesSlice";
import NetworkModal from "./NetworkModal";
import TokenModal from "./TokenModal";
import BondModal from "./BondModal";
import { useWeb3Context } from "../../hooks";
import useBonds from "../../hooks/Bonds";
import { swapNetworks, modalType } from "./data";
import { RANGO_API_KEY } from "../../constants";
import { getSavedNetworkId } from "../../hooks/web3Context";
import {
  formatAmount,
  getDownRate,
  expectSwapErrors,
  sliceList,
  requireAssetMessage, prepareEvmTransaction, checkApprovalSync, sortTokenList,
} from "../../helpers/Dex";
import useDebounce from "../../hooks/Debounce";
import { sleep } from "../../helpers/Sleep";
import { trim } from "../../helpers";
import { error } from "../../slices/MessagesSlice";
import { NetworkIds } from "../../networks";
import { BondType } from "../../lib/Bond";
import { DebugHelper } from "../../helpers/DebugHelper";
import "./dex.scss";

const rangoClient = new RangoClient(RANGO_API_KEY);
let messageDetail;

function Dex() {

  const dispatch = useDispatch();

  const { provider, chainId, connect, switchEthereumChain, address } = useWeb3Context();
  const { bonds } = useBonds(chainId);
  const bonds44 = bonds.filter(bond => bond.type === BondType.Bond_44 && !bond.isLP);

  const [fromNetworkModalOpen, setFromNetworkModalOpen] = useState(false);
  const [fromTokenModalOpen, setFromTokenModalOpen] = useState(false);
  const [fromNetwork, setFromNetwork] = useState(null);
  const [fromTokenList, setFromTokenList] = useState([]);
  const [fromSearchTokenList, setFromSearchTokenList] = useState([]);
  const [fromToken, setFromToken] = useState(null);
  const [fromTokenAmount, setFromTokenAmount] = useState("");
  const fromTokenAmountDebounce = useDebounce(fromTokenAmount, 1000);

  const [toNetworkModalOpen, setToNetworkModalOpen] = useState(false);
  const [toTokenModalOpen, setToTokenModalOpen] = useState(false);
  const [toNetwork, setToNetwork] = useState(null);
  const [toTokenList, setToTokenList] = useState([]);
  const [toSearchTokenList, setToSearchTokenList] = useState([]);
  const [toToken, setToToken] = useState(null);
  const [toTokenAmount, setToTokenAmount] = useState("");

  const [bond, setBond] = useState(null);
  const [bondModalOpen, setBondModalOpen] = useState(false);
  const [bondInitialized, setBondInitialized] = useState(false);

  const [initialized, setInitialized] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [fromUpdateTokenLoading, setFromUpdateTokenLoading] = useState(false);
  const [toUpdateTokenLoading, setToUpdateTokenLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [bestRoute, setBestRoute] = useState(null);
  const [requiredAssets, setRequiredAssets] = useState([]);
  const [slippage, setSlippage] = useState(1);
  const [forceBondLoading, setForceBondLoading] = useState(false);

  const metaData = useSelector(state => {
    return state?.swap?.value;
  });

  const changeNetworks = async (chainId) => {
    const result = await switchEthereumChain(chainId);
    if (!result) {
      const message = "Unable to switch networks. Please change network using provider.";
      dispatch(error(message));
    }
    return result;
  };

  const outOfService = (chainName) => {
    dispatch(info(`Swap on ${chainName} chain is currently out of service.`));
  };

  const isSwappable = () => {
    return (bestRoute && bestRoute?.result) && expectSwapErrors(bestRoute?.result?.swaps).length === 0 && requireAssetMessage(requiredAssets).length === 0;
  };

  const isPriceImpact = () => {
    return isSwappable() && getDownRate(fromToken, toToken, fromTokenAmount, toTokenAmount)< -5;
  };

  const initialize = async () => {
    if (!metaData) {
      return;
    }
    setInitialLoading(true);
    const toNetwork = swapNetworks[2];
    let fromNetwork;
    fromNetwork = swapNetworks[0];
    setFromNetwork(fromNetwork);
    setToNetwork(toNetwork);
    setInitialLoading(false);
    await fromNetworkDetails(fromNetwork);
    await toNetworkDetails(toNetwork);
    setInitialized(true);
  };

  const setMaxFromTokenAmount = () => {
    setFromTokenAmount(Number(formatAmount(fromToken?.amount, fromToken?.decimals, 2, fromToken?.symbol)));
  };

  const opeNetworkModal = (type) => {
    if (type === modalType.from) {
      setFromNetworkModalOpen(true);
    } else {
      setToNetworkModalOpen(true);
    }
  };

  const openBondModal = () => {
    setBondModalOpen(true);
  };

  const closeAllModal = () => {
    setFromNetworkModalOpen(false);
    setToNetworkModalOpen(false);
    setFromTokenModalOpen(false);
    setToTokenModalOpen(false);
    setBondModalOpen(false);
  };

  const openTokenModal = (type) => {
    if (type === modalType.from) {
      setFromTokenModalOpen(true);
    } else {
      setToTokenModalOpen(true);
    }
  };

  const closeBondModal = (bond) => {
    closeAllModal();
    if (!bond) {
      return;
    }
    setBond(bond);
  };

  const closeNetworkModal = (type, network) => {
    closeAllModal();
    if (!network) {
      return;
    }
    if (type === modalType.from) {
      setFromNetwork(network);
    } else {
      setToNetwork(network);
    }
    setBestRoute(null);
  };

  const closeTokenModal = (type, token) => {
    closeAllModal();
    if (!token) {
      return;
    }
    if (type === modalType.from) {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setToTokenAmount("");
    setBestRoute(null);
  };

  const changeTokenModalList = (name, type) => {
    if (type === modalType.from) {
      const list = fromTokenList.filter(token => token.symbol.toLowerCase().indexOf(name.toLowerCase())>=0);
      setFromSearchTokenList(list);
    } else {
      const list = toTokenList.filter(token => token.symbol.toLowerCase().indexOf(name.toLowerCase())>=0);
      setToSearchTokenList(list);
    }
  };

  const fromNetworkDetails = async (fromNetwork) => {
    setFromUpdateTokenLoading(true);
    let fromTokenList = metaData.tokens.filter(token => token?.blockchain === fromNetwork?.blockchain);
    if (fromTokenList.length) {
      fromTokenList = fromTokenList.map(token => {
        return { ...token, amount: 0 };
      });
    }
    setFromTokenList(fromTokenList);
    setFromSearchTokenList(fromTokenList);
    if (!address) {
      sortTokenList(fromNetwork, fromTokenList);
      setFromToken(fromTokenList[0]);
      setFromUpdateTokenLoading(false);
      return;
    }
    const walletDetails = await rangoClient.getWalletsDetails([{
      blockchain: fromNetwork?.blockchain,
      address: address,
    }]);
    walletDetails.wallets.forEach(wallet => {
      if (wallet.balances) {
        wallet.balances.forEach(balance => {
          const index = fromTokenList.findIndex(token => token.address === balance?.asset?.address);
          if (index>=0) {
            fromTokenList[index].amount = Number(balance?.amount.amount) || 0;
          }
        });
      } else {
        outOfService(wallet.blockChain);
      }
    });
    fromTokenList.sort((a, b) => b.amount - a.amount);
    sortTokenList(fromNetwork, fromTokenList);
    setFromTokenList(fromTokenList);
    setFromSearchTokenList(fromTokenList);
    setFromToken(fromTokenList[0]);
    setFromUpdateTokenLoading(false);
  };

  const toNetworkDetails = async (toNetwork) => {
    setToUpdateTokenLoading(true);
    let toTokenList = metaData.tokens.filter(token => token.blockchain === toNetwork?.blockchain);
    if (toTokenList.length) {
      toTokenList = toTokenList.map(token => {
        return { ...token, amount: 0 };
      });
    }
    setToTokenList(toTokenList);
    setToSearchTokenList(toTokenList);
    if (!address) {
      sortTokenList(toNetwork, toTokenList);
      if (!fromNetwork && fromNetwork?.blockchain === toNetwork?.blockchain) {
        setToToken(toTokenList[1]);
      } else {
        setToToken(toTokenList[0]);
      }
      setToUpdateTokenLoading(false);
      return;
    }
    const walletDetails = await rangoClient.getWalletsDetails([{
      blockchain: toNetwork?.blockchain,
      address: address,
    }]);
    walletDetails.wallets.forEach(wallet => {
      if (wallet.balances) {
        wallet.balances.forEach(balance => {
          const index = toTokenList.findIndex(token => token.address === balance?.asset?.address);
          if (index>=0) {
            toTokenList[index].amount = Number(balance?.amount.amount) || 0;
          }
        });
      } else {
        outOfService(wallet.blockChain);
      }
    });
    toTokenList.sort((a, b) => b.amount - a.amount);
    sortTokenList(toNetwork, toTokenList);
    setToTokenList(toTokenList);
    setToSearchTokenList(toTokenList);
    if (!fromNetwork && fromNetwork?.blockchain === toNetwork?.blockchain) {
      setToToken(toTokenList[1]);
    } else {
      setToToken(toTokenList[0]);
    }
    setToUpdateTokenLoading(false);
  };

  const getBestRoute = async () => {
    setRouteLoading(true);
    setToTokenAmount("");
    let connectedWallets = [];
    const selectedWallets = {};
    if (address) {
      connectedWallets = swapNetworks.map(network => {
        return {
          blockchain: network?.blockchain,
          addresses: [address],
        };
      });
      selectedWallets[fromNetwork?.blockchain] = address;
      if (fromNetwork?.chainId !== toNetwork?.chainId) {
        selectedWallets[toNetwork?.blockchain] = address;
      }
    }
    const from = {
      blockchain: fromToken?.blockchain,
      symbol: fromToken?.symbol,
      address: fromToken?.address?.toLowerCase(),
    };
    const to = {
      blockchain: toToken?.blockchain,
      symbol: toToken?.symbol,
      address: toToken?.address == null ? toToken?.address : toToken?.address?.toLowerCase(),
    };
    const bestRoute = await rangoClient.getBestRoute({
      amount: fromTokenAmount,
      affiliateRef: null,
      checkPrerequisites: true,
      connectedWallets,
      from,
      selectedWallets,
      to,
    });
    messageDetail = {
      details: [],
      step: 0,
      type: "swap",
      title: `Swap ${ fromTokenAmount } ${ fromToken.symbol } to ${ toToken.symbol }`,
    };
    if (bestRoute?.result?.swaps?.length) {
      bestRoute.result.swaps = bestRoute.result.swaps.map(swap => {
        return {
          ...swap,
          logo: metaData?.swappers.find(sw => sw.id === swap.swapperId)?.logo,
        };
      });
      bestRoute.result.swaps.forEach((swap, index) => {
        messageDetail.details.push({
          text: "",
          txStatus: null,
          txHash: null,
          step: index,
          swap,
        });
      });
    }
    setBestRoute(bestRoute);
    setToTokenAmount(trim(bestRoute?.result?.outputAmount, 4) || 0);
    setRouteLoading(false);
    const requiredAssets = bestRoute.validationStatus?.flatMap(v => v.wallets.flatMap(w => w.requiredAssets)) || [];
    setRequiredAssets(requiredAssets);
  };

  const beforeUnloadListener = (event) => {
    event.preventDefault();
    return event.returnValue = "Are you sure you want to cancel swap and leave it not complete?";
  };

  const preventLeave = (prevent) => {

    const root = document.documentElement;

    if(prevent) {
      root.style.cursor = "progress";
      document.body.setAttribute("is-paralyzed", "");
      addEventListener("beforeunload", beforeUnloadListener, {capture: true});
    } else {
      root.style.removeProperty("cursor");
      document.body.removeAttribute("is-paralyzed");
      removeEventListener("beforeunload", beforeUnloadListener, {capture: true});
    }
  }

  const swap = async () => {
    let currentStep = 0;
    messageDetail.step = currentStep;
    if (messageDetail.details.length>=0) {
      messageDetail.details[currentStep].text = "Swap process started";
    }
    dispatch(multiChainSwap(JSON.parse(JSON.stringify(messageDetail))));
    setRequiredAssets([]);
    setForceBondLoading(false);
    if (!fromToken || !toToken) {
      return;
    }
    setSwapLoading(true);
    preventLeave(true);
    try {
      while (true) {
        const txStatus = await executeRoute(bestRoute, currentStep);
        if (!txStatus || txStatus?.status !== TransactionStatus.SUCCESS || currentStep>=bestRoute.result.swaps.length - 1) {
          break;
        }
        currentStep++;
      }
    } catch (e) {
      console.log("error", e);
    }

    preventLeave(false);
  };

  const executeRoute = async (routeResponse: BestRouteResponse, step: number) => {
    if (routeResponse.result.swaps[step]) {
      const network = swapNetworks.find(network => network.blockchain === routeResponse.result.swaps[step].from.blockchain);
      if (network.chainId !== getSavedNetworkId()) {
        messageDetail.details[step].text = `Please change your wallet network to ${ network.blockchain }`;
        const result = await changeNetworks(network?.chainId);
        if (!result) {
          dispatch(closeAll());
          return;
        }
      }
    }
    messageDetail.details[step].text = `Sending request to ${ routeResponse.result.swaps[step].swapperId } for ${ routeResponse.result.swaps[step].from?.blockchain }.${ routeResponse.result.swaps[step].from?.symbol } token`;
    messageDetail.step = step;
    dispatch(multiChainSwap(JSON.parse(JSON.stringify(messageDetail))));
    const signer = provider.getSigner();

    let evmTransaction;
    try {
      while (true) {
        const transactionResponse = await rangoClient.createTransaction({
          requestId: routeResponse.requestId,
          step: step + 1,
          userSettings: { "slippage": slippage },
          validations: { balance: true, fee: true },
        });

        evmTransaction = transactionResponse.transaction;
        if (evmTransaction.isApprovalTx) {
          const finalTx = prepareEvmTransaction(evmTransaction);
          await signer.sendTransaction(finalTx);
          await checkApprovalSync(routeResponse, rangoClient);
        } else {
          break;
        }
      }
      const finalTx = prepareEvmTransaction(evmTransaction);
      const txHash = (await signer.sendTransaction(finalTx)).hash;
      messageDetail.details[step].text = `Request sent to ${ routeResponse.result.swaps[step].swapperId } for ${ routeResponse.result.swaps[step].from?.blockchain }.${ routeResponse.result.swaps[step].from?.symbol } token`;
      messageDetail.details[step].txHash = txHash;
      dispatch(multiChainSwap(JSON.parse(JSON.stringify(messageDetail))));
      const txStatus = await checkTransactionStatusSync(txHash, routeResponse, rangoClient, step);
      if (txStatus?.step>=routeResponse.result.swaps.length - 1) {
        if (fromNetwork?.chainId === NetworkIds.FantomOpera || toNetwork?.chainId === NetworkIds.FantomOpera) {
          setForceBondLoading(true);
        }
        setSwapLoading(false);
        setBestRoute(null);
        setFromTokenAmount("");
        setToTokenAmount("");
        dispatch(closeAll());
        await fromNetworkDetails(fromNetwork);
        await toNetworkDetails(toNetwork);
      }
      return txStatus;
    } catch (e) {
      setSwapLoading(false);
      const rawMessage = JSON.stringify(e).substring(0, 90) + "...";
      await rangoClient.reportFailure({
        data: { message: rawMessage },
        eventType: "TX_FAIL",
        requestId: routeResponse.requestId,
      });
      dispatch(closeAll());
      setBestRoute(null);
      await fromNetworkDetails(fromNetwork);
      await toNetworkDetails(toNetwork);
      return {
        status: TransactionStatus.FAILED,
      };
    }
  };

  const checkTransactionStatusSync = async (txHash: string, bestRoute: BestRouteResponse, rangoClient: RangoClient, step: number) => {
    while (true) {
      let txStatus = await rangoClient.checkStatus({
        requestId: bestRoute.requestId,
        step: step + 1,
        txId: txHash,
      });
      txStatus = { ...txStatus, step };
      messageDetail.details[step].txStatus = txStatus;
      dispatch(multiChainSwap(JSON.parse(JSON.stringify(messageDetail))));

      if (!!txStatus.status && [TransactionStatus.FAILED, TransactionStatus.SUCCESS].includes(txStatus.status)) {
        return txStatus;
      }
      await sleep(3);
    }
  };

  useEffect(() => {
    DebugHelper.isActive("enable-debug");
    initialize().then();
  }, [metaData, address]);

  useEffect(() => {
    if (!fromNetwork || !toNetwork) {
      return;
    }
    fromNetworkDetails(fromNetwork).then();
    toNetworkDetails(toNetwork).then();
  }, [address]);

  useEffect(() => {
    if (!fromNetwork || !initialized) {
      return;
    }
    fromNetworkDetails(fromNetwork).then();
  }, [fromNetwork]);

  useEffect(() => {
    if (!toNetwork || !initialized) {
      return;
    }
    toNetworkDetails(toNetwork).then();
  }, [toNetwork]);

  useEffect(() => {
    if (!fromTokenAmount || fromTokenAmount === 0 || !fromToken || !toToken || !initialized) {
      setBestRoute(null);
      setToTokenAmount("");
      return;
    }
    getBestRoute().then();
  }, [fromToken, toToken, fromTokenAmountDebounce]);

  useEffect(() => {
    if (bonds && bonds44.length>0 && !bondInitialized) {
      setBond(bonds44[0]);
      setBondInitialized(true);
    }
  }, [bonds44]);

  return (
    <div id="swap-view">
      <NetworkModal type={ modalType.from } open={ fromNetworkModalOpen } onClose={ closeNetworkModal } />
      <NetworkModal type={ modalType.to } open={ toNetworkModalOpen } onClose={ closeNetworkModal } />
      <TokenModal type={ modalType.from } open={ fromTokenModalOpen } tokenCount={ fromTokenList.length }
                  tokenList={ fromSearchTokenList } searchList={ sliceList(fromTokenList, 20) }
                  onChange={ changeTokenModalList } onClose={ closeTokenModal } />
      <TokenModal type={ modalType.to } open={ toTokenModalOpen } tokenCount={ toTokenList.length }
                  tokenList={ toSearchTokenList } searchList={ sliceList(toTokenList, 20) }
                  onChange={ changeTokenModalList } onClose={ closeTokenModal } />
      <BondModal type={ modalType.bond } open={ bondModalOpen } bonds={ bonds44 }
                 onClose={ closeBondModal } />

      <Grid container spacing={ 1 }>
        <Grid item xs={ 12 } sm={ 12 } md={ 6 } key="multichain-swap" className="justify-box">
          <Zoom in={ true }>
            <Box className="multichain-swap-banner" borderRadius="10px" mb="10px" />
          </Zoom>
          <Zoom in={ true }>
            <Paper className="ohm-card w-full">
              {
                initialLoading ?
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <ReactLoading type="spinningBubbles" color="#fff" />
                  </Box> : (
                    <Box>
                      <div className="pair">
                        <FromTokenSection fromToken={ fromToken } fromTokenAmount={ fromTokenAmount }
                                          fromNetwork={ fromNetwork }
                                          setFromTokenAmount={ setFromTokenAmount }
                                          setMaxFromTokenAmount={ setMaxFromTokenAmount }
                                          fromUpdateTokenLoading={ fromUpdateTokenLoading }
                                          openTokenModal={ openTokenModal }
                                          opeNetworkModal={ opeNetworkModal } />
                        <ToTokenSection fromToken={ fromToken } fromTokenAmount={ fromTokenAmount } toToken={ toToken }
                                        toTokenAmount={ toTokenAmount } toNetwork={ toNetwork }
                                        openTokenModal={ openTokenModal } opeNetworkModal={ opeNetworkModal }
                                        toUpdateTokenLoading={ toUpdateTokenLoading } />
                      </div>

                      <Box my="20px" bgcolor="#3c434ecc" p="10px" borderRadius="5px">
                        <Typography variant="h6" className="font-weight-bolder">Swap consists of multiple transactions on
                          multiple chains. Please stay on screen and confirm all transactions.
                        </Typography>
                      </Box>
                      <BestRoute bestRoute={ bestRoute } routeLoading={ routeLoading } slippage={ slippage }
                                 setSlippage={ setSlippage } metaData={ metaData }
                                 fromTokenAmount={ fromTokenAmount } toTokenAmount={ toTokenAmount }
                                 fromToken={ fromToken }
                                 toToken={ toToken } requiredAssets={ requiredAssets } />
                      <Box mt="20px" display="flex" justifyContent="center">
                        {
                          !address && <Button
                            variant="contained"
                            color="primary"
                            onClick={ connect }
                          >
                            Connect Wallet
                          </Button>
                        }
                        {
                          address && !isPriceImpact() && <Button
                            variant="contained"
                            color="primary"
                            disabled={ !isSwappable() || swapLoading }
                            onClick={ () => swap() }
                          >
                            SWAP
                          </Button>
                        }
                        {
                          address && isPriceImpact() && <Box className="price-impact">
                            <Button
                              variant="contained"
                              className="price-impact"
                              disabled={ !isPriceImpact() || swapLoading }
                              onClick={ () => swap() }
                            >
                              <Box display="flex" alignItems="center">
                                Price impact is too high!
                                <Box ml="10px" display="flex" alignItems="center">
                                  <Tooltip
                                    arrow
                                    title={ `The estimated output is ${ getDownRate(fromToken, toToken, fromTokenAmount, toTokenAmount).toFixed(2) }% lower than input amount. Please be careful.` }
                                  >
                                    <HelpOutlineIcon viewBox="0 0 25 25" />
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Button>
                          </Box>
                        }
                      </Box>
                    </Box>
                  )
              }
            </Paper>
          </Zoom>
        </Grid>
        <Grid item xs={ 12 } sm={ 12 } md={ 6 } key="bond" className="justify-box">
          <Zoom in={ true }>
            <Box className="bonding-banner" borderRadius="10px" mb="10px" />
          </Zoom>
          <Zoom in={ true }>
            <Paper className="ohm-card w-full">
              { !address ? (
                <Box display="flex" justifyContent="center">
                  <Button variant="contained" color="primary" onClick={ connect }>
                    Connect Wallet
                  </Button>
                </Box>) : (chainId === NetworkIds.FantomOpera ? (
                  <BondSection bond={ bond } address={ address } openBondModal={ openBondModal }
                               forceBondLoading={ forceBondLoading }
                               opeNetworkModal={ opeNetworkModal } />
                ) : (<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <Typography variant="h5">Bonding is available on Fantom Network.</Typography>
                  <Box mt="20px">
                    <Button variant="contained" color="primary"
                            onClick={ () => { changeNetworks(NetworkIds.FantomOpera); /* FIXME this is workaround for sometimes not loaded values correctly */ window.location.reload(); } }>
                      Switch Network
                    </Button>
                  </Box>
                </Box>)
              ) }
            </Paper>
          </Zoom>
        </Grid>
      </Grid>
    </div>
  );
}

export default memo(Dex);