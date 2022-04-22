import {ReactComponent as FantomIcon} from "src/assets/networks/fantom_icon.svg";
import {ReactComponent as EthereumIcon} from "src/assets/networks/ethereum_icon.svg";
import {ReactComponent as BscIcon} from "src/assets/networks/bsc_icon.svg";
import {ReactComponent as AvalancheIcon} from "src/assets/networks/avalanche_icon.svg";
import {ReactComponent as PolygonIcon} from "src/assets/networks/polygon_icon.svg";
import {ReactComponent as HarmonyIcon} from "src/assets/networks/harmony_icon.svg";
import {ReactComponent as ArbitrumIcon} from "src/assets/networks/arbitrum_icon.svg";

export const modalType = {
  from: "from",
  to: "to",
  bond: "bond"
};

export const bondActionType = {
  deposit: "deposit",
  approve: "approve",
};

export const swapNetworks = [
  {
    blockchain: 'ETH',
    name: 'ETH',
    chainId: 1,
    id: 'ethereum',
    logo: <EthereumIcon />,
  },
  {
    blockchain: 'BSC',
    name: 'BSC',
    chainId: 56,
    id: 'binance-smart-chain',
    logo: <BscIcon />
  },
  {
    blockchain: 'FANTOM',
    name: 'FANTOM',
    chainId: 250,
    id: 'fantom',
    logo: <FantomIcon />
  },
  {
    blockchain: 'ARBITRUM',
    name: 'ARBITRUM',
    chainId: 42161,
    id: 'arbitrum',
    logo: <ArbitrumIcon />
  },
  {
    blockchain: 'AVAX_CCHAIN',
    name: 'AVALANCHE',
    chainId: 43114,
    id: 'avax_cchain',
    logo: <AvalancheIcon />
  },
  {
    blockchain: 'HARMONY',
    name: 'HARMONY',
    chainId: 1666600000,
    id: 'harmony',
    logo: <HarmonyIcon />
  },
  {
    blockchain: 'POLYGON',
    name: 'POLYGON',
    chainId: 137,
    id: 'polygon',
    logo: <PolygonIcon />
  },
];

export const slippageList = [
  0.5, 1, 3, 5, 8, 13, 20
];
