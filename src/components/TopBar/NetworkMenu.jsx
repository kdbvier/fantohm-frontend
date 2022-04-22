import { useEffect, useState } from "react";
import { Popper, Button, Paper, Typography, Box, Fade, SvgIcon } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";

import "./networkmenu.scss";
import { useWeb3Context } from "../../hooks";
import { networks, enabledNetworkIds, NetworkIds } from "../../networks";
import store from "../../store";
import { error } from "../../slices/MessagesSlice";
import { isDexPage } from "../../helpers/Dex";

function NetworkMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { chainId, switchEthereumChain } = useWeb3Context();
  const [currentNetwork, setCurrentNetwork] = useState({
    id: chainId,
    name: networks[chainId].name,
    icon: networks[chainId].logo,
  });

  const changeNetworks = async (chainId) => {
    const result = await switchEthereumChain(chainId);
    if (!result) {
      const errorMessage = 'Unable to switch networks. Please change network using provider.';
      console.error(errorMessage);
      store.dispatch(error(errorMessage));
    }
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const standardNetworkIds = [250, 4002, 1285, 1287, 4]; //fantom, moonriver

  let availableNetworks = enabledNetworkIds.filter(networkId => networkId !== chainId && standardNetworkIds.indexOf(networkId) >= 0).map(networkId => ({
    id: networkId,
    name: networks[networkId].name,
    icon: networks[networkId].logo,
  }));
  if (isDexPage()) {
    availableNetworks = availableNetworks.filter(network => network.id !== NetworkIds.Moonriver);
  }

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleHover = event => {
    if(!isSmallScreen) {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    }
  };

  const open = Boolean(anchorEl);
  const id = "network-popper";

  useEffect(() => {
    if (!chainId) {
      return;
    }
    setCurrentNetwork({
      id: chainId,
      name: networks[chainId].name,
      icon: networks[chainId].logo,
    });
    availableNetworks = enabledNetworkIds.filter(networkId => networkId !== chainId && standardNetworkIds.indexOf(networkId) >= 0).map(networkId => ({
      id: networkId,
      name: networks[networkId].name,
      icon: networks[networkId].logo,
    }));
    if (isDexPage()) {
      availableNetworks = availableNetworks.filter(network => network.id !== NetworkIds.Moonriver);
    }
  }, [chainId])

  return (
    <Box
      component="div"
      onMouseEnter={e => handleHover(e)}
      onMouseLeave={e => handleClick(e)}
      onClick={e => handleClick(e)}
      id="network-menu-button-hover"
    >
      <Button id="network-menu-button" size="large" variant="contained" color="secondary" title="Network" aria-describedby={id} disableElevation={false}>
        <SvgIcon component={currentNetwork.icon} color="primary" viewBox="0 0 32 32" />
        <Typography hidden={isSmallScreen} style={{ paddingLeft: "8px" }}>{currentNetwork.name}</Typography>
      </Button>

      <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom-start" transition hidden={availableNetworks?.length === 0}>
        {({ TransitionProps }) => {
          return (
            <Fade {...TransitionProps} timeout={100}>
              <Paper className="network-menu" elevation={1}>
                <Box component="div" className="select-network">
                  {availableNetworks?.map(network => {
                    return (
                      <Button className="network-button" startIcon={<SvgIcon component={network.icon} color="primary" viewBox="0 0 32 32" />} key={`${network.name}-btn`} size="large" variant="contained" color="secondary" fullWidth onClick={() => changeNetworks(network.id)} disableElevation={true}>
                        <Typography>{network.name}</Typography>
                      </Button>
                    )
                  })}
                </Box>
              </Paper>
            </Fade>
          );
        }}
      </Popper>
    </Box>
  );
}

export default NetworkMenu;
