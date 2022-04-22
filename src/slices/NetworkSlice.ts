import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { BigNumber, ethers } from "ethers";
import { NetworkId, networks } from "src/networks";
import { chains } from "src/providers";
import { RootState } from "src/store";
import { IBaseAsyncThunk } from "./interfaces";
import { abi as OlympusStakingv2 } from "../abi/OlympusStakingv2.json";
import { abi as sOHM } from "../abi/sOHM.json";
import { abi as sOHMv2 } from "../abi/sOhmv2.json";
import { abi as CirculatingSupplyContract } from "../abi/CirculatingSupplyContract.json";
import { getMarketPrice, getTokenPrice } from "src/helpers";

export interface INetworkDetails {
	readonly networkId: NetworkId;
	readonly circSupply: number;
	readonly currentIndex: string;
	readonly currentBlock: number;
	readonly fiveDayRate: number;
	readonly marketCap: number;
	readonly marketPrice: number;
	readonly stakingAPY: number;
	readonly stakingRebase: number;
	readonly stakingTVL: number;
	readonly totalSupply: number;
	readonly treasuryBalance: number;
	readonly treasuryMarketValue: number;
	readonly stakingRewardFHM: number;
	readonly stakingCircSupply: number;
	readonly secondsPerEpoch: number;
	readonly endBlock: number;
	readonly epochNumber: number;
}

/**
 * - fetches the FHM Price from CoinGecko (via getTokenPrice)
 * - falls back to fetch marketPrice from ohm-dai contract
 * - updates the App.slice when it runs
 */
const loadMarketPrice = createAsyncThunk("networks/loadMarketPrice", async ({ networkId }: IBaseAsyncThunk) => {
	let marketPrice: number;
	try {
		marketPrice = await getMarketPrice(networkId);
	} catch (e) {
		marketPrice = await getTokenPrice("fantohm");
	}
	return {marketPrice};
});

/**
 * checks if networks.slice has marketPrice already for this network
 * if yes then simply load that state
 * if no then fetches via `loadMarketPrice`
 *
 * `usage`:
 * ```
 * const originalPromiseResult = await dispatch(
 *    findOrLoadMarketPrice({ networkId: networkId }),
 *  ).unwrap();
 * originalPromiseResult?.whateverValue;
 * ```
 */
export const findOrLoadMarketPrice = createAsyncThunk(
	"networks/findOrLoadMarketPrice",
	async ({ networkId }: IBaseAsyncThunk, { dispatch, getState }) => {
		const state: any = getState();
		let marketPrice;
		// check if we already have loaded market price
		if (networkId in state.networks && state.networks[networkId].marketPrice != null) {
			// go get marketPrice from networks.state
			marketPrice = state.networks[networkId].marketPrice;
		} else {
			// we don't have marketPrice in networks.state, so go get it
			try {
				const originalPromiseResult = await dispatch(
					loadMarketPrice({ networkId }),
				).unwrap();
				marketPrice = originalPromiseResult?.marketPrice;
			} catch (rejectedValueOrSerializedError) {
				// handle error here
				console.error("Returned a null response from dispatch(loadMarketPrice)");
				return;
			}
		}
		return {marketPrice};
	},
);

export const loadNetworkDetails = createAsyncThunk(
	"networks/loadNetworkDetails",
	async ({ networkId }: IBaseAsyncThunk, { dispatch }): Promise<INetworkDetails> => {
		const provider = await chains[networkId].provider;
		const addresses = networks[networkId].addresses;

		let currentIndex = "";
		let currentBlock = 0;
		let fiveDayRate = 0;
		let stakingAPY = 0;
		let stakingTVL = 0;
		let stakingRebase = 0;
		let marketCap = 0;
		let marketPrice = 0;
		let circSupply = 0;
		let totalSupply = 0;
		let treasuryMarketValue = 0;
		let stakingRewardFHM = 0;
		let stakingCircSupply = 0;
		let secondsPerEpoch = 0;
		let endBlock = 0;
		let epochNumber = 0;

		if (!addresses.OHM_ADDRESS) {
			return {
				networkId,
				currentIndex,
				currentBlock,
				fiveDayRate,
				stakingAPY,
				stakingTVL,
				stakingRebase,
				marketCap,
				marketPrice,
				circSupply,
				totalSupply,
				treasuryMarketValue,
				stakingRewardFHM,
				stakingCircSupply,
				secondsPerEpoch,
				endBlock,
				epochNumber
			} as INetworkDetails;
		}

		// Contracts
		const circSupplyContract = new ethers.Contract(addresses.CIRCULATING_SUPPLY_ADDRESS as string, CirculatingSupplyContract, provider);
		const sfhmMainContract = new ethers.Contract(addresses.SOHM_ADDRESS as string, sOHMv2, provider);
		const fhmContract = new ethers.Contract(addresses.OHM_ADDRESS as string, sOHM, provider);
		const stakingContract = new ethers.Contract(addresses.STAKING_ADDRESS as string, OlympusStakingv2, provider);

		const indexDivider = (networkId == 250 || networkId == 4002) ? 17 : 1; // for Fantom /17

		// Contract interactions
		let epoch;
		let daoSfhmBalance = 0;
		let originalStakingCircSupply = 0;

		[marketPrice, daoSfhmBalance, epoch, originalStakingCircSupply, totalSupply, circSupply, currentIndex] = await Promise.all([
			dispatch(findOrLoadMarketPrice({ networkId: networkId })).unwrap(),
			sfhmMainContract.balanceOf(addresses.DAO_ADDRESS),
			stakingContract.epoch(),
			sfhmMainContract.circulatingSupply(),
			fhmContract.totalSupply(),
			circSupplyContract.OHMCirculatingSupply(),
			stakingContract.index(),
		]).then(([marketPrice, daoSfhmBalance, epoch, originalStakingCircSupply, totalSupply, fhmCircSupply, stakingIndex]) => [
			marketPrice?.marketPrice || 0,
			daoSfhmBalance / Math.pow(10, 9),
			epoch,
			originalStakingCircSupply / Math.pow(10, 9),
			totalSupply / Math.pow(10, 9),
			fhmCircSupply / Math.pow(10, 9),
			ethers.utils.formatUnits(BigNumber.from(String(stakingIndex)).div(indexDivider), "gwei")
		]);

		// Calculations
		const distribute = epoch.distribute / Math.pow(10, 9);
		marketCap = marketPrice * circSupply;
		stakingCircSupply = originalStakingCircSupply - daoSfhmBalance;
		stakingTVL = stakingCircSupply * marketPrice;
		stakingRewardFHM = distribute * stakingCircSupply / originalStakingCircSupply;
		// const currentIndex = ethers.utils.formatUnits((await stakingContract.index())/indexDivider, "gwei")
		currentBlock = await provider.getBlockNumber()
		stakingRebase = stakingRewardFHM / originalStakingCircSupply
		secondsPerEpoch = networks[networkId].blocktime * networks[networkId].epochInterval
		endBlock = epoch.endBlock
		epochNumber = epoch.number

		const rebasesPerDay = 24 * 60 * 60 / secondsPerEpoch;

		fiveDayRate = Math.pow(1 + stakingRebase, 5 * rebasesPerDay) - 1;
		stakingAPY = Math.pow(1 + stakingRebase, 365 * rebasesPerDay) - 1;

		return {
			networkId,
			currentIndex,
			currentBlock,
			fiveDayRate,
			stakingAPY,
			stakingTVL,
			stakingRebase,
			marketCap,
			marketPrice,
			circSupply,
			totalSupply,
			treasuryMarketValue,
			stakingRewardFHM,
			stakingCircSupply,
			secondsPerEpoch,
			endBlock,
			epochNumber
		} as INetworkDetails;
	},
);

interface INetworksSlice {
	[key: number]: INetworkDetails;
}

const initialState: INetworksSlice = {
};

const networksSlice = createSlice({
	name: "networks",
	initialState,
	reducers: { },

	extraReducers: builder => {
		builder
			.addCase(loadNetworkDetails.fulfilled, (state, action) => {
				const networkId = action.payload.networkId;
				state[networkId] = action.payload;
			})
			.addCase(loadNetworkDetails.rejected, (state, { error }) => {
				console.error(error.message);
			});
	},
});

export default networksSlice.reducer;

const baseInfo = (state: RootState) => state.networks;

export const getNetworksState = createSelector(baseInfo, networks => networks);
