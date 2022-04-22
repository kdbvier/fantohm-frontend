import { JsonRpcProvider } from "@ethersproject/providers";
import { Bond } from "src/lib/Bond";
import { Investment } from "src/lib/Investment";
import { NetworkId } from "src/networks";

export interface IJsonRPCError {
  readonly message: string;
  readonly code: number;
}

export interface IBaseAsyncThunk {
  readonly networkId: NetworkId;
}

export interface IInteractiveAsyncThunk {
  readonly provider: JsonRpcProvider;
}

export interface IChangeApprovalAsyncThunk extends IBaseAsyncThunk, IInteractiveAsyncThunk {
  readonly token: string;
  readonly address: string;
}

export interface IActionAsyncThunk extends IBaseAsyncThunk, IInteractiveAsyncThunk {
  readonly action: string;
  readonly address: string;
}

export interface IValueAsyncThunk extends IBaseAsyncThunk {
  readonly value: string;
  readonly address: string;
}

export interface IActionValueAsyncThunk extends IValueAsyncThunk, IInteractiveAsyncThunk {
  readonly action: string;
}

export interface IBaseAddressAsyncThunk extends IBaseAsyncThunk {
  readonly address: string;
}

// Account Slice

export interface ICalcUserBondDetailsAsyncThunk extends IBaseAddressAsyncThunk, IBaseBondAsyncThunk {}

// Bond Slice

export interface IBaseBondAsyncThunk extends IBaseAsyncThunk {
  readonly bond: Bond;
}

export interface IApproveBondAsyncThunk extends IBaseBondAsyncThunk, IInteractiveAsyncThunk {
  readonly address: string;
}

export interface ICalcBondDetailsAsyncThunk extends IBaseBondAsyncThunk {
  readonly value: string;
}

export interface ICalcInvestmentDetailsAsyncThunk {
  readonly investment: Investment;
}

export interface ICalcTokenPriceAsyncThunk {
  readonly investment: Investment;
}

export interface ICalcGlobalBondDetailsAsyncThunk {
  readonly allBonds: Bond[];
}

export interface IBondAssetAsyncThunk extends IBaseBondAsyncThunk, IValueAsyncThunk, IInteractiveAsyncThunk {
  readonly slippage: number;
}

export interface IRedeemBondAsyncThunk extends IBaseBondAsyncThunk, IInteractiveAsyncThunk {
  readonly address: string;
  readonly autostake: boolean;
}

export interface IRedeemAllBondsAsyncThunk extends IBaseAsyncThunk, IInteractiveAsyncThunk {
  readonly bonds: Bond[];
  readonly address: string;
  readonly autostake: boolean;
}

export interface IWrapDetails extends IBaseAsyncThunk {
    isWrap: boolean;
    value: string;
}
