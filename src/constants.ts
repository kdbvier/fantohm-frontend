import { networks, enabledNetworkIds } from "src/networks";

export const THE_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/colonelssecretspices/kfc-graph";

export const TOKEN_DECIMALS = 9;

export const MISSING_ADDRESS = '0x0000000000000000000000000000000000000000';

export const RANGO_API_KEY = '46bf9bfe-560b-4bd7-9eb3-79c2bf7080cb';

interface IAddresses {
  [key: number]: { [key: string]: string };
};

export const addresses: IAddresses = enabledNetworkIds.reduce((addresses: { [key: number]: { [key: string]: string } }, networkId) => (addresses[networkId] = networks[networkId].addresses, addresses), {});