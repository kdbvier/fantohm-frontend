import { useSelector } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Zoom,
} from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { formatCurrency } from "../../helpers";

import "./investments.scss";
import { Skeleton } from "@material-ui/lab";
import _ from "lodash";

import useInvestments from "src/hooks/Investments";
import { InvestmentDataCard, InvestmentTableData } from "../Investments/InvestmentRow";
import useTreasury from "src/hooks/Treasury";

function Investments() {
  const { investments } = useInvestments();
  const isSmallScreen = useMediaQuery("(max-width: 733px)"); // change to breakpoint query
  const isVerySmallScreen = useMediaQuery("(max-width: 420px)");

  const isAppLoading = useSelector(state => state.app.loading);

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });

  const { globalTreasuryBalance, globalBackingPerFHM, globalTrimmedCurrentRunway } = useTreasury();

  return (
    <div id="choose-investment-view">
      <Zoom in={true}>
        <Paper className="ohm-card">
          <Box className="card-header">
            <Typography variant="h5">Investments (📈,📈)</Typography>
          </Box>

          <Grid container item xs={12} style={{ margin: "10px 0px 20px" }} className="investment-hero">

            <Grid item xs={6}>
              <Box textAlign={`${isVerySmallScreen ? "left" : "center"}`}>
                <Typography variant="h5" color="textSecondary">
                  Global Treasury Balance
                </Typography>
                <Typography variant="h4">
                  {isAppLoading ? (
                    <Skeleton width="180px" />
                  ) : (
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(globalTreasuryBalance)
                  )}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} className={`ohm-price`}>
              <Box textAlign={`${isVerySmallScreen ? "right" : "center"}`}>
                <Typography variant="h5" color="textSecondary">
                  FHM Price
                </Typography>
                <Typography variant="h4">
                  {isAppLoading ? <Skeleton width="100px" /> : formatCurrency(marketPrice, 2)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box textAlign={"center"}>
                <Typography variant="h5" color="textSecondary">
                  Global Book Value per FHM
                </Typography>
                <Typography variant="h4">
                  {isAppLoading ? <Skeleton width="100px" /> : formatCurrency(globalBackingPerFHM, 2)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box textAlign={"center"}>
                <Typography variant="h5" color="textSecondary">
                  Runway
                </Typography>
                <Typography variant="h4">
                  {isAppLoading ? <Skeleton width="100px" /> : globalTrimmedCurrentRunway}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {!isSmallScreen && (
            <Grid container item>
              <TableContainer>
                <Table aria-label="Available investments">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Investment</TableCell>
                      <TableCell align="right">Balance</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Value</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {investments.filter(investment => investment.treasuryBalance > 0).map(investment => (
                      <InvestmentTableData key={investment.name} investment={investment} isLp={investment.isLpToken} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Paper>
      </Zoom>

      {isSmallScreen && (
        <Box className="ohm-card-container">
          <Grid container item spacing={2}>
            {investments.map(investment => (
              <Grid item xs={12} key={investment.name}>
                <InvestmentDataCard key={investment.name} investment={investment} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </div>
  );
}

export default Investments;
