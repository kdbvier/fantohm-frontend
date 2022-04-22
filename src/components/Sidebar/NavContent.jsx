import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Social from "./Social";
import externalUrls from "./externalUrls";
import { ReactComponent as StakeIcon } from "../../assets/icons/stake.svg";
import { ReactComponent as InvestmentsIcon } from "../../assets/icons/investments.svg";
import { ReactComponent as Bond11Icon } from "../../assets/icons/bond11.svg";
import { ReactComponent as Bond44Icon } from "../../assets/icons/bond44.svg";
import { ReactComponent as BondUsdbIcon } from "../../assets/icons/bondIso.svg";
import { ReactComponent as WrapIcon } from "../../assets/icons/wrap.svg";
import { ReactComponent as BridgeIcon } from "../../assets/icons/bridge.svg";
import { ReactComponent as DexIcon } from "../../assets/icons/dex.svg";
import { ReactComponent as CrystalBallIcon } from "../../assets/icons/crystalball.svg";
import { ReactComponent as DashboardIcon } from "../../assets/icons/dashboard.svg";
import { ReactComponent as OlympusIcon } from "../../assets/icons/fhm-header-logo.svg";
import { ReactComponent as ArrowUpIcon } from "../../assets/icons/arrow-up.svg";
import { ReactComponent as HuckleberryIcon } from "../../assets/icons/huckleberry.svg";
import { trim, shorten } from "../../helpers";
import { useAddress, useWeb3Context } from "src/hooks/web3Context";
import useBonds from "../../hooks/Bonds";
import { Paper, Link, Box, Typography, SvgIcon } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import "./sidebar.scss";
import { addresses } from "src/constants";
import { dai44, dai_v2, usdcm, usdcm_44, usdtm, usdtm_44 } from "src/helpers/AllBonds";
import {enabledNetworkIdsExceptDexOnly, NetworkIds} from "src/networks";
import { BondType } from "src/lib/Bond";
import { useFlags } from "launchdarkly-react-client-sdk";
import {DebugHelper} from "../../helpers/DebugHelper";

function NavContent() {
  const [isActive] = useState();
  const address = useAddress();
  const { chainId } = useWeb3Context();
  const { bonds } = useBonds(chainId);
  const { crystalBall, swap, fhudToUsdb } = useFlags();

  const ftmFhmAddress = addresses[NetworkIds.FantomOpera].OHM_ADDRESS;
  const ftmDaiAddress = dai44.getAddressForReserve(NetworkIds.FantomOpera);

  const movrFhmAddress = addresses[NetworkIds.Moonriver].OHM_ADDRESS;
  const movrUsdcmAddress = usdcm_44.getAddressForReserve(NetworkIds.Moonriver);
  const movrUsdtmAddress = usdtm_44.getAddressForReserve(NetworkIds.Moonriver);

  const checkPage = useCallback((match, location, page) => {
    const currentPath = location.pathname.replace("/", "");
    if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
      return true;
    }
    if (currentPath.indexOf("stake") >= 0 && page === "stake") {
      return true;
    }
    if (currentPath.indexOf("wrap") >= 0 && page === "wrap") {
      return true;
    }
    if (currentPath.indexOf("dex") >= 0 && page === "dex") {
      return true;
    }
    if (currentPath.indexOf("crystalball") >= 0 && page === "crystalball") {
      return true;
    }
    if (currentPath.indexOf("investments") >= 0 && page === "investments") {
      return true;
    }
    if (currentPath.indexOf("bonds-usdb") >= 0 && page === "bonds-usdb") {
      return true;
    }
    if (currentPath.indexOf("mint-usdb") >= 0 && page === "mint-usdb") {
      return true;
    }
    if (currentPath.indexOf("bonds-44") >= 0 && page === "bonds-44") {
      return true;
    }
    return currentPath.indexOf("bonds-11")>=0 && page === "bonds-11";

  }, []);

  const bonds44 = bonds.filter(bond => bond.type === BondType.Bond_44);
  const bonds11 = bonds.filter(bond => bond.type === BondType.Bond_11);
  const bondsUsdb = bonds.filter(bond => bond.type === BondType.Bond_USDB);

  return (
    <Paper className="dapp-sidebar">
      <Box className="dapp-sidebar-inner" display="flex" justifyContent="space-between" flexDirection="column">
        <div className="dapp-menu-top">
          <Box className="branding-header">
            <Link key="app-link" href="https://www.fantohm.com" target="_blank">
              <SvgIcon
                color="primary"
                component={OlympusIcon}
                viewBox="0 0 151 100"
                style={{ minWdth: "151px", minHeight: "98px", width: "151px" }}
              />
            </Link>

            {address && (
              <div className="wallet-link">
                <Link key="fhm-address" href={`https://ftmscan.com/address/${address}`} target="_blank">
                  {shorten(address)}
                </Link>
              </div>
            )}
          </Box>

          <div className="dapp-menu-links">
            <div className="dapp-nav" id="navbarNav" key="navbarNav">
              {enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && (
              <Link
                component={NavLink}
                id="dash-nav"
                key="dash-nav"
                to="/dashboard"
                isActive={(match, location) => {
                  return checkPage(match, location, "dashboard");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={DashboardIcon} />
                  Dashboard
                </Typography>
              </Link>
              )}

              <Link
                component={ NavLink }
                id="dex"
                key="dex"
                to="/dex"
                isActive={ (match, location) => {
                  return checkPage(match, location, 'dex');
                } }
                className={ `button-dapp-menu ${ isActive ? 'active' : '' }` }
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={ DexIcon } />
                  DEX
                </Typography>
              </Link>

              {crystalBall && (
                <Link
                  component={NavLink}
                  id="crystalball-nav"
                  key="crystalball-nav"
                  to="/crystalball"
                  isActive={(match, location) => {
                    return checkPage(match, location, "crystalball");
                  }}
                  className={`button-dapp-menu ${isActive ? "active" : ""}`}
                >
                  <Typography variant="h6">
                    <SvgIcon color="primary" component={CrystalBallIcon} />
                    Crystal Ball
                  </Typography>
                </Link>
              )}

              {enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && (
                <Link
                  component={NavLink}
                  id="stake-nav"
                  key="stake-nav"
                  to="/"
                  isActive={(match, location) => {
                    return checkPage(match, location, "stake");
                  }}
                  className={`button-dapp-menu ${isActive ? "active" : ""}`}
                >
                  <Typography variant="h6">
                    <SvgIcon color="primary" component={StakeIcon} />
                    Stake
                  </Typography>
                </Link>
              )}

              {enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && (
                <Link
                  component={NavLink}
                  id="wrap-nav"
                  key="wrap-nav"
                  to="/wrap"
                  isActive={(match, location) => {
                    return checkPage(match, location, "wrap");
                  }}
                  className={`button-dapp-menu ${isActive ? "active" : ""}`}
                >
                  <Typography variant="h6">
                    <SvgIcon color="primary" component={WrapIcon} />
                    Wrap
                  </Typography>
                </Link>
              )}

              {enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && (
                <Link
                  component={NavLink}
                  id="investments-nav"
                  key="investments-nav"
                  to="/investments"
                  isActive={(match, location) => {
                    return checkPage(match, location, "investments");
                  }}
                  className={`button-dapp-menu ${isActive ? "active" : ""}`}
                >
                  <Typography variant="h6">
                    <SvgIcon color="primary" component={InvestmentsIcon} />
                    Investments
                  </Typography>
                </Link>
              )}

              {/*<Link*/}
              {/*  component={NavLink}*/}
              {/*  id="33-together-nav"*/}
              {/*  to="/33-together"*/}
              {/*  isActive={(match, location) => {*/}
              {/*    return checkPage(match, location, "33-together");*/}
              {/*  }}*/}
              {/*  className={`button-dapp-menu ${isActive ? "active" : ""}`}*/}
              {/*>*/}
              {/*  <Typography variant="h6">*/}
              {/*    <SvgIcon color="primary" component={PoolTogetherIcon} />*/}
              {/*    3,3 Together*/}
              {/*  </Typography>*/}
              {/*</Link>*/}

              {enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && bondsUsdb.length > 0 && [
                <Link
                  component={NavLink}
                  id="bonds-usdb-nav"
                  key="bonds-usdb-nav"
                  to="/bonds-usdb"
                  isActive={(match, location) => {
                    return checkPage(match, location, "bonds-usdb");
                  }}
                  className={`button-dapp-menu ${isActive ? "active" : ""}`}
                >
                  <Typography variant="h6">
                    <SvgIcon color="primary" component={BondUsdbIcon} />
                    USDB Bond
                  </Typography>
                </Link>
              ]}

              {fhudToUsdb && (chainId === NetworkIds.FantomOpera) ?
                <Link
                  component={NavLink}
                  id="mint-usdb-nav"
                  to="/mint-usdb"
                  isActive={(match, location) => {
                    return checkPage(match, location, "mint-usdb");
                  }}
                  className={`button-dapp-menu ${isActive ? "active" : ""}`}
                >
                  <Typography variant="h6">
                    <SvgIcon color="primary" component={BondUsdbIcon}/>
                    FHUD ➜ USDB
                  </Typography>
                </Link> : <></>
              }

              {enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && bonds44.length > 0 && [
                <Link
                  component={NavLink}
                  id="bond-44-nav"
                  key="bond-44-nav"
                  to="/bonds-44"
                  isActive={(match, location) => {
                    return checkPage(match, location, "bonds-44");
                  }}
                  className={`button-dapp-menu ${isActive ? "active" : ""}`}
                >
                  <Typography variant="h6">
                    <SvgIcon color="primary" component={Bond44Icon} />
                    Bond (4,4)
                  </Typography>
                </Link>,

                <div className="dapp-menu-data discounts" key="dapp-menu-data-1">
                  <div className="bond-discounts">
                    {bonds44.filter(bond => bond.isPurchasable).length > 0 && <Typography variant="body2">Bond ROIs</Typography>}
                    {bonds44.filter(bond => bond.isPurchasable).map((bond, i) => (
                      <Link component={NavLink} to={`/bonds-44/${bond.name}`} key={`${bond.displayName}${i}`} className={"bond"}>
                        {!bond.bondDiscount == null ? (
                          <Skeleton variant="text" width={"150px"} />
                        ) : (
                          <Typography variant="body2">
                            {bond.displayName}
                            <span className="bond-pair-roi">
                            {bond.bondDiscount != null && trim(bond.bondDiscount * 100, 2) + '%'}
                          </span>
                          </Typography>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>]}

              {enabledNetworkIdsExceptDexOnly.indexOf(chainId) >= 0 && bonds11.length > 0 && [
                <Link
                  component={NavLink}
                  id="bond-11-nav"
                  key="bond-11-nav"
                  to="/bonds-11"
                  isActive={(match, location) => {
                    return checkPage(match, location, "bonds-11");
                  }}
                  className={`button-dapp-menu ${isActive ? "active" : ""}`}
                >
                  <Typography variant="h6">
                    <SvgIcon color="primary" component={Bond11Icon} />
                    Bond (1,1)
                  </Typography>
                </Link>,

                <div className="dapp-menu-data discounts" key="dapp-menu-data-2">
                  <div className="bond-discounts">
                    {bonds11.filter(bond => bond.isPurchasable).length > 0 && <Typography variant="body2">Bond discounts</Typography>}
                    {bonds11.filter(bond => bond.isPurchasable).map((bond, i) => (
                      <Link component={NavLink} to={`/bonds-11/${bond.name}`} key={`${bond.name}${i}`} className={"bond"}>
                        {!bond.bondDiscount == null ? (
                          <Skeleton variant="text" width={"150px"} />
                        ) : (
                          <Typography variant="body2">
                            {bond.displayName}
                            <span className="bond-pair-roi">
                            {bond.bondDiscount != null && trim(bond.bondDiscount * 100, 2) + '%'}
                          </span>
                          </Typography>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>]}

              <Link
                href="https://bridge.wanchain.org"
                key="wanchain-bridge"
                target="_blank"
                rel="noreferrer">
                <Typography variant="h6">
                  <SvgIcon color="primary" component={BridgeIcon} />
                  Bridge
                </Typography>
              </Link>

              <div className="dapp-menu-data bridge" key="dapp-menu-data-3">
                <div className="bridge-links">
                  {/* <Link
                    href="https://bridge.wanchain.org"
                    target="_blank"
                    rel="noreferrer"
                    className="bridge-link">
                      <Typography variant="body2">
                        <SvgIcon color="primary" component={ArrowUpIcon} />
                        WanBridge
                      </Typography>
                  </Link> */}
                  {(chainId === NetworkIds.Moonriver || chainId === NetworkIds.MoonbaseAlpha) && <Link
                    component={NavLink}
                    id="bridge-nav"
                    key="bridge-nav"
                    to={`/bridge`}
                    isActive={(match, location) => checkPage(match, location, "bridge")}
                    className="bridge-link"
                  >
                    <Typography variant="body2">
                      Bridge via FHM.m
                    </Typography>
                  </Link>}
                </div>
              </div>

              {(chainId === NetworkIds.Moonriver || chainId === NetworkIds.MoonbaseAlpha) && [
                <Link
                  key="huckleberry-1"
                  href={`https://www.huckleberry.finance/#/swap?inputCurrency=${movrUsdcmAddress}&outputCurrency=${movrFhmAddress}`}
                  target="_blank"
                  rel="noreferrer">
                  <Typography variant="h6">
                    <SvgIcon color="primary" component={HuckleberryIcon} />
                    Buy on Huckleberry
                  </Typography>
                </Link>,

                <div className="dapp-menu-data swaps" key="dapp-menu-data-4">
                  <div className="swap-links">
                    <Link
                      key="huckleberry-2"
                      href={`https://www.huckleberry.finance/#/swap?inputCurrency=${movrUsdcmAddress}&outputCurrency=${movrFhmAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="swap-link"
                    >
                      <Typography variant="body2">
                        <SvgIcon color="primary" component={ArrowUpIcon} />
                        Buy with USDC.m
                      </Typography>
                    </Link>
                    <Link
                      key="huckleberry-3"
                      href={`https://www.huckleberry.finance/#/swap?inputCurrency=${movrUsdtmAddress}&outputCurrency=${movrFhmAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="swap-link">
                      <Typography variant="body2">
                        <SvgIcon color="primary" component={ArrowUpIcon} />
                        Buy with USDT.m
                      </Typography>
                    </Link>
                  </div>
                </div>
              ]}

              {chainId === NetworkIds.Rinkeby && [
                <Link
                  key="uniswap"
                  href={`https://app.uniswap.org/#/swap?chain=rinkeby&inputCurrency=${dai_v2.getAddressForReserve(NetworkIds.Rinkeby)}&outputCurrency=${addresses[NetworkIds.Rinkeby].OHM_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer">
                  <Typography variant="h6">
                    Buy on Uniswap v2
                  </Typography>
                </Link>]}

            </div>
          </div>
        </div>
        <Box className="dapp-menu-bottom" display="flex" justifyContent="space-between" flexDirection="column">
          <div className="dapp-menu-external-links">
            {Object.keys(externalUrls).map((link, i) => {
              return (
                <Link key={`${externalUrls[link].url}${i}`} href={`${externalUrls[link].url}`} target="_blank">
                  <Typography variant="h6">{externalUrls[link].icon}</Typography>
                  <Typography variant="h6">{externalUrls[link].title}</Typography>
                </Link>
              );
            })}
          </div>
          <div>

          </div>
          <div className="dapp-menu-social" key="dapp-menu-social">
            <Social />
          </div>
        </Box>
      </Box>
    </Paper>
  );
}

export default NavContent;
