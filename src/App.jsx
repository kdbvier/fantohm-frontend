import { ThemeProvider } from "@material-ui/core/styles";
import { useEffect, useState, useCallback } from "react";
import { Route, Redirect, Switch, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import useBonds from "./hooks/Bonds";
import { useAddress, useWeb3Context } from "./hooks/web3Context";
import useSegmentAnalytics from "./hooks/useSegmentAnalytics";
import { getQueryParams } from "./helpers";

import { calcBondDetails } from "./slices/BondSlice";
import { calcGlobalBondDetails } from "./slices/GlobalBondSlice";
import { loadAppDetails } from "./slices/AppSlice";
import { loadAccountDetails, calculateUserBondDetails } from "./slices/AccountSlice";
import { loadSwapMetaData } from "./slices/SwapSlice";

import {
  Bridge,
  Stake,
  Wrap,
  CrystalBall,
  ChooseBond,
  Bond,
  TreasuryDashboard,
  PoolTogether,
  Dex,
} from "./views";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import TopBar from "./components/TopBar/TopBar.jsx";
import NavDrawer from "./components/Sidebar/NavDrawer.jsx";
import LoadingSplash from "./components/Loading/LoadingSplash";
import Messages from "./components/Messages/Messages";
import NotFound from "./views/404/NotFound";

import { v4 as uuidv4 } from "uuid";
import "./style.scss";
import {networks, NetworkIds, enabledNetworkIdsExceptDexOnly} from "./networks";
import VideoOverlay from "./components/VideoOverlay";
import useInvestments from "./hooks/Investments";
import { calcInvestmentDetails } from "./slices/InvestmentSlice";
import Investments from "./views/Investments/Investments";
import { BondType } from "src/lib/Bond";
import { fetchTokenPrice } from "./slices/TokenPriceSlice";
import { withLDProvider, useLDClient } from "launchdarkly-react-client-sdk";
import MintUSDB from "./views/MintUSDB/MintUSDB";
import { error, info } from "./slices/MessagesSlice";

// 😬 Sorry for all the console logging
const DEBUG = false;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// 🔭 block explorer URL
// const blockExplorer = targetNetwork.blockExplorer;

const drawerWidth = 280;
const transitionDuration = 969;

const useStyles = makeStyles(theme => ({
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(1),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: transitionDuration,
    }),
    height: "100%",
    overflow: "auto",
    marginLeft: drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: transitionDuration,
    }),
    marginLeft: 0,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
}));

function App() {
  useSegmentAnalytics();
  const dispatch = useDispatch();
  const location = useLocation();
  const currentPath = location.pathname + location.search + location.hash;
  const classes = useStyles();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSmallerScreen = useMediaQuery("(max-width: 980px)");
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const { connect, hasCachedProvider, chainId } = useWeb3Context();
  const [theme, setTheme] = useState(networks[chainId].theme);
  const address = useAddress();

  const [walletChecked, setWalletChecked] = useState(false);

  const isAppLoading = useSelector(state => state.app.loading);
  const isAppLoaded = useSelector(state => typeof state.app.marketPrice != "undefined"); // Hacky way of determining if we were able to load app Details.
  const { bonds, allBonds } = useBonds(chainId);
  const { investments } = useInvestments();
  const params = getQueryParams(window.location.search);

  console.log("bonds: ",bonds)
  // Load static app details
  useEffect(() => {
    dispatch(loadAppDetails({ networkId: chainId }));
    bonds.map(bond => {
      dispatch(calcBondDetails({ bond, value: null, networkId: chainId }));
    });
    dispatch(calcGlobalBondDetails({ allBonds }));
    investments.map(investment => {
      dispatch(calcInvestmentDetails({ investment }));
      dispatch(fetchTokenPrice({ investment }));
    });
  }, [chainId]);

  // Load account details
  useEffect(() => {
    if (address) {
      dispatch(loadAccountDetails({ networkId: chainId, address }));
      bonds.map(bond => {
        dispatch(calculateUserBondDetails({ address, bond, networkId: chainId }));
      });
    }
  }, [chainId, address]);

  // The next 3 useEffects handle initializing API Loads AFTER wallet is checked
  //
  // this useEffect checks Wallet Connection & then sets State for reload...
  // ... we don't try to fire Api Calls on initial load because web3Context is not set yet
  // ... if we don't wait we'll ALWAYS fire API calls via JsonRpc because provider has not
  // ... been reloaded within App.
  useEffect(() => {
    let isSubscribed = true;
    if (hasCachedProvider()) {
      // then user DOES have a wallet
      connect().then(() => {
        if (isSubscribed) {
          setWalletChecked(true);
        }
        // const providerURL = uri;
        // Note (appleseed): remove this before merge to develop
        // segmentUA({
        //   type: "connect",
        //   provider: provider,
        //   context: currentPath,
        // });
      });
    } else {
      // then user DOES NOT have a wallet
      setWalletChecked(true);
    }
    // We want to ensure that we are storing the UTM parameters for later, even if the user follows links
    // if (shouldTriggerSafetyCheck()) {
    //   dispatch(info("FTM network is experiencing some delays currently. Please refresh the page if you are having issues or page fails to load completely."));
    // }
    return () => {
      isSubscribed = false;
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarExpanded(false);
  };

  useEffect(() => {
    if (isSidebarExpanded) handleSidebarClose();
  }, [location]);

  useEffect(() => {
    setTheme(networks[chainId].theme);
  }, [chainId]);

  const bonds11 = bonds.filter(bond => bond.type === BondType.Bond_11);
  const bonds44 = bonds.filter(bond => bond.type === BondType.Bond_44);
  const bondsUsdb = bonds.filter(bond => bond.type === BondType.Bond_USDB);

  const client = useLDClient();
  useEffect(() => {
    dispatch(loadSwapMetaData());
    if (client) {
      const user = {
        key: "anonymous",
        anonymous: true,
        custom: params,
      };

      client.identify(user);
    }
  }, []);

  return (
    <ThemeProvider theme={ theme }>
      <CssBaseline />
      <VideoOverlay networkId={ chainId } />
      {/* {isAppLoading && <LoadingSplash />} */ }
      <div className={ `app ${ isSmallerScreen && "tablet" } ${ isSmallScreen && "mobile" }` }>
        <Messages />
        <TopBar networkId={ chainId } handleDrawerToggle={ handleDrawerToggle } />
        <nav className={ classes.drawer }>
          { isSmallerScreen ? (
            <NavDrawer mobileOpen={ mobileOpen } handleDrawerToggle={ handleDrawerToggle } />
          ) : (
            <Sidebar />
          ) }
        </nav>

        <div className={ `${ classes.content } ${ isSmallerScreen && classes.contentShift }` }>
          <Switch>
            <Route exact path="/dashboard">
              { (enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && <TreasuryDashboard />) || (
                  <Redirect to="/" />
              ) }
            </Route>

            <Route path="/dex">
              <Dex />
            </Route>

            <Route exact path="/">
              { (enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && <Redirect to="/stake" />) || (
                  <Redirect to="/dex" />
              ) }
            </Route>

            <Route path="/stake">
              { (enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && <Stake />) || (
                  <Redirect to="/dex" />
              ) }
            </Route>

            <Route path="/wrap">
              { (enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 &&  <Wrap />) || (
                  <Redirect to="/" />
              ) }
            </Route>

            <Route path="/bridge">
              { ((chainId === NetworkIds.Moonriver || chainId === NetworkIds.MoonbaseAlpha) && <Bridge />) || (
                <Redirect to="/" />
              ) }
            </Route>

            {/*<Route path="/33-together">*/}
            {/*  <PoolTogether />*/}
            {/*</Route>*/}

            <Route path="/investments">
              { (enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && <Investments />) || (
                  <Redirect to="/" />
              ) }
            </Route>

            <Route path="/bonds">
              { (enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && <Redirect to="/bonds-44" />) || (
                  <Redirect to="/" />
              ) }
            </Route>

            <Route path="/mint-usdb">
              {/* { (enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && <MintUSDB />) || ( */}
                  {/* // <Redirect to="/" /> */}
              {/* // ) } */}
              <MintUSDB />
            </Route>

            <Route path="/bonds-usdb">
              { bondsUsdb.map(bond => {
                return (
                  <Route exact key={ bond.name } path={ `/bonds-usdb/${ bond.name }` }>
                    <Bond bond={ bond } />
                  </Route>
                );
              }) }
              { bondsUsdb.length === 0 ? <Redirect to="/bonds-11" /> : <ChooseBond bondType={ BondType.Bond_USDB } /> }
            </Route>

            <Route path="/bonds-44">
              { bonds44.map(bond => {
                return (
                  <Route exact key={ bond.name } path={ `/bonds-44/${ bond.name }` }>
                    <Bond bond={ bond } />
                  </Route>
                );
              }) }
              { bonds44.length === 0 ? <Redirect to="/bonds-11" /> : <ChooseBond bondType={ BondType.Bond_44 } /> }
            </Route>

            <Route path="/bonds-11">
              { bonds11.map(bond => {
                return (
                  <Route exact key={ bond.name } path={ `/bonds-11/${ bond.name }` }>
                    <Bond bond={ bond } />
                  </Route>
                );
              }) }
              <ChooseBond bondType={ BondType.Bond_11 } />
            </Route>

            <Route path="/crystalball">
              <CrystalBall />
            </Route>

            <Route component={ NotFound } />
          </Switch>
        </div>
      </div>
    </ThemeProvider>
  );
}

// Update the export default to use your environment-specific client ID and a sample user:
export default withLDProvider({
  clientSideID: "6206da63bf32891414b7031f",
})(App);
