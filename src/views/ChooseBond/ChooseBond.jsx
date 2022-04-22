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
import { BondDataCard, BondTableData } from "./BondRow";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { formatCurrency } from "../../helpers";
import useBonds from "../../hooks/Bonds";

import "./choosebond.scss";
import { Skeleton } from "@material-ui/lab";
import ClaimBonds from "./ClaimBonds";
import _ from "lodash";
import { useWeb3Context } from "src/hooks/web3Context";
import useTreasury from "src/hooks/Treasury";
import { BondType } from "src/lib/Bond";
import { useFlags } from "launchdarkly-react-client-sdk";

export function getBondTitle(bondType) {
  if (bondType === BondType.Bond_11) {
    return "Bond (1,1)";
  } else if (bondType === BondType.Bond_44) {
    return "Bond (4,4)";
  } else if (bondType === BondType.Bond_USDB) {
    return "USDB Bond";
  } else {
    return "Bond";
  }
}

function ChooseBond({ bondType }) {
  const { chainId } = useWeb3Context();
  const { bonds } = useBonds(chainId);
  const filteredBonds = bonds.filter(bond => bond.type === bondType);
  const isSmallScreen = useMediaQuery("(max-width: 733px)"); // change to breakpoint query
  const isVerySmallScreen = useMediaQuery("(max-width: 420px)");
  const { disableBuyUsdb, disableSellUsdb } = useFlags();
  const isAppLoading = useSelector(state => state.app.loading);
  const isAccountLoading = useSelector(state => state.account.loading);

  const accountBonds = useSelector(state => {
    const withInterestDue = [];
    for (const bond in state.account.bonds) {
      if (state.account.bonds[bond].bondType === bondType && state.account.bonds[bond].interestDue > 0) {
        withInterestDue.push(state.account.bonds[bond]);
      }
    }
    return withInterestDue;
  });

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });

  const { globalTreasuryBalance, globalBackingPerFHM, globalTrimmedCurrentRunway } = useTreasury();

  return (
    <div id="choose-bond-view">
      {!isAccountLoading && !_.isEmpty(accountBonds) && <ClaimBonds activeBonds={accountBonds} bondType={bondType} />}

      <Zoom in={true}>
        <Paper className="ohm-card">
          <Box className="card-header">
            <Typography variant="h5">{getBondTitle(bondType)}</Typography>
          </Box>

          <Grid container item xs={12} style={{ margin: "10px 0px 20px" }} className="bond-hero">
            {bondType === BondType.Bond_USDB && (
              <Grid item xs={12}>
                <a href="https://twitter.com/usdb_" target="_blank">
                  <Box className="fhud-banner" />
                </a>
              </Grid>
            )}
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
                <Table aria-label="Available bonds">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Bond</TableCell>
                      <TableCell align="left">Price</TableCell>
                      {bondType !== BondType.Bond_USDB && (
                        <TableCell align="left">{bondType === BondType.Bond_44 ? "Bond ROI" : "Discount"}</TableCell>
                      )}
                      {bondType !== BondType.Bond_USDB && <TableCell align="right">Purchased</TableCell>}
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBonds.map(bond => (
                      <>
                        {(disableSellUsdb && bond.name === "usdbSell") ||
                        (disableBuyUsdb && bond.name === "usdbBuy") ? (
                          <></>
                        ) : (
                          <BondTableData key={bond.name} bond={bond} />
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Paper>
      </Zoom>

      {isSmallScreen && (
        <Box className="ohm-card-container" style={{ width: "100%" }}>
          <Grid container item spacing={2}>
            {filteredBonds.map(bond => (
              <Grid item xs={12} key={bond.name}>
                {(disableSellUsdb && bond.name === "usdbSell") || (disableBuyUsdb && bond.name === "usdbBuy") ? (
                  <></>
                ) : (
                  <BondDataCard key={bond.name} bond={bond} />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </div>
  );
}

export default ChooseBond;
