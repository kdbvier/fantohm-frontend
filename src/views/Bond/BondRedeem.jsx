import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Typography, Box, Slide } from "@material-ui/core";
import { redeemBond } from "../../slices/BondSlice";
import { useWeb3Context } from "src/hooks/web3Context";
import { trim, secondsUntilBlock, prettifySeconds, prettyVestingPeriod } from "../../helpers";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import { BondType } from "src/lib/Bond";

function BondRedeem({ bond }) {
  // const { bond: bondName } = bond;
  const dispatch = useDispatch();
  const { provider, address, chainId } = useWeb3Context();

  const isBondLoading = useSelector(state => state.bonding.loading ?? true);

  const currentBlock = useSelector(state => {
    return state.app.currentBlock;
  });
  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });
  const bondingState = useSelector(state => {
    return state.bonding && state.bonding[bond.name];
  });
  const bondDetails = useSelector(state => {
    return state.account.bonds && state.account.bonds[bond.name];
  });

  async function onRedeem({ autostake }) {
    await dispatch(redeemBond({ address, bond, networkId: chainId, provider, autostake }));
  }

  const vestingTime = () => {
    return prettyVestingPeriod(chainId, currentBlock, bond.bondMaturationBlock);
  };

  const vestingPeriod = () => {
    const vestingBlock = parseInt(currentBlock) + parseInt(bondingState.vestingTerm);
    const seconds = secondsUntilBlock(chainId, currentBlock, vestingBlock);
    return prettifySeconds(seconds, "day");
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-around" flexWrap="wrap">
        <Button
          variant="contained"
          color="primary"
          id="bond-claim-btn"
          className="transaction-button"
          fullWidth
          disabled={isPendingTxn(pendingTransactions, "redeem_bond_" + bond.name) || bond.pendingPayout == 0.0}
          onClick={() => {
            onRedeem({ autostake: false });
          }}
        >
          {txnButtonText(pendingTransactions, "redeem_bond_" + bond.name, (Number(bond.interestDue) > 0 && Number(bond.pendingPayout) == 0) ? "Vesting..." : "Claim")}
        </Button>
        {/*<Button*/}
        {/*  variant="contained"*/}
        {/*  color="primary"*/}
        {/*  id="bond-claim-autostake-btn"*/}
        {/*  className="transaction-button"*/}
        {/*  fullWidth*/}
        {/*  disabled={*/}
        {/*    isPendingTxn(pendingTransactions, "redeem_bond_" + bond.name + "_autostake") || bond.pendingPayout == 0.0*/}
        {/*  }*/}
        {/*  onClick={() => {*/}
        {/*    onRedeem({ autostake: true });*/}
        {/*  }}*/}
        {/*>*/}
        {/*  {txnButtonText(pendingTransactions, "redeem_bond_" + bond.name + "_autostake", "Claim and Autostake")}*/}
        {/*</Button>*/}
      </Box>

      <Slide direction="right" in={true} mountOnEnter unmountOnExit {...{ timeout: 533 }}>
        <Box className="bond-data">
          <div className="data-row">
            <Typography>Pending Rewards</Typography>
            <Typography className="price-data">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.interestDue, 4)} ${bond.paymentToken}`}
            </Typography>
          </div>
          <div className="data-row">
            <Typography>Claimable Rewards</Typography>
            <Typography className="price-data">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.pendingPayout, 4)} ${bond.paymentToken}`}
            </Typography>
          </div>
          {!bond.isFhud && <div className="data-row">
            <Typography>Time until fully vested</Typography>
            <Typography className="price-data">{isBondLoading ? <Skeleton width="100px" /> : vestingTime()}</Typography>
          </div>}

          {!bond.isFhud && <div className="data-row">
            <Typography>{bond.type === BondType.Bond_44 ? 'Bond ROI' : 'Discount'}</Typography>
            <Typography>
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.bondDiscount * 100, 2)}%`}
            </Typography>
          </div>}

          {!bond.isFhud && <div className="data-row">
            <Typography>Debt Ratio</Typography>
            <Typography>
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.debtRatio / 10000000, 2)}%`}
            </Typography>
          </div>}

          {!bond.isFhud && <div className="data-row">
            <Typography>Vesting Term</Typography>
            <Typography>{isBondLoading ? <Skeleton width="100px" /> : vestingPeriod()}</Typography>
          </div>}
        </Box>
      </Slide>
    </Box>
  );
}

export default BondRedeem;
