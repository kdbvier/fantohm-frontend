import { addresses } from "../constants";
import { ethers } from "ethers";
import axios from "axios";
import { abi as PairContract } from "../abi/PairContract.json";
import { abi as RedeemHelperAbi } from "../abi/RedeemHelper.json";

import { SvgIcon } from "@material-ui/core";
import { ReactComponent as OhmImg } from "../assets/tokens/token_OHM.svg";
import { ReactComponent as SOhmImg } from "../assets/tokens/token_sOHM.svg";

import { JsonRpcSigner } from "@ethersproject/providers";

import { NetworkId, networks } from "src/networks";
import { LocalStorage } from "./LocalStorage";
import { chains } from "src/providers";

// NOTE (appleseed): this looks like an outdated method... we now have this data in the graph (used elsewhere in the app)
export async function getMarketPrice(networkId : NetworkId) {
	const provider = await chains[networkId].provider;
	const marketPriceReserveAddress = networks[networkId].addresses.MARKET_PRICE_LP_ADDRESS;
	const pairContract = new ethers.Contract(marketPriceReserveAddress, PairContract, provider);
	const reserves = await pairContract.getReserves();
	const reserveDecimals = networks[networkId].liquidityPoolReserveDecimals;

	const reserve0 = reserves[0] / Math.pow(10, reserveDecimals.token0Decimals);
	const reserve1 = reserves[1] / Math.pow(10, reserveDecimals.token1Decimals);

	const marketPrice = reserveDecimals.token1Decimals === 9 ? reserve0/reserve1 : reserve1/reserve0;
	return marketPrice;
}

const validCacheTime = 60 * 1000;

// this function is not working for some tokens, use getCoingeckoTokenPrice() instead
export async function getTokenPrice(tokenId = "fantohm") {
	const cacheKey = "price_" + tokenId;
	let entry = LocalStorage.get(cacheKey);
	if (entry && new Date().getTime() <= entry.valid) return entry.data;
	else {
		try {
			const resp = await axios.get(`https://coingecko.arcade.money/?action=coingeckoPrice&id=${tokenId}`);
			let tokenPrice: number = resp.data[tokenId].usd;
			LocalStorage.set(cacheKey, {
				valid: new Date().getTime() + validCacheTime,
				data: tokenPrice,
			});
			return tokenPrice;
		} catch (e) {
			const resp = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`);
			let tokenPrice: number = resp.data[tokenId].usd;
			LocalStorage.set(cacheKey, {
				valid: new Date().getTime() + validCacheTime,
				data: tokenPrice,
			});
			return tokenPrice;
		}
	}
}

export async function getCoingeckoTokenPrice(chain: string, ca: string) {
	if (!ca) {
		return;
	}
	const cacheKey = "tokenPrice_" + chain + "_" + ca;
	let entry = LocalStorage.get(cacheKey);
	if (entry && new Date().getTime() <= entry.valid) return entry.data;
	const resp = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/${chain}?contract_addresses=${ca}&vs_currencies=usd`);
	let tokenPrice: number = resp.data[ca.toLowerCase()]["usd"];
	LocalStorage.set(cacheKey, {
		valid: new Date().getTime() + validCacheTime,
		data: tokenPrice,
	});
	return tokenPrice;
}

export function roundToNearestHour(seconds: number) {
  return seconds - (seconds % 3600);
}

export async function getHistoricTokenPrice(chain:string, ca:string) {
  const resp: any = await axios.get(`https://api.coingecko.com/api/v3/coins/${chain}/contract/${ca}/market_chart?vs_currency=usd&days=90`);
	const prices = resp.data.prices;
  return resp.data.prices.reduce((prices: {[key: number]: number}, price: [number, number]) => (prices[roundToNearestHour(price[0] / 1000)] = price[1], prices), {});
}

export async function getBinanceTokenPrice(ticker = "MATICUSDT") {
	const resp = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${ticker}`);
	let tokenPrice: number = resp.data["price"];
	return tokenPrice;
}

export function shorten(str: string) {
	if (str.length < 10) return str;
	return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
}

export function formatCurrency(c: number, precision = 0) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: precision,
		minimumFractionDigits: precision,
	}).format(c);
}

export function trim(number = 0, precision = 0) {
	// why would number ever be undefined??? what are we trimming?
	const array = number.toString().split(".");
	if (array.length === 1) return number.toString();
	if (precision === 0) return array[0].toString();

	const poppedNumber = array.pop() || "0";
	array.push(poppedNumber.substring(0, precision));
	const trimmedNumber = array.join(".");
	return trimmedNumber;
}

export function getRebaseBlock(networkId: NetworkId, currentBlock: number) {
	return currentBlock + networks[networkId].epochInterval - ((currentBlock - networks[networkId].epochBlock) % networks[networkId].epochInterval);
}

export function secondsUntilBlock(networkId: NetworkId, startBlock: number, endBlock: number) {
	const blocksAway = endBlock - startBlock;
	const secondsAway = blocksAway * networks[networkId].blocktime;

	return secondsAway;
}

export function prettyVestingPeriod(networkId: NetworkId, currentBlock: number, vestingBlock: number) {
	if (vestingBlock === 0) {
		return "";
	}

	const seconds = secondsUntilBlock(networkId, currentBlock, vestingBlock);
	if (seconds < 0) {
		return "Fully Vested";
	}
	return prettifySeconds(seconds);
}

export function prettifySeconds(seconds: number, resolution?: string) {
	if (seconds !== 0 && !seconds) {
		return "";
	}

	const d = Math.floor(seconds / (3600 * 24));
	const h = Math.floor((seconds % (3600 * 24)) / 3600);
	const m = Math.floor((seconds % 3600) / 60);

	if (resolution === "day") {
		return d + (d == 1 ? " day" : " days");
	}

	const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	const hDisplay = h > 0 ? h + (h == 1 ? " hr, " : " hrs, ") : "";
	const mDisplay = m > 0 ? m + (m == 1 ? " min" : " mins") : "";

	let result = dDisplay + hDisplay + mDisplay;
	if (mDisplay === "") {
		result = result.slice(0, result.length - 2);
	}

	if (result === "") result = "Instant";

	return result;
}

function getSohmTokenImage() {
	return <SvgIcon component={SOhmImg} viewBox="0 0 100 100" style={{height: "1rem", width: "1rem"}}/>;
}

export function getOhmTokenImage(w?: number, h?: number) {
	const height = h == null ? "32px" : `${h}px`;
	const width = w == null ? "32px" : `${w}px`;
	return <SvgIcon component={OhmImg} viewBox="0 0 32 32" style={{height, width}}/>;
}

export function getTokenImage(name: string) {
	if (name === "fhm") return getOhmTokenImage();
	if (name === "sfhm") return getSohmTokenImage();
}

// TS-REFACTOR-NOTE - Used for:
// AccountSlice.ts, AppSlice.ts, LusdSlice.ts
export function setAll(state: any, properties: any) {
	const props = Object.keys(properties);
	props.forEach(key => {
		state[key] = properties[key];
	});
}

export function contractForRedeemHelper({
											networkId,
											signer,
										}: {
	networkId: number;
	signer: JsonRpcSigner;
}) {
	return new ethers.Contract(addresses[networkId].REDEEM_HELPER_ADDRESS as string, RedeemHelperAbi, signer);
}

/**
 * returns false if SafetyCheck has fired in this Session. True otherwise
 * @returns boolean
 */
export const shouldTriggerSafetyCheck = () => {
	const _storage = window.sessionStorage;
	const _safetyCheckKey = "-oly-safety";
	// check if sessionStorage item exists for SafetyCheck
	if (!_storage.getItem(_safetyCheckKey)) {
		_storage.setItem(_safetyCheckKey, "true");
		return true;
	}
	return false;
};

/**
 * returns unix timestamp for x minutes ago
 * @param x minutes as a number
 */
export const minutesAgo = (x: number) => {
	const now = new Date().getTime();
	return new Date(now - x * 60000).getTime();
};

/**
 * subtracts two dates for use in 33-together timer
 * param (Date) dateA is the ending date object
 * param (Date) dateB is the current date object
 * returns days, hours, minutes, seconds
 * NOTE: this func previously used parseInt() to convert to whole numbers, however, typescript doesn't like
 * ... using parseInt on number params. It only allows parseInt on string params. So we converted usage to
 * ... Math.trunc which accomplishes the same result as parseInt.
 */
export const subtractDates = (dateA: Date, dateB: Date) => {
	let msA: number = dateA.getTime();
	let msB: number = dateB.getTime();

	let diff: number = msA - msB;

	let days: number = 0;
	if (diff >= 86400000) {
		days = Math.trunc(diff / 86400000);
		diff -= days * 86400000;
	}

	let hours: number = 0;
	if (days || diff >= 3600000) {
		hours = Math.trunc(diff / 3600000);
		diff -= hours * 3600000;
	}

	let minutes: number = 0;
	if (hours || diff >= 60000) {
		minutes = Math.trunc(diff / 60000);
		diff -= minutes * 60000;
	}

	let seconds: number = 0;
	if (minutes || diff >= 1000) {
		seconds = Math.trunc(diff / 1000);
	}
	return {
		days,
		hours,
		minutes,
		seconds,
	};
};

export function getRunway(sOHM: number, rfv: number, rebase: number): number {
	if (sOHM > 0 && rfv > 0 && rebase > 0) {
		let treasury_runway = rfv / sOHM;

		let nextEpochRebase_number = rebase / 100;
		return (Math.log(treasury_runway) / Math.log(1 + nextEpochRebase_number)) / 3;
	}
	return 0;
}

export function getQueryParams(search: string): { [key: string]: boolean } {
  const param = new URLSearchParams(search.toString()?.replace("/", ""));
  let custom: { [key: string]: boolean } = {};
  param.forEach(function (value, key) {
    custom[key] = value === "true" ? true : false;
  });
  return custom;
}
