import { BigNumber, ethers } from "ethers";
import { contractForRedeemHelper } from "../helpers";
import { getBalances, calculateUserBondDetails } from "./AccountSlice";
import { error, info } from "./MessagesSlice";
import { clearPendingTxn, fetchPendingTxns } from "./PendingTxnsSlice";
import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { getBondCalculator } from "src/helpers/BondCalculator";
import { RootState } from "src/store";
import { IApproveBondAsyncThunk, IBondAssetAsyncThunk, ICalcBondDetailsAsyncThunk, IJsonRPCError, IRedeemAllBondsAsyncThunk, IRedeemBondAsyncThunk, } from "./interfaces";
import { segmentUA } from "../helpers/userAnalyticHelpers";
import { BondType, PaymentToken } from "src/lib/Bond";
import { findOrLoadMarketPrice } from "./NetworkSlice";
import { networks } from "src/networks";
import { waitUntilBlock } from "src/helpers/NetworkHelper";

export const changeApproval = createAsyncThunk(
  "bonding/changeApproval",
  async ({ address, bond, provider, networkId }: IApproveBondAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const reserveContract = bond.getContractForReserveForWrite(networkId, signer);
    const bondAddr = bond.getAddressForBond(networkId);

    let approveTx;
    let bondAllowance = await reserveContract.allowance(address, bondAddr);

    // return early if approval already exists
    if (bondAllowance.gt(BigNumber.from("0"))) {
      dispatch(info("Approval completed."));
      dispatch(calculateUserBondDetails({ address, bond, networkId }));
      return;
    }

    try {
      approveTx = await reserveContract.approve(bondAddr, ethers.utils.parseUnits("1000000000", "ether").toString());
      dispatch(
        fetchPendingTxns({
          txnHash: approveTx.hash,
          text: "Approving " + bond.displayName,
          type: "approve_" + bond.name,
        }),
      );
      await approveTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
        dispatch(calculateUserBondDetails({ address, bond, networkId }));
      }
    }
  },
);

export interface IBondDetails {
  bond: string;
  bondType: BondType;
  bondDiscount: number;
  debtRatio: number;
  bondQuote: number;
  purchased: number;
  vestingTerm: number;
  maxBondPrice: number;
  bondPrice: number;
  marketPrice: number;
  isRiskFree: boolean;
  isFhud: boolean;
  bondDiscountFromRebase?: number;
  isCircuitBroken: boolean;
}
export const calcBondDetails = createAsyncThunk(
  "bonding/calcBondDetails",
  async ({ bond, value, networkId }: ICalcBondDetailsAsyncThunk, { dispatch }): Promise<IBondDetails> => {
      function emptyBond() {
          return {
              bond: "",
              bondType: BondType.Bond_11,
              bondDiscount: 0,
              debtRatio: 0,
              bondQuote: 0,
              purchased: 0,
              vestingTerm: 0,
              maxBondPrice: 0,
              bondPrice: 0,
              marketPrice: 0,
              isFhud: false,
              isRiskFree: true,
              isCircuitBroken: false,
          };
      }

    if (!value) {
      value = "0";
    }
    let amountInWei = ethers.utils.parseEther(value);
    // FIXME this is a hack
    if (bond.name === "usdbFhmBurn") amountInWei = amountInWei.div(Math.pow(10, 9));

    // Contracts
    const bondContract = await bond.getContractForBond(networkId);
    const bondCalcContract = await getBondCalculator(networkId);
    if (!bondContract || !bondCalcContract) return emptyBond();

    async function getBondQuoteAndValuation() {
      let bondQuote, valuation = 0;
      if (!bondContract || !bondCalcContract) return { bondQuote, valuation };
      if (Number(value) === 0) {
        // if inputValue is 0 avoid the bondQuote calls
        bondQuote = 0;
      } else if (bond.isLP) {
        [valuation, bondQuote] = await Promise.all([
          bondCalcContract.valuation(bond.getAddressForReserve(networkId), amountInWei),
          bondContract.payoutFor(valuation),
        ]);
        if (!amountInWei.isZero() && bondQuote < 100000) {
          bondQuote = 0;
          const errorString = "Amount is too small!";
          dispatch(error(errorString));
        } else {
          bondQuote = bondQuote / Math.pow(10, 9);
        }
      } else {
        // RFV = DAI
        bondQuote = await bondContract.payoutFor(amountInWei);
  
        if (!amountInWei.isZero() && bondQuote < 100000000000000) {
          bondQuote = 0;
          const errorString = "Amount is too small!";
          dispatch(error(errorString));
        } else {
          bondQuote = bondQuote / Math.pow(10, 18);
        }
      }

      return { bondQuote, valuation };
    }

    // Contract interactions
    const [fhmMarketPrice, terms, maxBondPrice, debtRatio, bondPrice, purchased, valuation, bondQuote] = await Promise.all([
      dispatch(findOrLoadMarketPrice({ networkId: networkId })).unwrap(),
      bondContract.terms(),
      bondContract.maxPayout(),
      bondContract.standardizedDebtRatio().catch((reason: any) => (console.log("error getting standardizedDebtRatio", reason), 0)),
      bondContract.bondPriceInUSD().catch((reason: any) => (console.log("error getting bondPriceInUSD", reason), 0)),
      bond.getTreasuryBalance(networkId),
      getBondQuoteAndValuation(),
    ]).then(([fhmMarketPrice, terms, maxBondPrice, debtRatio, bondPrice, purchased, { valuation, bondQuote }]) => [
			fhmMarketPrice?.marketPrice || 0,
      terms,
      maxBondPrice / Math.pow(10, 9),
      debtRatio / Math.pow(10, 9),
      bondPrice / Math.pow(10, bond.bondPriceDecimals),
      purchased,
      valuation,
      bondQuote,
    ]);

    const paymentTokenMarketPrice = bond.paymentToken === PaymentToken.USDB ? 1 : fhmMarketPrice;

    const bondDiscount = bondPrice > 0 ? (paymentTokenMarketPrice - bondPrice) / bondPrice : 0; // 1 - bondPrice / (bondPrice * Math.pow(10, 9));

    // Circuit breaking for FHUD bonds
    let isCircuitBroken = false;
    let actualMaxBondPrice = maxBondPrice;
    if (bond.type === BondType.Bond_USDB) {
      const soldBondsLimitUsd = terms.soldBondsLimitUsd / Math.pow(10, 18);
      const circuitBreakerCurrentPayoutUsd = await bondContract.circuitBreakerCurrentPayout() / Math.pow(10, 18);
      const payoutAvailableUsd = soldBondsLimitUsd - circuitBreakerCurrentPayoutUsd;
      // If payoutAvailable is less than $500 display it as "Sold Out"
      // Note: both FHUD contracts calculate based on USD, not on payout token
      isCircuitBroken = payoutAvailableUsd < 500;
      const payoutAvailable = payoutAvailableUsd / paymentTokenMarketPrice;
      actualMaxBondPrice = Math.min(maxBondPrice, payoutAvailable);
    }

    // Display error if user tries to exceed maximum.
    if (value !== '0' && !!value && parseFloat(bondQuote.toString()) > maxBondPrice) {
      const errorString =
        "You're trying to bond more than the maximum payout available! The maximum bond payout is " +
        maxBondPrice.toFixed(2).toString() +
        ` ${bond.paymentToken}.`;
      dispatch(error(errorString));
    }

    return {
      bond: bond.name,
      bondType: bond.type,
      bondDiscount,
      debtRatio,
      bondQuote,
      purchased,
      vestingTerm: Number(terms.vestingTerm),
      maxBondPrice: actualMaxBondPrice,
      bondPrice,
      marketPrice: paymentTokenMarketPrice,
      isFhud: bond.type === BondType.Bond_USDB,
      isRiskFree: bond.isRiskFree,
      isCircuitBroken,
    };
  },
);

export const bondAsset = createAsyncThunk(
  "bonding/bondAsset",
  async ({ value, address, bond, networkId, provider, slippage }: IBondAssetAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }
    const depositorAddress = address;
    const acceptedSlippage = slippage / 100 || 0.005; // 0.5% as default
    // parseUnits takes String => BigNumber
    const valueInWei = ethers.utils.parseUnits(value.toString(), bond.isLP ? 18 : bond.decimals); // FIXME we can drop this hack
    let balance;
    // Calculate maxPremium based on premium and slippage.
    // const calculatePremium = await bonding.calculatePremium();
    const signer = provider.getSigner();
    const bondContractForRead = await bond.getContractForBond(networkId);
    const bondContractForWrite = bond.getContractForBondForWrite(networkId, signer);
    const calculatePremium = await bondContractForRead.bondPrice();
    const maxPremium = Math.round(calculatePremium * (1 + acceptedSlippage));

    // Deposit the bond
    let bondTx;
    let uaData = {
      address: address,
      value: value,
      type: "Bond",
      bondName: bond.displayName,
      approved: true,
      txHash: null,
    };
    try {
      bondTx = await bondContractForWrite.deposit(valueInWei, maxPremium, depositorAddress);
      dispatch(
        fetchPendingTxns({ txnHash: bondTx.hash, text: "Bonding " + bond.displayName, type: "bond_" + bond.name }),
      );
      uaData.txHash = bondTx.hash;
      const minedBlock = (await bondTx.wait()).blockNumber;

      const userBondDetails = await dispatch(calculateUserBondDetails({ address, bond, networkId })).unwrap();
      
      // If the maturation block is the next one. wait until the next block and then refresh bond details
      if ((userBondDetails.bondMaturationBlock - minedBlock) === 1) {
        waitUntilBlock(provider, minedBlock + 1).then(() => dispatch(calculateUserBondDetails({ address, bond, networkId })));
      }
    } catch (e: unknown) {
      const rpcError = e as IJsonRPCError;
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(
          error("You may be trying to bond more than your balance! Error code: 32603. Message: ds-math-sub-underflow"),
        );
      } else dispatch(error(rpcError.message));
    } finally {
      if (bondTx) {
        segmentUA(uaData);
        dispatch(clearPendingTxn(bondTx.hash));
      }
    }
  },
);

export const redeemBond = createAsyncThunk(
  "bonding/redeemBond",
  async ({ address, bond, networkId, provider, autostake }: IRedeemBondAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const bondContract = bond.getContractForBondForWrite(networkId, signer);

    let redeemTx;
    let uaData = {
      address: address,
      type: "Redeem",
      bondName: bond.displayName,
      autoStake: autostake,
      approved: true,
      txHash: null,
    };
    try {
      redeemTx = await bondContract.redeem(address, autostake === true);
      const pendingTxnType = "redeem_bond_" + bond.name + (autostake === true ? "_autostake" : "");
      uaData.txHash = redeemTx.hash;
      dispatch(
        fetchPendingTxns({ txnHash: redeemTx.hash, text: "Redeeming " + bond.displayName, type: pendingTxnType }),
      );

      await redeemTx.wait();
      await dispatch(calculateUserBondDetails({ address, bond, networkId }));

      dispatch(getBalances({ address, networkId }));
    } catch (e: unknown) {
      uaData.approved = false;
      dispatch(error((e as IJsonRPCError).message));
    } finally {
      if (redeemTx) {
        segmentUA(uaData);
        dispatch(clearPendingTxn(redeemTx.hash));
      }
    }
  },
);

export const redeemAllBonds = createAsyncThunk(
  "bonding/redeemAllBonds",
  async ({ bonds, address, networkId, provider, autostake }: IRedeemAllBondsAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const redeemHelperContract = contractForRedeemHelper({ networkId, signer: signer });

    let redeemAllTx;

    try {
      redeemAllTx = await redeemHelperContract.redeemAll(address, autostake);
      const pendingTxnType = "redeem_all_bonds" + (autostake === true ? "_autostake" : "");

      await dispatch(
        fetchPendingTxns({ txnHash: redeemAllTx.hash, text: "Redeeming All Bonds", type: pendingTxnType }),
      );

      await redeemAllTx.wait();

      bonds &&
        bonds.forEach(async bond => {
          dispatch(calculateUserBondDetails({ address, bond, networkId }));
        });

      dispatch(getBalances({ address, networkId }));
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
    } finally {
      if (redeemAllTx) {
        dispatch(clearPendingTxn(redeemAllTx.hash));
      }
    }
  },
);

// Note(zx): this is a barebones interface for the state. Update to be more accurate
interface IBondSlice {
  status: string;
  [key: string]: any;
}

const setBondState = (state: IBondSlice, payload: any) => {
  const bond = payload.bond;
  const newState = { ...state[bond], ...payload };
  state[bond] = newState;
  state.loading = false;
};

const initialState: IBondSlice = {
  status: "idle",
};

const bondingSlice = createSlice({
  name: "bonding",
  initialState,
  reducers: {
    fetchBondSuccess(state, action) {
      state[action.payload.bond] = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(calcBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calcBondDetails.fulfilled, (state, action) => {
        setBondState(state, action.payload);
        state.loading = false;
      })
      .addCase(calcBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.message);
      });
  },
});

export default bondingSlice.reducer;

export const { fetchBondSuccess } = bondingSlice.actions;

const baseInfo = (state: RootState) => state.bonding;

export const getBondingState = createSelector(baseInfo, bonding => bonding);
