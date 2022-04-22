import { useSelector } from "react-redux";
import { useMemo } from "react";
import { allInvestmentsMap } from "src/helpers/AllInvestments";
import { getRunway, trim } from "src/helpers";

interface ITreasuryStateView {
  investments: {
    loading: Boolean;
    [key: string]: any;
  };
  globalbonding: {
    loading: Boolean;
    globalTreasuryBalance: number;
    globalTreasuryBondRFV: number;
    [key: string]: any;
  };
  app: {
    globalCircSupply: number;
    globalStakingCircSupply: number;
    globalStakingRebase: number;
  }
}

function useTreasury() {

  const globalTreasuryBondBalance = useSelector((state: ITreasuryStateView) => {
    if (state.globalbonding.loading == false) {
      return state.globalbonding.globalTreasuryBalance;
    }
  });

  const globalTreasuryInvestmentsBalance = useSelector((state: ITreasuryStateView) => {
    if (state.investments.loading == false) {
      let tokenBalances = 0;
      for (const investment in allInvestmentsMap) {
        if (state.investments[investment]) {
          tokenBalances += state.investments[investment].treasuryBalance;
        }
      }
      return tokenBalances;
    }
  });

  const globalTreasuryBalance = useMemo(() => {
    return (globalTreasuryBondBalance || 0) + (globalTreasuryInvestmentsBalance || 0);
  }, [globalTreasuryBondBalance, globalTreasuryInvestmentsBalance]);

  const globalTreasuryBondRFV = useSelector((state: ITreasuryStateView) => {
    if (state.globalbonding.loading == false) {
      return state.globalbonding.globalTreasuryBondRFV;
    }
  });

  const globalTreasuryRFV = useMemo(() => {
    return (globalTreasuryBondRFV || 0) + (globalTreasuryInvestmentsBalance || 0);
  }, [globalTreasuryBondRFV, globalTreasuryInvestmentsBalance]);

  const globalCircSupply = useSelector((state: ITreasuryStateView) => {
    return state.app.globalCircSupply;
  });

  const globalStakingCircSupply = useSelector((state: ITreasuryStateView) => {
    return state.app.globalStakingCircSupply;
  });

  const globalStakingRebase = useSelector((state: ITreasuryStateView) => {
    return state.app.globalStakingRebase;
  });

  const globalBackingPerFHM = globalCircSupply != null ? (globalTreasuryBalance / globalCircSupply) : null;

  const globalCurrentRunway = globalTreasuryRFV ? getRunway(globalStakingCircSupply, globalTreasuryRFV, globalStakingRebase * 100) : 0;
  const globalTrimmedCurrentRunway = trim(globalCurrentRunway) + " days";

  return { globalTreasuryBalance, globalBackingPerFHM, globalTrimmedCurrentRunway };
}

export default useTreasury;
