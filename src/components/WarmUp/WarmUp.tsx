import { Button, Tooltip, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { trim } from "src/helpers";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import "./warm-up.scss";
import RebaseTimer from "../RebaseTimer/RebaseTimer";

const useStyles = makeStyles(theme =>
  createStyles({
    customWidth: {
      maxWidth: 250,
      fontSize: theme.typography.pxToRem(14),
      backgroundColor: theme.palette.common.black,
    },
  }),
);

interface Props {
  depositAmount: number;
  trimmedWarmUpAmount: number;
  warmupRebaseTime: number;
  pendingTransactions: any;
  onClaim: () => void;
  onForfeit: () => void;
}
export default function WarmUp({
  depositAmount,
  trimmedWarmUpAmount,
  warmupRebaseTime,
  pendingTransactions,
  onClaim,
  onForfeit,
}: Props) {
  const classes = useStyles();

  return (
    <div className={"warm-up MuiPaper-root ohm-card "}>
      <>
        <div className="card-header header">
          <div className="title">
            <Typography variant="h5">Warm Up Details</Typography>
            <RebaseTimer />
          </div>

          <Tooltip
            arrow
            title="Choosing to forfeit will return your original FHM amount without any of the accumulated rewards."
            classes={{ tooltip: classes.customWidth }}
          >
            <HelpOutlineIcon />
          </Tooltip>
        </div>
        <div className={"details "}>
          <div className={"initial-amount"}>
            <div className="MuiTypography-body1">Initial Warmup</div>
            <div className="MuiTypography-body1">{trim(depositAmount, 4)}</div>
          </div>
          <div className={"rewards-gained"}>
            <div className="MuiTypography-body1">Pending Rewards</div>
            <div className="MuiTypography-body1">
              {trimmedWarmUpAmount ? trim(trimmedWarmUpAmount - depositAmount, 4) : 0}
            </div>
          </div>
          <div className={"remaining-rebases"}>
            <div className="MuiTypography-body1">Status of Warmup</div>
            <div className="MuiTypography-body1">
              {warmupRebaseTime <= 0 ? "Finished" : (
                isNaN(warmupRebaseTime) ? <Skeleton width="50px" /> : <div>Waiting</div>
              )}
            </div>
          </div>
          <div className={"claim-forfeit"}>
            {warmupRebaseTime >= 1 ? (
              <>
                <Button
                  className="exit-button claim-disable"
                  variant="outlined"
                  color="primary"
                  disabled={true}
                  onClick={onClaim}
                >
                  {txnButtonText(pendingTransactions, "claiming", "Claim")}
                </Button>
                <Button
                  className="exit-button"
                  variant="outlined"
                  color="primary"
                  disabled={isPendingTxn(pendingTransactions, "forfeiting")}
                  onClick={onForfeit}
                >
                  {txnButtonText(pendingTransactions, "forfeiting", "Forfeit")}
                </Button>
              </>
            ) : (
              (trimmedWarmUpAmount - depositAmount) > 0 && !isNaN(warmupRebaseTime) ? (
                <Button
                  className="stake-button"
                  variant="outlined"
                  color="primary"
                  disabled={isPendingTxn(pendingTransactions, "claiming")}
                  onClick={() => {
                    onClaim();
                  }}
                >
                  {txnButtonText(pendingTransactions, "claiming", "Claim")}
                </Button>
              ) : <></>
            )}
          </div>
        </div>
      </>
    </div>
  );
}
