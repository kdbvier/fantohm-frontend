import { Paper, Typography, TableRow, TableCell, Slide } from "@material-ui/core";
import "./investments.scss";
import { Skeleton } from "@material-ui/lab";
import InvestmentLogo from "src/components/InvestmentLogo";
import { trim } from "src/helpers";

export function InvestmentDataCard({ investment }) {
  const isInvestmentLoading = !investment.treasuryBalance ?? true;
  return (
    <Slide direction="up" in={true}>
      <Paper id={`${investment.name}--investment`} className="investment-data-card ohm-card">
        <div className="investment-pair">
          <InvestmentLogo investment={investment} isLp={investment.isLpToken} />
          <div className="investment-name">
            <Typography>{investment.displayName}</Typography>
          </div>
        </div>

        <div className="data-row">
          <Typography>Balance</Typography>
          <Typography>
            {typeof investment.assetBalance != 'number' ? (
              <Skeleton width="80px" />
            ) : (
              investment.isLP ? '' : trim(investment.assetBalance, 2)
            )}
          </Typography>
        </div>

        <div className="data-row">
          <Typography>Price</Typography>
          <Typography>
            {typeof investment.assetPrice != 'number' ? (
              <Skeleton width="80px" />
            ) : (
              investment.isLP ? '' : new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }).format(investment.assetPrice)
            )}
          </Typography>
        </div>

        <div className="data-row">
          <Typography>Value</Typography>
          <Typography>
            {typeof investment.treasuryBalance != 'number' ? (
              <Skeleton width="80px" />
            ) : (
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              }).format(investment.treasuryBalance)
            )}
          </Typography>
        </div>
      </Paper>
    </Slide>
  );
}

export function InvestmentTableData({ investment }) {
  const isInvestmentLoading = !investment.treasuryBalance ?? true;
  return (
    <TableRow id={`${investment.name}--investment`}>
      <TableCell align="left" className="investment-name-cell">
        <InvestmentLogo investment={investment} isLp={investment.isLpToken}/>
        <div className="investment-name">
          <Typography variant="body1">{investment.displayName}</Typography>
        </div>
      </TableCell>
      <TableCell align="right">
        {typeof investment.assetBalance != 'number' ? (
          <Skeleton />
        ) : (
          investment.isLp ? '' : trim(investment.assetBalance, 2)
        )}
      </TableCell>
      <TableCell align="right">
        {typeof investment.assetPrice != 'number' ? (
          <Skeleton />
        ) : (
          investment.isLp ? '' : new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }).format(investment.assetPrice)
        )}
      </TableCell>
      <TableCell align="right">
        {typeof investment.treasuryBalance != 'number' ? (
          <Skeleton />
        ) : (
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          }).format(investment.treasuryBalance)
        )}
      </TableCell>
    </TableRow>
  );
}
