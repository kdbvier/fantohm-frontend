import { useState, useEffect } from "react";
import { addresses, TOKEN_DECIMALS } from "../../constants";
import { NetworkIds } from "../../networks";
import { getTokenImage } from "../../helpers";
import { useSelector } from "react-redux";
import {
  Link,
  SvgIcon,
  Popper,
  Button,
  Paper,
  Typography,
  Divider,
  Box,
  Fade,
  Slide,
  useMediaQuery
} from "@material-ui/core";
import { ReactComponent as InfoIcon } from "../../assets/icons/info-fill.svg";
import { ReactComponent as ArrowUpIcon } from "../../assets/icons/arrow-up.svg";
import { ReactComponent as sOhmTokenImg } from "../../assets/tokens/token_sOHM.svg";
import { ReactComponent as ohmTokenImg } from "../../assets/tokens/token_OHM.svg";
import { ReactComponent as mwsfhmTokenImg } from "../../assets/tokens/mwsfhm.svg";
import { ReactComponent as fwsfhmTokenImg } from "../../assets/tokens/fwsfhm.svg";
import { ReactComponent as usdbTokenImg } from "../../assets/tokens/USDB.svg";

import "./ohmmenu.scss";
import {dai44, usdcm_44, usdtm_44} from "src/helpers/AllBonds";
import { useWeb3Context } from "../../hooks/web3Context";

import OhmImg from "src/assets/tokens/token_OHM.svg";
import SOhmImg from "src/assets/tokens/token_sOHM.svg";
import mwsfhmImg from "src/assets/tokens/mwsfhm.svg";
import fwsfhmImg from "src/assets/tokens/fwsfhm.svg";
import usdbImg from "src/assets/tokens/USDB.svg";
import {useTheme} from "@material-ui/core/styles";

const addTokenToWallet = (tokenSymbol, tokenAddress) => async () => {
  if (window.ethereum) {
    const host = window.location.origin;
    // NOTE (appleseed): 33T token defaults to sOHM logo since we don't have a 33T logo yet
    let tokenPath;
    // if (tokenSymbol === "OHM") {

    let tokenDecimals = TOKEN_DECIMALS;

    // } ? OhmImg : SOhmImg;
    switch (tokenSymbol) {
      case "FHM":
        tokenPath = OhmImg;
        break;
      case "mwsFHM":
        tokenPath = mwsfhmImg;
        tokenDecimals = 18;
        break;
      case "fwsFHM":
        tokenPath = fwsfhmImg;
        tokenDecimals = 18;
        break;
      case "USDB":
        tokenPath = usdbImg;
        tokenDecimals = 18;
        break;
      default:
        tokenPath = SOhmImg;
    }
    const imageURL = `${host}/${tokenPath}`;

    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: imageURL,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
};

function OhmMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const isEthereumAPIAvailable = window.ethereum;
  const { chainId } = useWeb3Context();

  const networkId = chainId;

  const SOHM_ADDRESS = addresses[networkId].SOHM_ADDRESS;
  const OHM_ADDRESS = addresses[networkId].OHM_ADDRESS;
  const WSOHM_ADDRESS = addresses[networkId].WSOHM_ADDRESS;
  const USDB_ADDRESS = addresses[networkId].USDB_ADDRESS;

  const wsFhmName = (chainId === NetworkIds.Moonriver) ? "mwsFHM" : "fwsFHM";
  const wsFhmImg = (chainId === NetworkIds.Moonriver) ? mwsfhmTokenImg : fwsfhmTokenImg;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleHover = event => {
    if(!isSmallScreen) {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    }
  };

  const open = Boolean(anchorEl);
  const id = "ohm-popper";

  const ftmFhmAddress = addresses[NetworkIds.FantomOpera].OHM_ADDRESS;
  const ftmDaiAddress = dai44.getAddressForReserve(NetworkIds.FantomOpera);

  const movrFhmAddress = addresses[NetworkIds.Moonriver].OHM_ADDRESS;
  const movrUsdcmAddress = usdcm_44.getAddressForReserve(NetworkIds.Moonriver);
  const movrUsdtmAddress = usdtm_44.getAddressForReserve(NetworkIds.Moonriver);
  return (
    <Box
      component="div"
      onMouseEnter={e => handleHover(e)}
      onMouseLeave={e => handleClick(e)}
      onClick={e => handleClick(e)}
      id="ohm-menu-button-hover"
    >
      <Button id="ohm-menu-button" size="large" variant="contained" color="secondary" title="FHM" aria-describedby={id} disableElevation={false}>
        <SvgIcon component={InfoIcon} color="primary" />
        <Typography>FHM</Typography>
      </Button>

      <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom-start" transition>
        {({ TransitionProps }) => {
          return (
            <Fade {...TransitionProps} timeout={100}>
              <Paper className="ohm-menu" elevation={1}>
                {(chainId == NetworkIds.Moonriver || chainId == NetworkIds.MoonbaseAlpha) && [
                <Box component="div" className="buy-tokens">
                  <Link
                    href={`https://www.huckleberry.finance/#/swap?inputCurrency=${movrUsdcmAddress}&outputCurrency=${movrFhmAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    key="huckle-berry-usdc"
                  >
                    <Button size="large" variant="contained" color="secondary" fullWidth>
                      <Typography align="left">
                        Buy with USDC.m on Huckleberry <SvgIcon component={ArrowUpIcon} htmlColor="#A3A3A3" />
                      </Typography>
                    </Button>
                  </Link>,

                  <Link
                    href={`https://www.huckleberry.finance/#/swap?inputCurrency=${movrUsdtmAddress}&outputCurrency=${movrFhmAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    key="huckle-berry-usdt"
                  >
                    <Button size="large" variant="contained" color="secondary" fullWidth>
                      <Typography align="left">
                        Buy with USDT.m on Huckleberry <SvgIcon component={ArrowUpIcon} htmlColor="#A3A3A3" />
                      </Typography>
                    </Button>
                  </Link>

                  {/*<Link href={`https://abracadabra.money/pool/10`} target="_blank" rel="noreferrer">*/}
                  {/*  <Button size="large" variant="contained" color="secondary" fullWidth>*/}
                  {/*    <Typography align="left">*/}
                  {/*      Wrap sFHM on Abracadabra <SvgIcon component={ArrowUpIcon} htmlColor="#A3A3A3" />*/}
                  {/*    </Typography>*/}
                  {/*  </Button>*/}
                  {/*</Link>*/}
                </Box>
                ]}

                {/*<Box component="div" className="data-links">*/}
                {/*  <Divider color="secondary" className="less-margin" />*/}
                {/*  <Link href={`https://dune.xyz/shadow/Olympus-(OHM)`} target="_blank" rel="noreferrer">*/}
                {/*    <Button size="large" variant="contained" color="secondary" fullWidth>*/}
                {/*      <Typography align="left">*/}
                {/*        Shadow's Dune Dashboard <SvgIcon component={ArrowUpIcon} htmlColor="#A3A3A3" />*/}
                {/*      </Typography>*/}
                {/*    </Button>*/}
                {/*  </Link>*/}
                {/*</Box>*/}

                {isEthereumAPIAvailable ? (
                  <Box className="add-tokens">
                    <Divider color="secondary" />
                    <p>ADD TOKEN TO WALLET</p>
                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                      <Button variant="contained" color="secondary" key="USDB" onClick={addTokenToWallet("USDB", USDB_ADDRESS)}>
                        <SvgIcon
                                component={usdbTokenImg}
                                viewBox="0 0 32 32"
                                style={{ height: "25px", width: "25px" }}
                        />
                        <Typography variant="body1">USDB</Typography>
                      </Button>
                      <Button variant="contained" color="secondary" key="FHM" onClick={addTokenToWallet("FHM", OHM_ADDRESS)}>
                        <SvgIcon
                          component={ohmTokenImg}
                          viewBox="0 0 32 32"
                          style={{ height: "25px", width: "25px" }}
                        />
                        <Typography variant="body1">FHM</Typography>
                      </Button>
                      <Button variant="contained" color="secondary" key="sFHM" onClick={addTokenToWallet("sFHM", SOHM_ADDRESS)}>
                        <SvgIcon
                          component={sOhmTokenImg}
                          viewBox="0 0 32 32"
                          style={{ height: "25px", width: "25px" }}
                        />
                        <Typography variant="body1">sFHM</Typography>
                      </Button>
                      <Button variant="contained" color="secondary" key={wsFhmName} onClick={addTokenToWallet(wsFhmName, WSOHM_ADDRESS)}>
                        <SvgIcon
                                component={wsFhmImg}
                                viewBox="0 0 32 32"
                                style={{ height: "25px", width: "25px" }}
                        />
                        <Typography variant="body1">{wsFhmName}</Typography>
                      </Button>
                    </Box>
                  </Box>
                ) : null}

                {/*<Divider color="secondary" />*/}
                {/*<Link*/}
                {/*  href="https://docs.olympusdao.finance/using-the-website/unstaking_lp"*/}
                {/*  target="_blank"*/}
                {/*  rel="noreferrer"*/}
                {/*>*/}
                {/*  <Button size="large" variant="contained" color="secondary" fullWidth>*/}
                {/*    <Typography align="left">Unstake Legacy LP Token</Typography>*/}
                {/*  </Button>*/}
                {/*</Link>*/}
              </Paper>
            </Fade>
          );
        }}
      </Popper>
    </Box>
  );
}

export default OhmMenu;
