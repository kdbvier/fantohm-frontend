import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as usdbAbi } from "../abi/USDBContract.json";
import { abi as sOHM } from "../abi/sOHM.json";
import { abi as sOHMv2 } from "../abi/sOhmv2.json";
import { abi as fuseProxy } from "../abi/FuseProxy.json";
import { abi as wsOHM } from "../abi/wsOHM.json";
import { abi as OlympusStaking } from "../abi/OlympusStakingv2.json";
import { abi as fhudAbi } from "../abi/FHUDContract.json";
import { abi as usdbMinterAbi } from "../abi/USDBMinter.json";

import { setAll } from "../helpers";

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, ICalcUserBondDetailsAsyncThunk } from "./interfaces";
import { chains } from "src/providers";
import { BondAction, BondType, PaymentToken } from "src/lib/Bond";

export const getBalances = createAsyncThunk(
    "account/getBalances",
    async ({ address, networkId }: IBaseAddressAsyncThunk) => {
        const provider = await chains[networkId].provider;

        async function getBridgeTokenBalance() {
            if (addresses[networkId].BRIDGE_TOKEN_ADDRESS) {
                const bridgeTokenContract = new ethers.Contract(
                    addresses[networkId].BRIDGE_TOKEN_ADDRESS as string,
                    ierc20Abi,
                    provider,
                );
                return await bridgeTokenContract.balanceOf(address);
            } else {
                return 0;
            }
        }

        let ohmBalance = 0;
        let sohmBalance = 0;
        let wsohmBalance = 0;
        let bridgeTokenBalance = 0;
        let fhudBalance = 0;
        let usdbBalance = 0;

        if (networkId === 250) {
            const fhudContract = new ethers.Contract(addresses[networkId].FHUD_ADDRESS as string, fhudAbi, provider);
            fhudBalance = await fhudContract.balanceOf(address);
            const usdbContract = new ethers.Contract(addresses[networkId].USDB_ADDRESS as string, usdbAbi, provider);
            usdbBalance = await usdbContract.balanceOf(address);
        }
        // Contract interactions
        if (addresses[networkId].OHM_ADDRESS || addresses[networkId].SOHM_ADDRESS || addresses[networkId].WSOHM_ADDRESS) {
            const ohmContract = new ethers.Contract(addresses[networkId].OHM_ADDRESS as string, ierc20Abi, provider);
            const sohmContract = new ethers.Contract(addresses[networkId].SOHM_ADDRESS as string, ierc20Abi, provider);
            const wsohmContract = new ethers.Contract(addresses[networkId].WSOHM_ADDRESS as string, wsOHM, provider);

            [ohmBalance, sohmBalance, wsohmBalance, bridgeTokenBalance] = await Promise.all([
                ohmContract.balanceOf(address),
                sohmContract.balanceOf(address),
                wsohmContract.balanceOf(address),
                getBridgeTokenBalance(),
            ]);
        }

        let poolBalance = 0;
        // const poolTokenContract = new ethers.Contract(addresses[networkId].PT_TOKEN_ADDRESS as string, ierc20Abi, provider);
        // poolBalance = await poolTokenContract.balanceOf(address);

        return {
            balances: {
                ohm: ethers.utils.formatUnits(ohmBalance, "gwei"),
                sohm: ethers.utils.formatUnits(sohmBalance, "gwei"),
                wsohm: ethers.utils.formatUnits(wsohmBalance, 18),
                fhud: ethers.utils.formatUnits(fhudBalance, 18),
                usdb: ethers.utils.formatUnits(usdbBalance, 18),
                pool: ethers.utils.formatUnits(poolBalance, "gwei"),
                bridge: ethers.utils.formatUnits(bridgeTokenBalance, "gwei"),
            },
        };
    },
);

interface IUserAccountDetails {
    balances: {
        dai: string;
        ohm: string;
        sohm: string;
        wsohm: string;
        fhud: string;
        usdb: string;
    };
    staking: {
        ohmStake: number;
        ohmUnstake: number;
        fhudAllowance: number;
    };
    warmup: {
        depositAmount: number;
        warmUpAmount: number;
        expiryBlock: number;
    };
    bonding: {
        daiAllowance: number;
    };
    bridging: {
        // for incoming (in FHM.m)
        bridgeDownstreamAllowance: number;
        // for outgoing (in FHM)
        bridgeUpstreamAllowance: number;
    };
}

export const loadAccountDetails = createAsyncThunk(
    "account/loadAccountDetails",
    async ({ networkId, address }: IBaseAddressAsyncThunk, { dispatch }) => {
        const provider = await chains[networkId].provider;

        async function loadBridgeAccountDetails() {
            let bridgeTokenBalance = 0;
            let bridgeUpstreamAllowance = 0;
            let bridgeDownstreamAllowance = 0;
            if (addresses[networkId].BRIDGE_TOKEN_ADDRESS && addresses[networkId].BRIDGE_ADDRESS) {
                const ohmContract = new ethers.Contract(addresses[networkId].OHM_ADDRESS as string, ierc20Abi, provider);
                const bridgeContract = new ethers.Contract(
                    addresses[networkId].BRIDGE_TOKEN_ADDRESS as string,
                    ierc20Abi,
                    provider,
                );
                [bridgeTokenBalance, bridgeUpstreamAllowance, bridgeDownstreamAllowance] = await Promise.all([
                    bridgeContract.balanceOf(address),
                    ohmContract.allowance(address, addresses[networkId].BRIDGE_ADDRESS),
                    bridgeContract.allowance(address, addresses[networkId].BRIDGE_ADDRESS),
                ]);
            }

            return {
                bridgeTokenBalance,
                bridgeUpstreamAllowance,
                bridgeDownstreamAllowance,
            };
        }

        let ohmBalance = 0;
        let stakeAllowance = 0;
        let sohmBalance = 0;
        let unstakeAllowance = 0;
        let poolAllowance = 0;
        let wsohmBalance = 0;
        let sohmWrappingAllowance = 0;
        let wsohmUnwrappingAllowance = 0;
        let bridgeTokenBalance = 0;
        let bridgeUpstreamAllowance = 0;
        let bridgeDownstreamAllowance = 0;

        let fhudBalance = 0;
        let fhudAllowance = 0;
        let usdbBalance = 0;

        let depositAmount = 0;
        let warmUpAmount = 0;
        let expiry = 0;

        // Contracts
        if (addresses[networkId].OHM_ADDRESS || addresses[networkId].SOHM_ADDRESS || addresses[networkId].WSOHM_ADDRESS) {
            const ohmContract = new ethers.Contract(addresses[networkId].OHM_ADDRESS as string, ierc20Abi, provider);
            const sohmContract = new ethers.Contract(addresses[networkId].SOHM_ADDRESS as string, sOHMv2, provider);
            const wsohmContract = new ethers.Contract(addresses[networkId].WSOHM_ADDRESS as string, wsOHM, provider);
            const stakingContract = new ethers.Contract(
                addresses[networkId].STAKING_ADDRESS as string,
                OlympusStaking,
                provider,
            );

            // Contract Interactions
            let warmupInfo;
            [
                ohmBalance,
                stakeAllowance,
                sohmBalance,
                unstakeAllowance,
                poolAllowance,
                wsohmBalance,
                sohmWrappingAllowance,
                wsohmUnwrappingAllowance,
                warmupInfo,
                { bridgeTokenBalance, bridgeUpstreamAllowance, bridgeDownstreamAllowance },
            ] = await Promise.all([
                ohmContract.balanceOf(address),
                ohmContract.allowance(address, addresses[networkId].STAKING_HELPER_ADDRESS),
                sohmContract.balanceOf(address),
                sohmContract.allowance(address, addresses[networkId].STAKING_ADDRESS),
                sohmContract.allowance(address, addresses[networkId].PT_PRIZE_POOL_ADDRESS),
                wsohmContract.balanceOf(address),
                sohmContract.allowance(address, addresses[networkId].WSOHM_ADDRESS),
                wsohmContract.allowance(address, addresses[networkId].WSOHM_ADDRESS),
                stakingContract.warmupInfo(address),
                loadBridgeAccountDetails(),
            ]);
            console.log("herrrrrrrrrrrrrrr")

            if (networkId === 250) {
                const fhudContract = new ethers.Contract(addresses[networkId].FHUD_ADDRESS as string, fhudAbi, provider);
                fhudBalance = await fhudContract.balanceOf(address);
                fhudAllowance = await fhudContract.allowance(address, addresses[networkId].USDB_MINTER);
                const usdbContract = new ethers.Contract(addresses[networkId].USDB_ADDRESS as string, usdbAbi, provider);
                usdbBalance = await usdbContract.balanceOf(address);
            }
            const balance = await sohmContract.balanceForGons(warmupInfo.gons);
            const depositAmount = warmupInfo.deposit;
            const warmUpAmount = +ethers.utils.formatUnits(balance, "gwei");
            const expiry = warmupInfo.expiry;
        }

        // if (addresses[networkId].PT_TOKEN_ADDRESS) {
        //   const poolTokenContract = await new ethers.Contract(addresses[networkId].PT_TOKEN_ADDRESS, ierc20Abi, provider);
        //   poolBalance = await poolTokenContract.balanceOf(address);
        // }

        // for (const fuseAddressKey of ["FUSE_6_SOHM", "FUSE_18_SOHM"]) {
        //   if (addresses[networkId][fuseAddressKey]) {
        //     const fsohmContract = await new ethers.Contract(
        //       addresses[networkId][fuseAddressKey] as string,
        //       fuseProxy,
        //       provider,
        //     );
        //     fsohmContract.signer;
        //     const exchangeRate = ethers.utils.formatEther(await fsohmContract.exchangeRateStored());
        //     const balance = ethers.utils.formatUnits(await fsohmContract.balanceOf(address), "gwei");
        //     fsohmBalance += Number(balance) * Number(exchangeRate);
        //   }
        // }

        return {
            balances: {
                ohm: ethers.utils.formatUnits(ohmBalance, "gwei"),
                sohm: ethers.utils.formatUnits(sohmBalance, "gwei"),
                fsohm: 0,
                wsohm: ethers.utils.formatUnits(wsohmBalance, 18),
                fhud: ethers.utils.formatUnits(fhudBalance, 18),
                usdb: ethers.utils.formatUnits(usdbBalance, 18),
                pool: ethers.utils.formatUnits(0, "gwei"),
                bridge: ethers.utils.formatUnits(bridgeTokenBalance, "gwei"),
            },
            staking: {
                ohmStake: +stakeAllowance,
                ohmUnstake: +unstakeAllowance,
                fhudAllowance: +fhudAllowance,
            },
            wrapping: {
                sohmWrappingAllowance: +sohmWrappingAllowance,
                wsohmUnwrappingAllowance: +wsohmUnwrappingAllowance,
            },
            warmup: {
                depositAmount: +ethers.utils.formatUnits(depositAmount, "gwei"),
                warmUpAmount,
                expiryBlock: expiry,
            },
            bonding: {
                daiAllowance: 0,
            },
            pooling: {
                sohmPool: +poolAllowance,
            },
            bridging: {
                bridgeUpstreamAllowance: +bridgeUpstreamAllowance,
                bridgeDownstreamAllowance: +bridgeDownstreamAllowance,
            },
        };
    },
);

export interface IUserBondDetails {
    allowance: number;
    interestDue: number;
    bondMaturationBlock: number;
    pendingPayout: string; //Payout formatted in gwei.
    bondType: BondType;
    readonly paymentToken: PaymentToken;
    readonly bondAction: BondAction;
}
export const calculateUserBondDetails = createAsyncThunk(
    "account/calculateUserBondDetails",
    async ({ address, bond, networkId }: ICalcUserBondDetailsAsyncThunk) => {

        function emptyBond() {
            return {
                bond: "",
                displayName: "",
                bondIconSvg: "",
                isLP: false,
                allowance: 0,
                balance: "0",
                interestDue: 0,
                bondMaturationBlock: 0,
                pendingPayout: "",
                bondType: BondType.Bond_11,
                paymentToken: bond.paymentToken,
                bondAction: bond.bondAction,
            };
        }

        if (!address || !bond || !networkId) return emptyBond();
        // dispatch(fetchBondInProgress());

        const provider = await chains[networkId].provider;

        // Contracts
        const bondContract = await bond.getContractForBond(networkId);
        const reserveContract = await bond.getContractForReserve(networkId);
        if (!bondContract || !reserveContract) return emptyBond();

        let interestDue, bondMaturationBlock;

        const paymentTokenDecimals = bond.paymentToken === PaymentToken.USDB ? 18 : 9;

        // Contract Interactions
        const [bondDetails, pendingPayout, allowance, balance] = await Promise.all([
            bondContract.bondInfo(address),
            bondContract.pendingPayoutFor(address),
            reserveContract.allowance(address, bond.getAddressForBond(networkId)),
            reserveContract.balanceOf(address),
        ]).then(([bondDetails, pendingPayout, allowance, balance]) => [
            bondDetails,
            ethers.utils.formatUnits(pendingPayout, paymentTokenDecimals),
            Number(allowance),
            // balance should NOT be converted to a number. it loses decimal precision
            ethers.utils.formatUnits(balance, bond.isLP ? 18 : bond.decimals),
        ]);

        interestDue = bondDetails.payout / Math.pow(10, paymentTokenDecimals);
        bondMaturationBlock = +bondDetails.vesting + +bondDetails.lastBlock;

        return {
            bond: bond.name,
            displayName: bond.displayName,
            bondIconSvg: bond.bondIconSvg,
            isLP: bond.isLP,
            allowance,
            balance,
            interestDue,
            bondMaturationBlock,
            pendingPayout,
            bondType: bond.type,
            paymentToken: bond.paymentToken,
            bondAction: bond.bondAction,
        };
    },
);

interface IAccountSlice {
    bonds: { [key: string]: IUserBondDetails };
    balances: {
        ohm: string;
        sohm: string;
        dai: string;
        oldsohm: string;
    };
    loading: boolean;
}
const initialState: IAccountSlice = {
    loading: false,
    bonds: {},
    balances: { ohm: "", sohm: "", dai: "", oldsohm: "" },
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        fetchAccountSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAccountDetails.pending, state => {
                state.loading = true;
            })
            .addCase(loadAccountDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAccountDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(getBalances.pending, state => {
                state.loading = true;
            })
            .addCase(getBalances.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(getBalances.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calculateUserBondDetails.pending, state => {
                state.loading = true;
            })
            .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
                if (!action.payload) return;
                const bond = action.payload.bond;
                state.bonds[bond] = action.payload;
                state.loading = false;
            })
            .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
