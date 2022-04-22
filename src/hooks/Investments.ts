import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import allInvestments from "src/helpers/AllInvestments";
import { Investment } from "src/lib/Investment";

interface IInvestmentStateView {
  investments: {
    loading: Boolean;
    [key: string]: any;
  };
}

// Smash all the interfaces together to get the InvestmentData Type
function useInvestments() {
  const investmentsLoading = useSelector((state: IInvestmentStateView) => !state.investments.loading);
  const investmentsState = useSelector((state: IInvestmentStateView) => state.investments);
  const [investments, setInvestments] = useState<Investment[]>(allInvestments);

  useEffect(() => {
    let investmentsDetails: Investment[];
    investmentsDetails = allInvestments
      .flatMap(investment => {
        if (investmentsState[investment.name]) {
          return Object.assign(investment, investmentsState[investment.name]); // Keeps the object type
        }
        return investment;
      });

    const largestHoldings = investmentsDetails.concat().sort((a, b) => a["treasuryBalance"] > b["treasuryBalance"] ? -1 : b["treasuryBalance"] > a["treasuryBalance"] ? 1 : 0);

    setInvestments(largestHoldings);
  }, [investmentsState, investmentsLoading]);

  // Debug Log:
  // console.log(investments);
  return { investments, loading: investmentsLoading };
}

export default useInvestments;