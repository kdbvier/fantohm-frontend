import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { shorten, trim, prettyVestingPeriod } from "../../helpers";
import { redeemBond } from "../../slices/BondSlice";
import BondLogo from "../../components/BondLogo";
import { Box, Button, Link, Paper, Typography, TableRow, TableCell, SvgIcon, Slide } from "@material-ui/core";
import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";
import { NavLink } from "react-router-dom";
import "./choosebond.scss";
import { Skeleton } from "@material-ui/lab";
import { useWeb3Context, useBonds } from "src/hooks";
import { isClaimable, isPendingTxn, txnButtonTextGeneralPending } from "src/slices/PendingTxnsSlice";

export function ClaimBondTableData({ userBond }) {
  const dispatch = useDispatch();
  const { address, chainId, provider } = useWeb3Context();
  const { bonds } = useBonds(chainId);

  const bond = userBond[1];
  const bondName = bond.bond;

  const isAppLoading = useSelector(state => state.app.loading ?? true);

  const currentBlock = useSelector(state => {
    return state.app.currentBlock;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const vestingPeriod = () => {
    return prettyVestingPeriod(chainId, currentBlock, bond.bondMaturationBlock);
  };

  async function onRedeem({ autostake }) {
    let currentBond = bonds.find(bnd => bnd.name === bondName);
    await dispatch(redeemBond({ address, bond: currentBond, networkId: chainId, provider, autostake }));
  }

  return (
    <TableRow id={`${bondName}--claim`}>
      <TableCell align="left" className="bond-name-cell">
        <BondLogo bond={bond} />
        <div className="bond-name">
          <Typography variant="body1">
            {bond.displayName ? trim(bond.displayName, bond.paymentToken === "FHUD" ? 2 : 4) : <Skeleton width={100} />}
          </Typography>
        </div>
      </TableCell>
      <TableCell align="center">
        {bond.pendingPayout ? trim(bond.pendingPayout, bond.paymentToken === "FHUD" ? 2 : 4) : <Skeleton width={100} />} {bond.paymentToken}
      </TableCell>
      <TableCell align="center">{bond.interestDue ? trim(bond.interestDue, bond.paymentToken === "FHUD" ? 2 : 4) : <Skeleton width={100} />} {bond.paymentToken}</TableCell>
      <TableCell align="right" style={{ whiteSpace: "nowrap" }}>
        {isAppLoading ? <Skeleton /> : vestingPeriod()}
      </TableCell>
      <TableCell align="right">
        <Button
          variant="outlined"
          color="primary"
          disabled={isPendingTxn(pendingTransactions, "redeem_bond_" + bondName) || !isClaimable(bond)}
          onClick={() => onRedeem({ autostake: false })}
        >
          <Typography variant="h6">
            {!isClaimable(bond) ? 'Vesting' : txnButtonTextGeneralPending(pendingTransactions, "redeem_bond_" + bondName, "Claim")}
          </Typography>
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function ClaimBondCardData({ userBond }) {
  const dispatch = useDispatch();
  const { address, chainId, provider } = useWeb3Context();
  const { bonds } = useBonds(chainId);

  const bond = userBond[1];
  const bondName = bond.bond;

  const currentBlock = useSelector(state => {
    return state.app.currentBlock;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const vestingPeriod = () => {
    return prettyVestingPeriod(chainId, currentBlock, bond.bondMaturationBlock);
  };

  async function onRedeem({ autostake }) {
    let currentBond = bonds.find(bnd => bnd.name === bondName);
    await dispatch(redeemBond({ address, bond: currentBond, networkId: chainId, provider, autostake }));
  }

  return (
    <Box id={`${bondName}--claim`} className="claim-bond-data-card bond-data-card" style={{ marginBottom: "30px" }}>
      <Box className="bond-pair">
        <BondLogo bond={bond} />
        <Box className="bond-name">
          <Typography>{bond.displayName ? trim(bond.displayName, 4) : <Skeleton width={100} />}</Typography>
        </Box>
      </Box>

      <div className="data-row">
        <Typography>Claimable</Typography>
        <Typography>{bond.pendingPayout ? trim(bond.pendingPayout, 4) : <Skeleton width={100} />}</Typography>
      </div>

      <div className="data-row">
        <Typography>Pending</Typography>
        <Typography>{bond.interestDue ? trim(bond.interestDue, 4) : <Skeleton width={100} />}</Typography>
      </div>

      <div className="data-row" style={{ marginBottom: "20px" }}>
        <Typography>Fully Vested</Typography>
        <Typography>{vestingPeriod()}</Typography>
      </div>
      <Box display="flex" justifyContent="space-around" alignItems="center" className="claim-bond-card-buttons">
        <Button
          variant="outlined"
          color="primary"
          disabled={isPendingTxn(pendingTransactions, "redeem_bond_" + bondName) || !isClaimable(bond)}
          onClick={() => onRedeem({ autostake: false })}
        >
          <Typography variant="h5">
            {!isClaimable(bond) ? 'Vesting' : txnButtonTextGeneralPending(pendingTransactions, "redeem_bond_" + bondName, "Claim")}
          </Typography>
        </Button>
        {/*<Button variant="outlined" color="primary" onClick={() => onRedeem({ autostake: true })}>*/}
        {/*  <Typography variant="h5">*/}
        {/*    {txnButtonTextGeneralPending(*/}
        {/*      pendingTransactions,*/}
        {/*      "redeem_bond_" + bondName + "_autostake",*/}
        {/*      "Claim and Stake",*/}
        {/*    )}*/}
        {/*  </Typography>*/}
        {/*</Button>*/}
      </Box>
    </Box>
  );
}
