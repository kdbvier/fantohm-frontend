import { useEffect, useState } from "react";
import { ClaimBondTableData, ClaimBondCardData } from "./ClaimRow";
import { txnButtonText, isPendingTxn, txnButtonTextGeneralPending } from "src/slices/PendingTxnsSlice";
import { redeemAllBonds, redeemBond } from "src/slices/BondSlice";
import { calculateUserBondDetails } from "src/slices/AccountSlice";
import CardHeader from "../../components/CardHeader/CardHeader";
import { useWeb3Context } from "src/hooks/web3Context";
import useBonds from "src/hooks/Bonds";
import {
  Button,
  Box,
  Paper,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Table,
  Zoom,
} from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./choosebond.scss";
import { useSelector, useDispatch } from "react-redux";
import { BondType } from "src/lib/Bond";

export function getBondTitle(bondType) {
  if (bondType === BondType.Bond_11) {
    return "Your Bonds (1,1)";
  } else if (bondType === BondType.Bond_44) {
    return "Your Bonds (4,4)";
  } else if (bondType === BondType.Bond_USDB) {
    return "Your FHUD Bonds";
  } else {
    return "Your Bonds";
  }
}

function ClaimBonds({ activeBonds, bondType }) {
  const dispatch = useDispatch();
  const { provider, address, chainId } = useWeb3Context();
  const { bonds } = useBonds(chainId);

  const [numberOfBonds, setNumberOfBonds] = useState(0);
  const isSmallScreen = useMediaQuery("(max-width: 733px)"); // change to breakpoint query

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const pendingClaim = () => {
    if (
      isPendingTxn(pendingTransactions, "redeem_all_bonds") ||
      isPendingTxn(pendingTransactions, "redeem_all_bonds_autostake")
    ) {
      return true;
    }

    return false;
  };

  const onRedeemAll = async ({ autostake }) => {
    console.log("redeeming all bonds");

    await dispatch(redeemAllBonds({ address, bonds, networkId: chainId, provider, autostake }));

    console.log("redeem all complete");
  };

  useEffect(() => {
    let bondCount = Object.keys(activeBonds).length;
    setNumberOfBonds(bondCount);
  }, [activeBonds]);

  return (
    <>
      {numberOfBonds > 0 && (
        <Zoom in={true}>
          <Paper className="ohm-card claim-bonds-card">
            <CardHeader title={getBondTitle(bondType)} />
            <Box>
              {!isSmallScreen && (
                <TableContainer>
                  <Table aria-label="Claimable bonds">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Bond</TableCell>
                        <TableCell align="center">Claimable</TableCell>
                        <TableCell align="center">Pending</TableCell>
                        <TableCell align="right">Fully Vested</TableCell>
                        <TableCell align="right"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(activeBonds).map((bond, i) => (
                        <ClaimBondTableData key={i} userBond={bond} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {isSmallScreen &&
                Object.entries(activeBonds).map((bond, i) => <ClaimBondCardData key={i} userBond={bond} />)}

              <Box
                display="flex"
                justifyContent="center"
                className={`global-claim-buttons ${isSmallScreen ? "small" : ""}`}
              >
                {numberOfBonds > 1 && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      className="transaction-button"
                      fullWidth
                      disabled={pendingClaim()}
                      onClick={() => {
                        onRedeemAll({ autostake: false });
                      }}
                    >
                      {txnButtonTextGeneralPending(pendingTransactions, "redeem_all_bonds", "Claim all")}
                    </Button>

                    {/*<Button*/}
                    {/*  variant="contained"*/}
                    {/*  color="primary"*/}
                    {/*  id="claim-all-and-stake-btn"*/}
                    {/*  className="transaction-button"*/}
                    {/*  fullWidth*/}
                    {/*  disabled={pendingClaim()}*/}
                    {/*  onClick={() => {*/}
                    {/*    onRedeemAll({ autostake: true });*/}
                    {/*  }}*/}
                    {/*>*/}
                    {/*  {txnButtonTextGeneralPending(*/}
                    {/*    pendingTransactions,*/}
                    {/*    "redeem_all_bonds_autostake",*/}
                    {/*    "Claim all and Stake",*/}
                    {/*  )}*/}
                    {/*</Button>*/}
                  </>
                )}
              </Box>
            </Box>
          </Paper>
        </Zoom>
      )}
    </>
  );
}

export default ClaimBonds;
