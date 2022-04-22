import { setAll } from "../helpers";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAsyncThunk } from "./interfaces";
import { enabledMainNetworkIds, enabledNetworkIds } from "src/networks";
import { loadNetworkDetails } from "./NetworkSlice";

const initialState = {
	loading: false,
	loadingMarketPrice: false,
};

export const loadAppDetails = createAsyncThunk(
	"app/loadAppDetails",
	async ({ networkId }: IBaseAsyncThunk, {dispatch}) => {

		const networkDetailsList = await Promise.all(enabledNetworkIds.map(enabledNetworkId => dispatch(loadNetworkDetails({ networkId: enabledNetworkId })).unwrap()));
		const localNetworkDetails = networkDetailsList.find(networkDetails => networkDetails.networkId === networkId);
		if (localNetworkDetails === undefined) {
			throw new Error(`Unable to load local network details. networkId: ${networkId}`);
		}

		const prodNetworkDetailsList = networkDetailsList.filter(networkDetails => enabledMainNetworkIds.includes(networkDetails.networkId));

		// Global network calculations
		const globalMarketCap = prodNetworkDetailsList.map(networkDetails => networkDetails.marketCap).reduce((sum, a) => sum + a, 0);
		const globalCircSupply = prodNetworkDetailsList.map(networkDetails => networkDetails.circSupply).reduce((sum, a) => sum + a, 0);
		const globalTotalSupply = prodNetworkDetailsList.map(networkDetails => networkDetails.totalSupply).reduce((sum, a) => sum + a, 0);
		const globalStakingTVL = prodNetworkDetailsList.map(networkDetails => networkDetails.stakingTVL).reduce((sum, a) => sum + a, 0);
		const globalStakingRewardFHM = prodNetworkDetailsList.map(networkDetails => networkDetails.stakingRewardFHM).reduce((sum, a) => sum + a, 0);
		const globalStakingCircSupply = prodNetworkDetailsList.map(networkDetails => networkDetails.stakingCircSupply).reduce((sum, a) => sum + a, 0);

		const globalStakingRebase = globalStakingRewardFHM / globalStakingCircSupply;
		const globalFiveDayRate = prodNetworkDetailsList.map(networkDetails => networkDetails.fiveDayRate).reduce((sum, a) => sum + a * (1 / enabledMainNetworkIds.length), 0);
		const globalStakingAPY = prodNetworkDetailsList.map(networkDetails => networkDetails.stakingAPY).reduce((sum, a) => sum + a * (1 / enabledMainNetworkIds.length), 0);

		return {
			currentIndex: localNetworkDetails.currentIndex,
			currentBlock: localNetworkDetails.currentBlock,
			fiveDayRate: localNetworkDetails.fiveDayRate,
			stakingAPY: localNetworkDetails.stakingAPY,
			stakingTVL: localNetworkDetails.stakingTVL,
			stakingRebase: localNetworkDetails.stakingRebase,
			marketCap: localNetworkDetails.marketCap,
			marketPrice: localNetworkDetails.marketPrice,
			circSupply: localNetworkDetails.circSupply,
			totalSupply: localNetworkDetails.totalSupply,
			treasuryMarketValue: localNetworkDetails.treasuryMarketValue,
			stakingRewardFHM: localNetworkDetails.stakingRewardFHM,
			stakingCircSupply: localNetworkDetails.stakingCircSupply,
			secondsPerEpoch: localNetworkDetails.secondsPerEpoch,
			globalMarketCap: globalMarketCap,
			globalCircSupply: globalCircSupply,
			globalTotalSupply: globalTotalSupply,
			globalStakingTVL: globalStakingTVL,
			globalFiveDayRate: globalFiveDayRate,
			globalStakingAPY: globalStakingAPY,
			globalStakingRebase: globalStakingRebase,
			globalStakingRewardFHM: globalStakingRewardFHM,
			globalStakingCircSupply: globalStakingCircSupply,
			endBlock: localNetworkDetails.endBlock,
			epochNumber: localNetworkDetails.epochNumber,
		} as IAppData;
	},
);

interface IAppData {
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
	readonly globalMarketCap: number;
	readonly globalCircSupply: number;
	readonly globalTotalSupply: number;
	readonly globalStakingTVL: number;
	readonly globalFiveDayRate: number;
	readonly globalStakingAPY: number;
	readonly globalStakingRebase: number;
	readonly globalStakingRewardFHM: number;
	readonly globalStakingCircSupply: number;
	readonly endBlock: number;
	readonly epochNumber: number;
}

const appSlice = createSlice({
	name: "app",
	initialState,
	reducers: {
		fetchAppSuccess(state, action) {
			setAll(state, action.payload);
		},
	},
	extraReducers: builder => {
		builder
			.addCase(loadAppDetails.pending, state => {
				state.loading = true;
			})
			.addCase(loadAppDetails.fulfilled, (state, action) => {
				setAll(state, action.payload);
				state.loading = false;
			})
			.addCase(loadAppDetails.rejected, (state, {error}) => {
				state.loading = false;
				console.error(error.name, error.message, error.stack);
			});
	},
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const {fetchAppSuccess} = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
