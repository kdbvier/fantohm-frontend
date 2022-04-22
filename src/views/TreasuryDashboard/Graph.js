import Chart from "src/components/Chart/Chart.jsx";
import { useTheme } from "@material-ui/core/styles";
import { useTreasuryMetrics } from "./useTreasuryMetrics";
import { bulletpoints, tooltipItems, tooltipInfoMessages, itemType } from "./treasuryData";
import { getInvestmentMarketValueKey, getMarketValueKey, getRiskFreeValueKey, investmentTokens, marketValueTokens, stableGraphTokens } from "src/graphs";
import { useQuery } from "react-query";
import store from "../../store";
import { fetchTokenPrice } from "src/slices/TokenPriceSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { roundToNearestHour } from "src/helpers";


const formatCurrency = c => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(c);
};

function trim(number = 0, precision = 0) {
  // why would number ever be undefined??? what are we trimming?
  const array = number.toString().split(".");
  if (array.length === 1) return number.toString();
  if (precision === 0) return array[0].toString();

  const poppedNumber = array.pop() || "0";
  array.push(poppedNumber.substring(0, precision));
  const trimmedNumber = array.join(".");
  return trimmedNumber;
}

export const Graph = ({ children }) => <>{children}</>;

export const TotalValueDepositedGraph = () => {
  const theme = useTheme();
  const { data } = useTreasuryMetrics();
  const [active, setActive] = useState();

  return (
    <Chart
      type="area"
      data={data}
      itemType={itemType.dollar}
      itemNames={tooltipItems.tvl}
      dataKey={["totalValueLocked"]}
      headerText="Total Value Deposited"
      stroke={["#f7c775"]}
      strokeWidth={2}
      stopColor={[["rgba(247, 199, 117, 0.7)", "rgba(247, 199, 117, 0.05)"],]}
      bulletpointColors={bulletpoints.tvl}
      infoTooltipMessage={tooltipInfoMessages.tvl}
      expandedGraphStrokeColor={theme.palette.graphStrokeColor}
      headerSubText={active && formatCurrency(active.totalValueLocked)}
      axisHidden={true}
      setActive={setActive}
    />
  );
};

export const MarketValueGraph = () => {
  const theme = useTheme();
  const { data } = useTreasuryMetrics();
  const [active, setActive] = useState();

  return (
    <Chart
      type="stack"
      data={data}
      strokeWidth={2}
      dataKey={marketValueTokens.map(getMarketValueKey)}
      stroke={[
         "#f7c775",
         "#111111",
         "#cca551",
         "#c9c9c9",
         "#5b503d",
      ]}
      stopColor={marketValueTokens.map(token => token.stopColor)}
      headerText="Market Value of Treasury Assets"
      headerSubText={`${active && formatCurrency(active.treasuryMarketValue)}`}
      bulletpointColors={marketValueTokens.map(token => token.bulletPointColor)}
      itemNames={marketValueTokens.map(token => token.displayName)}
      itemType={itemType.dollar}
      infoTooltipMessage={tooltipInfoMessages.mvt}
      expandedGraphStrokeColor={theme.palette.graphStrokeColor}
      axisHidden={true}
      setActive={setActive}
    />
  );
};

export const RiskFreeValueGraph = () => {
  const theme = useTheme();
  const { data } = useTreasuryMetrics();
  const [active, setActive] = useState();

  return (
    <Chart
      type="stack"
      data={data}
      format="currency"
      dataKey={stableGraphTokens.map(getRiskFreeValueKey)}
      strokeWidth={2}
      stroke={[
          "#f7c775",
          "#cca551",
          "#111111",
          "#c9c9c9",
          "#5b503d",
      ]}
      stopColor={stableGraphTokens.map(token => token.stopColor)}
      headerText="Risk Free Value of Treasury Assets"
      headerSubText={`${active && formatCurrency(active.treasuryRiskFreeValue)}`}
      bulletpointColors={stableGraphTokens.map(token => token.bulletPointColor)}
      itemNames={stableGraphTokens.map(token => token.displayName)}
      itemType={itemType.dollar}
      infoTooltipMessage={tooltipInfoMessages.rfv}
      expandedGraphStrokeColor={theme.palette.graphStrokeColor}
      axisHidden={true}
      setActive={setActive}
    />
  );
};

export const ProtocolOwnedLiquidityGraph = () => {
  const theme = useTheme();
  const { data } = useTreasuryMetrics();
  const [active, setActive] = useState();

  return (
    <Chart
      isPOL
      type="area"
      data={data}
      dataFormat="percent"
      itemNames={tooltipItems.pol}
      itemType={itemType.percentage}
      dataKey={["treasuryFHMDAIPOL"]}
      bulletpointColors={bulletpoints.pol}
      infoTooltipMessage={tooltipInfoMessages.pol}
      headerText="Protocol Owned Liquidity FHM-DAI"
      headerSubText={`${active && trim(active.treasuryFHMDAIPOL, 2)}% `}
      strokeWidth={2}
      stroke={["#f7c775"]}
      stopColor={[
          ["rgba(247, 199, 117, 0.7)", "rgba(247, 199, 117, 0.05)"],
          ["rgba(201, 201, 201, 0.7)", "rgba(201, 201, 201, 0.05)"],
      ]}
      axisHidden={true}
      setActive={setActive}
    />
  );
};

export const FHMStakedGraph = () => {
  const theme = useTheme();
  const { data } = useTreasuryMetrics();
  const [active, setActive] = useState();

  return (
    <Chart
      isStaked
      type="area"
      data={data}
      dataKey={["staked"]}
      dataFormat="percent"
      headerText="FHM Staked"
      strokeWidth={2}
      stroke={["#f7c775"]}
      stopColor={[
          ["rgba(247, 199, 117, 0.7)", "rgba(247, 199, 117, 0.05)"],
          ["rgba(201, 201, 201, 0.7)", "rgba(201, 201, 201, 0.05)"],
      ]}
      bulletpointColors={bulletpoints.staked}
      infoTooltipMessage={tooltipInfoMessages.staked}
      expandedGraphStrokeColor={theme.palette.graphStrokeColor}
      headerSubText={`${active && trim(active.staked, 2)}% `}
      axisHidden={true}
      setActive={setActive}
    />
  );
};

export const RunwayAvailableGraph = () => {
  const theme = useTheme();
  const { data } = useTreasuryMetrics();
  const [active, setActive] = useState();

  const [current, ...others] = bulletpoints.runway;
  const runwayBulletpoints = [{ ...current, background: theme.palette.text.primary }, ...others];

  return (
    <Chart
      type="multi"
      data={data}
      dataKey={['runwayCurrent']}
      color={theme.palette.text.primary}
      strokeWidth={2}
      stroke={["#f7c775"]}
      stopColor={[
          ["rgba(247, 199, 117, 0.7)", "rgba(247, 199, 117, 0.05)"],
          ["rgba(201, 201, 201, 0.7)", "rgba(201, 201, 201, 0.05)"],
      ]}
      headerText="Global Runway Available"
      headerSubText={`${active && trim(active.runwayCurrent, 1)} Days`}
      dataFormat="days"
      bulletpointColors={runwayBulletpoints}
      itemNames={['Days']}
      itemType={""}
      infoTooltipMessage={tooltipInfoMessages.runway}
      expandedGraphStrokeColor={theme.palette.graphStrokeColor}
      axisHidden={true}
      setActive={setActive}
    />
  );
};

export const InvestmentMarketValueGraph = () => {
  const theme = useTheme();
  const { data } = useTreasuryMetrics();
  const [active, setActive] = useState();

  return (
    <Chart
      type="stack"
      data={data}
      strokeWidth={2}
      dataKey={investmentTokens.map(getInvestmentMarketValueKey)}
      stroke={[
         "#f7c775",
         "#111111",
         "#cca551",
         "#c9c9c9",
         "#5b503d",
         "#5b503d",
         "#5b503d",
         "#5b503d",
         "#5b503d",
      ]}
      stopColor={investmentTokens.map(token => token.stopColor)}
      headerText="Market Value of Investments"
      headerSubText={`${active && formatCurrency(active.totalInvestmentValue)}`}
      bulletpointColors={investmentTokens.map(token => token.bulletPointColor)}
      itemNames={investmentTokens.map(token => token.displayName)}
      itemType={itemType.dollar}
      infoTooltipMessage={tooltipInfoMessages.mvi}
      expandedGraphStrokeColor={theme.palette.graphStrokeColor}
      axisHidden={true}
      setActive={setActive}
    />
  );
};