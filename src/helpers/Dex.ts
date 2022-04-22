import { TransactionRequest } from "@ethersproject/abstract-provider/src.ts/index";
import {
  BestRouteResponse,
  EvmTransaction,
  RangoClient,
} from "rango-sdk";
import { ethers } from "ethers";

import { sleep } from "./Sleep";
import { trim } from "./index";
import { NetworkIds } from "../networks";

export const prepareEvmTransaction = (evmTransaction: EvmTransaction): TransactionRequest => {
  const manipulatedTx = {
    ...evmTransaction,
    gasPrice: !!evmTransaction.gasPrice ? "0x" + parseInt(evmTransaction.gasPrice).toString(16) : null,
  };

  let tx = {};
  if (!!manipulatedTx.from)
    tx = {...tx, from: manipulatedTx.from};
  if (!!manipulatedTx.to)
    tx = {...tx, to: manipulatedTx.to};
  if (!!manipulatedTx.data)
    tx = {...tx, data: manipulatedTx.data};
  if (!!manipulatedTx.value)
    tx = {...tx, value: manipulatedTx.value};
  if (!!manipulatedTx.gasLimit)
    tx = {...tx, gasLimit: manipulatedTx.gasLimit};
  if (!!manipulatedTx.gasPrice)
    tx = {...tx, gasPrice: manipulatedTx.gasPrice};
  if (!!manipulatedTx.nonce)
    tx = {...tx, nonce: manipulatedTx.nonce};

  return tx;
}

export const checkApprovalSync = async (bestRoute: BestRouteResponse, rangoClient: RangoClient) => {
  while (true) {
    const approvalResponse = await rangoClient.checkApproval(bestRoute.requestId);
    if (approvalResponse.isApproved) {
      return true;
    }
    await sleep(3);
  }
}

export const sortTokenList = (network: any, tokenList: any[]) => {
  if (network.chainId === NetworkIds.FantomOpera) {
    const daiIndex = tokenList.findIndex(token => token.symbol === "DAI");
    if (daiIndex >= 0) {
      let temp = tokenList[0];
      tokenList[0] = tokenList[daiIndex]
      tokenList[daiIndex] = temp;
    }
    const wFtmIndex = tokenList.findIndex(token => token.symbol === "WFTM");
    if (wFtmIndex >= 0) {
      let temp = tokenList[1];
      tokenList[1] = tokenList[wFtmIndex]
      tokenList[wFtmIndex] = temp;
    }
    const ftmIndex = tokenList.findIndex(token => token.symbol === "FTM");
    if (ftmIndex >= 0) {
      let temp = tokenList[2];
      tokenList[2] = tokenList[ftmIndex]
      tokenList[ftmIndex] = temp;
    }
    const fhmIndex = tokenList.findIndex(token => token.symbol === "FHM");
    if (fhmIndex >= 0) {
      let temp = tokenList[3];
      tokenList[3] = tokenList[fhmIndex]
      tokenList[fhmIndex] = temp;
    }

  }
};

export const truncateDecimals = (number: any, digits = 2) => {
  const multiplier = Math.pow(10, digits);
  const adjustedNum = number * multiplier;
  const truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);
  return truncatedNum / multiplier;
};

export const scientificToDecimal = (num: any) => {
  const sign = Math.sign(num);
  //if the number is in scientific notation remove it
  if(/\d+\.?\d*e[\+\-]*\d+/i.test(num)) {
    const zero = '0';
    const parts = String(num).toLowerCase().split('e'); //split into coeff and exponent
    const e = parts.pop(); //store the exponential part
    let l = Math.abs(Number(e)); //get the number of zeros
    const direction = Number(e)/l; // use to determine the zeroes on the left or right
    const coeffArray = parts[0].split('.');

    if (direction === -1) {
      coeffArray[0] = String(Math.abs(Number(coeffArray[0])));
      num = zero + '.' + new Array(l).join(zero) + coeffArray.join('');
    }
    else {
      const dec = coeffArray[1];
      if (dec) l = l - dec.length;
      num = coeffArray.join('') + new Array(l+1).join(zero);
    }
  }

  if (sign < 0) {
    num = -num;
  }

  return num;
}

export const formatAmount = (amount: any, decimals: any, length = 2, symbol:string="") => {
  if (!amount || !decimals) {
    return 0;
  }

  // workaround for well known decimals
  if (["BTC", "BCH", "LTC"].indexOf(symbol) >= 0) length = Math.min(decimals, 8);
  else if (["ETH", "BNB", "MATIC", "AVAX", "FTM"].indexOf(symbol) >= 0) length = Math.min(decimals, 9);

  const result = ethers.utils.formatUnits(scientificToDecimal(amount).toString(), decimals);
  return truncateDecimals(result, length);
};

export const requireAssetMessage = (requireAssets: any) => {
  if (!requireAssets || !requireAssets.length) {
    return [];
  }
  const result: string[] = [];
  requireAssets.forEach((item: any) => {
    if (!item.ok) {
      result.push(`Needs ≈ ${formatAmount(item.requiredAmount.amount, item.requiredAmount.decimals, 5)} ${item.asset.symbol} for ${item.reason == "FEE" ? "network fee" : "swap"} but you have ${formatAmount(item.currentAmount.amount, item.currentAmount.decimals, 5)} ${item.asset.symbol}`);
    }
  });
  return result;
};

export const expectSwapErrors = (swaps: any) => {
  if (!swaps || !swaps.length) {
    return [];
  }
  const result: any[] = [];
  swaps.forEach((swap: any) => {
    if (!swap?.fromAmountMinValue || !swap?.fromAmountMaxValue) {
      return;
    }
    const title = `${swap.swapperId} Limit`;
    const yours = `Yours: ${new Intl.NumberFormat("en-US").format(swap.fromAmount)} ${swap.from.symbol}`
    let required;
    if (Number(swap?.fromAmountMinValue) > Number(swap?.fromAmount)) {
      required = `Required: >= ${new Intl.NumberFormat("en-US").format(swap?.fromAmountMinValue)} ${swap.from.symbol}`;
    }
    if (Number(swap?.fromAmount) > Number(swap?.fromAmountMaxValue)) {
      required = `Required: <= ${new Intl.NumberFormat("en-US").format(swap?.fromAmountMaxValue)} ${swap.from.symbol}`;
    }
    if (required) {
      result.push(
        {
          title,
          required,
          yours
        }
      );
    }
  });
  return result;
};

export const feeCalculator = (fee: any, metaData: any) => {
  if (!fee || !fee.length || !metaData) {
    return 0;
  }
  let result = 0;
  fee.forEach((item: any) => {
    const token = metaData.tokens.find((token: any) => token.address == item?.asset?.address && token.blockchain == item?.asset?.blockchain);
    if (token) {
      result += Number(item.amount) * Number(token.usdPrice);
    }
  });
  return result;
};


export const getTotalFee = (swaps: any, metaData: any) => {
  if (!swaps || !swaps.length || !metaData) {
    return 0;
  }
  let result = 0;
  swaps.forEach((swap: any) => {
    result += Number(feeCalculator(swap.fee, metaData));
  });
  return result;
};

export const getTotalSwapTime = (swaps: any) => {
  if (!swaps || !swaps.length) {
    return 0;
  }
  let result = 0;
  swaps.forEach((swap: any) => {
    result += Number(swap.timeStat.avg);
  });
  return result;
};

export const getSwapPath = (swaps: any) => {
  if (!swaps || !swaps.length) {
    return [];
  }
  let path: any[] = [];
  swaps.forEach((swap: any, index: number) => {
    path.push(swap.from);
    if (index == swaps.length -1) {
      path.push(swap.to);
    }
  });
  return path;
};

export const formatSwapTime = (duration: number) => {
  const hrs = parseInt((duration / 3600).toString(), 10);
  const mins = parseInt(((duration % 3600) / 60).toString(), 10);
  const secs = duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let result = "";
  if (hrs > 0) {
    result += "" + (hrs < 10 ? "0" + hrs : hrs) + ":";
  }
  result += "" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs);
  return result;
};

export const getDownRate = (fromToken: any, toToken: any, fromTokenAmount: number, toTokenAmount: number) => {
  if (fromTokenAmount == 0 || toTokenAmount == 0 || !fromToken || !toToken) {
    return null;
  }
  const to = toTokenAmount * toToken.usdPrice;
  const from = fromTokenAmount * fromToken.usdPrice;
  return (to / from * 100 - 100);
};

export const isDexPage = () => {
  return window.location.hash.indexOf('dex') >= 0;
}

export const sliceList = (data: any[], length: number) => {
  return data.slice(0, length);
}
