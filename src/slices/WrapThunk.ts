import { ethers, BigNumber } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as WrappingContract } from "../abi/mwsFHM.json";
import { clearPendingTxn, fetchPendingTxns } from "./PendingTxnsSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountSuccess, getBalances } from "./AccountSlice";
import { error, info } from "../slices/MessagesSlice";
import { IActionValueAsyncThunk, IChangeApprovalAsyncThunk, IJsonRPCError, IWrapDetails } from "./interfaces";
import { segmentUA } from "../helpers/userAnalyticHelpers";
import { chains } from "src/providers"

interface IUAData {
  address: string;
  value: string;
  approved: boolean;
  txHash: string | null;
  type: string | null;
}

function alreadyApprovedToken(token: string, sohmWrappingAllowance: BigNumber, wsohmUnwrappingAllowance: BigNumber) {
  // set defaults
  let bigZero = BigNumber.from("0");
  let applicableAllowance = bigZero;

  // determine which allowance to check
  if (token === "sfhm") {
    applicableAllowance = sohmWrappingAllowance;
  } else if (token === "wsfhm") {
    applicableAllowance = wsohmUnwrappingAllowance;
  }

  // check if allowance exists
  if (applicableAllowance.gt(bigZero)) return true;

  return false;
}


export const changeApproval = createAsyncThunk(
  "wrap/changeApproval",
  async ({ token, provider, address, networkId }: IChangeApprovalAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const sohmContract = new ethers.Contract(addresses[networkId].SOHM_ADDRESS as string, ierc20Abi, signer);
    const wsohmContract = new ethers.Contract(addresses[networkId].WSOHM_ADDRESS as string, ierc20Abi, signer);
    let approveTx;
    let sohmWrappingAllowance = await sohmContract.allowance(address, addresses[networkId].WSOHM_ADDRESS);
    let wsohmUnwrappingAllowance = await wsohmContract.allowance(address, addresses[networkId].WSOHM_ADDRESS);

    // return early if approval has already happened
    if (alreadyApprovedToken(token, sohmWrappingAllowance, wsohmUnwrappingAllowance)) {
      dispatch(info("Approval completed."));
      return dispatch(
        fetchAccountSuccess({
          wrapping: {
            sohmWrappingAllowance: +sohmWrappingAllowance,
            wsohmUnwrappingAllowance: +wsohmUnwrappingAllowance,
          },
        }),
      );
    }

    try {
      if (token === "sfhm") {
        // won't run if sohmWrappingAllowance > 0
        approveTx = await sohmContract.approve(
          addresses[networkId].WSOHM_ADDRESS,
          ethers.utils.parseUnits("1000000000", "gwei").toString(),
        );
      } else if (token === "wsfhm") {
        approveTx = await wsohmContract.approve(
          addresses[networkId].WSOHM_ADDRESS,
          ethers.utils.parseUnits("1000000000", "gwei").toString(),
        );
      }

      const text = "Approve " + (token === "sfhm" ? "Wrapping" : "Unwrapping");
      const pendingTxnType = token === "sfhm" ? "approve_wrap" : "approve_unwrap";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));

      await approveTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }

    // go get fresh allowances
    sohmWrappingAllowance = await sohmContract.allowance(address, addresses[networkId].WSOHM_ADDRESS);
    wsohmUnwrappingAllowance = await wsohmContract.allowance(address, addresses[networkId].WSOHM_ADDRESS);

    return dispatch(
      fetchAccountSuccess({
        wrapping: {
          sohmWrappingAllowance: +sohmWrappingAllowance,
          wsohmUnwrappingAllowance: +wsohmUnwrappingAllowance,
        },
      }),
    );
  },
);

export const changeWrap = createAsyncThunk(
  "wrap/changeWrap",
  async ({ action, value, provider, address, networkId }: IActionValueAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const wrapContract = new ethers.Contract(addresses[networkId].WSOHM_ADDRESS as string, WrappingContract, signer);

    let wrapTx;
    let uaData: IUAData = {
      address: address,
      value: value,
      approved: true,
      txHash: null,
      type: null,
    };
    try {
      if (action === "wrap") {
        uaData.type = "wrap";
        wrapTx = await wrapContract.wrap(
          ethers.utils.parseUnits(value, 9)
        );
      } else {
        uaData.type = "unwrap";
        wrapTx = await wrapContract.unwrap(
          ethers.utils.parseUnits(value, 18)
        );
      }
      const pendingTxnType = action === "wrap" ? "wrap" : "unwrap";
      uaData.txHash = wrapTx.hash;
      dispatch(fetchPendingTxns({
        txnHash: wrapTx.hash,
        text: action === 'wrap' ? 'Wrap sFHM' : 'Unwrap wrapped sFHM',
        type: pendingTxnType
      }));
      await wrapTx.wait();
    } catch (e: unknown) {
      uaData.approved = false;
      const rpcError = e as IJsonRPCError;
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(
          error("You may be trying to wrap/unwrap more than your balance! Error code: 32603. Message: ds-math-sub-underflow"),
        );
      } else {
        dispatch(error(rpcError.message));
      }
      return;
    } finally {
      if (wrapTx) {
        segmentUA(uaData);

        dispatch(clearPendingTxn(wrapTx.hash));
      }
    }
    dispatch(getBalances({ address, networkId }));
  },
);

export const calcWrapValue = async ({ isWrap, value, networkId }: IWrapDetails): Promise<number> => {
    const provider = await chains[networkId].provider
    const amountInWei = isWrap ? ethers.utils.parseUnits(value, "gwei") : ethers.utils.parseEther(value);
    let wrapValue = 0;
    const wrapContract = new ethers.Contract(addresses[networkId].WSOHM_ADDRESS as string, WrappingContract, provider);

    if (isWrap) {
        const sFHMToWrapped = await wrapContract.wsFHMValue(amountInWei);
        wrapValue = sFHMToWrapped / Math.pow(10, 18);
    } else {
        const wsFHMToUnwrapped = await wrapContract.sFHMValue(amountInWei);
        wrapValue = wsFHMToUnwrapped / Math.pow(10, 9);
    }
    return wrapValue;
};
