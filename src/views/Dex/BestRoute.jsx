import {
  Popper,
  Box,
  Typography,
  SvgIcon,
  Fade,
} from "@material-ui/core";
import { memo, useState } from "react";
import ReactLoading from "react-loading";

import { ReactComponent as SettingsIcon } from "../../assets/icons/settings.svg";
import { formatCurrency } from "../../helpers";
import { ReactComponent as ArrowRightIcon } from "../../assets/icons/arrow-right.svg";
import "./dex.scss";

import {
  expectSwapErrors,
  feeCalculator,
  formatSwapTime,
  getSwapPath,
  getTotalFee,
  getTotalSwapTime, requireAssetMessage,
} from "../../helpers/Dex";
import { slippageList } from "./data";
import "./dex.scss";

function BestRoute(props) {

  const [anchorEl, setAnchorEl] = useState(null);

  const settingPopperOpen = Boolean(anchorEl);

  const openSetting = (e) => {
    setAnchorEl(anchorEl ? null : e.currentTarget);
  }

  return (
    <Box position="relative" minHeight="330px" p="15px" display="flex" flexDirection="column" alignItems="center"
         justifyContent="center" className="dash-border">
      { props?.routeLoading ? <ReactLoading type="spinningBubbles" color="#fff" /> : (
        <>
          <Box position="absolute" top="10px" right="10px" onMouseEnter={e => openSetting(e)}
               onMouseLeave={e => openSetting(e)}>
            <SvgIcon color="primary" component={ SettingsIcon } />
            <Popper open={ settingPopperOpen } anchorEl={ anchorEl } placement="bottom-end" transition>
              { ({ TransitionProps }) => {
                return (
                  <Fade { ...TransitionProps } timeout={ 100 }>
                    <Box bgcolor="#3a3d52" borderRadius="5px" py="15px" px="20px" display="flex"
                         flexDirection={ {xs: "column", lg: "row" } } justifyContent="space-between">
                      <Box display="flex" flexDirection="column" mr="20px">
                        <Box mb={{xs: "10px", lg: 0}}>
                          <Typography style={ { fontSize: "18px" } } className="font-weight-bolder">Swap
                            Settings</Typography>
                          <Typography style={ { fontSize: "10px" } }>Slippage tolerance per Swap</Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center">
                        {
                          slippageList.map((item, index) => {
                            return (
                              <Box className="cursor-pointer font-weight-bolder" key={ `swap_${ index }` }
                                   color={ item === props?.slippage ? "#000" : "#FCFCFC" }
                                   bgcolor={ item === props?.slippage ? "#f6c777" : "#2b2d3e" } borderRadius="3px" p="10px"
                                   mr={ index<slippageList.length - 1 ? "5px" : "" }
                                   onClick={ () => props?.setSlippage(item) }>
                                { item }%
                              </Box>
                            );
                          })
                        }
                      </Box>
                    </Box>
                  </Fade>
                );
              } }
            </Popper>
          </Box>
          { !props?.bestRoute?.result ? (<Typography
            variant="h6">{ (!props?.fromTokenAmount || props?.fromTokenAmount === 0) ? "Enter amount to find routes" : "No routes found" }</Typography>) : (<>
            <Box display="flex" justifyContent="center">
              {
                props?.bestRoute?.result?.swaps?.length>0 && props?.bestRoute?.result?.swaps?.map((swap, index) => {
                  return (
                    <Box width="80px" borderRadius="5px" bgcolor="#46485f" key={ `route_${ index }` }
                         mr={ index<props?.bestRoute?.result?.swaps?.length - 1 ? "10px" : "0" } p="5px">
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <img style={ { width: "25px" } } src={ swap?.logo } alt={ swap?.swapperId } />
                        <Typography noWrap style={ { fontSize: "10px" } } align="center"
                                    className="w-full">{ swap.swapperId }</Typography>
                      </Box>
                      <Box mt="10px" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                        <Typography noWrap style={ { fontSize: "10px" } } className="w-full">Fee
                          ≈ { formatCurrency(feeCalculator(swap.fee, props?.metaData), 3) }$</Typography>
                        <Typography noWrap style={ { fontSize: "10px" } } className="w-full">Time
                          ≈ { formatSwapTime(swap.timeStat.avg) }</Typography>
                      </Box>
                    </Box>
                  );
                })
              }
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              {
                getSwapPath(props?.bestRoute?.result?.swaps).map((item, index) => {
                  return (
                    <Box display="flex" alignItems="center" key={ `token_${ index }` }>
                      <Box width="60px" display="flex" flexDirection="column" alignItems="center"
                           justifyContent="center">
                        <img style={ { width: "35px", height: "35px" } } src={ item?.logo } alt={ item?.symbol } />
                        <Typography variant="h6">{ item?.symbol?.toUpperCase() }</Typography>
                        <Typography style={ { fontSize: "10px" } }>{ item?.blockchain }</Typography>
                      </Box>
                      { index<getSwapPath(props?.bestRoute?.result?.swaps).length - 1 && (
                        <SvgIcon component={ ArrowRightIcon } fontSize="large" color="primary" />
                      )
                      }
                    </Box>
                  );
                })
              }
            </Box>
            {
              expectSwapErrors(props?.bestRoute?.result?.swaps)?.length>0 && (
                <Box display="flex" justifyContent="center" mt="10px">
                  <Box bgcolor="#3c434ecc" maxWidth="180px" borderRadius="5px" px="5px" py="3px" display="flex"
                       flexDirection="column" justifyContent="center">
                    {
                      expectSwapErrors(props?.bestRoute?.result?.swaps)?.map((item, index) => {
                        return (
                          <Box display="flex" flexDirection="column" key={ `error_${ index }` } alignItems="center"
                               mb="10px">
                            <Typography noWrap variant="h6" className="w-full">{ item?.title }</Typography>
                            <Typography noWrap style={ { fontSize: "10px" } }
                                        className="w-full">{ item?.required }</Typography>
                            <Typography noWrap style={ { fontSize: "10px" } }
                                        className="w-full">{ item?.yours }</Typography>
                          </Box>
                        );
                      })
                    }
                  </Box>
                </Box>
              )
            }
            {
              props?.bestRoute?.result && (
                <Box mt="10px" className="w-full" display="flex" flexDirection="column">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="h6">1 { props?.fromToken?.symbol } = { (props?.toTokenAmount / props?.fromTokenAmount).toFixed(4) } { props?.toToken?.symbol }</Typography>
                    <Typography variant="h6">Total Fee:
                      ≈ { formatCurrency(getTotalFee(props?.bestRoute?.result?.swaps, props?.metaData), 4) }</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="h6">1 { props?.toToken?.symbol } = { (props?.fromTokenAmount / props?.toTokenAmount).toFixed(4) } { props?.fromToken?.symbol }</Typography>
                    <Typography variant="h6">Estimated Arrival Time:
                      ≈ { formatSwapTime(getTotalSwapTime(props?.bestRoute?.result?.swaps)) }</Typography>
                  </Box>
                </Box>
              )
            }
            {
              requireAssetMessage(props?.requiredAssets).length>0 && (
                <Box mt="20px" display="flex" flexDirection="column" bgcolor="#3c434ecc" p="10px" borderRadius="5px">
                  {
                    requireAssetMessage(props?.requiredAssets).map((item, index) => {
                      return (
                        <Typography variant="h6" className="font-weight-bolder" key={`requiredAssets_${index}`}>{ item }</Typography>
                      );
                    })
                  }
                </Box>
              )
            }
          </>) }
        </>
      ) }
    </Box>
  );
}

export default memo(BestRoute);