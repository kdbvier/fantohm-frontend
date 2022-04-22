import { abi as BondCalcContract } from "src/abi/BondCalcContract.json";
import { ethers } from "ethers";
import { addresses } from "src/constants";
import { NetworkId } from "src/networks";
import { chains } from "src/providers";

export async function getBondCalculator(networkId: NetworkId) {
  if (!addresses[networkId].BONDINGCALC_ADDRESS) return null;
  return new ethers.Contract(addresses[networkId].BONDINGCALC_ADDRESS as string, BondCalcContract, await chains[networkId].provider);
}
