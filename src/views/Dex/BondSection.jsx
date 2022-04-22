import {
  Box,
  Typography,
  FormControl, InputLabel, SvgIcon, OutlinedInput, InputAdornment, Button,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ReactComponent as ArrowDown } from "../../assets/icons/arrow-down.svg";
import BondLogo from "../../components/BondLogo";
import { bondAsset, calcBondDetails, changeApproval } from "../../slices/BondSlice";
import { isPendingTxn, txnButtonText } from "../../slices/PendingTxnsSlice";
import { error } from "../../slices/MessagesSlice";
import { BondType } from "../../lib/Bond";
import { prettifySeconds, secondsUntilBlock, trim } from "../../helpers";
import { useWeb3Context } from "../../hooks";
import "./dex.scss";
import useDebounce from "../../hooks/Debounce";

function BondSection(props) {

  const dispatch = useDispatch();

  const { chainId, address, provider } = useWeb3Context();
  const [quantity, setQuantity] = useState("");
  const [slippage, setSlippage] = useState(0.5);

  const hasAllowance = useCallback(() => {
    return props?.bond?.allowance>0;
  }, [props?.bond?.allowance]);

  const pendingTransactions = useSelector(state => {
    return state?.pendingTransactions;
  });

  const currentBlock = useSelector(state => {
    return state?.app?.currentBlock;
  });

  const isBondLoading = useSelector(state => state?.bonding.loading ?? true);

  const vestingPeriod = () => {
    const vestingBlock = parseInt(currentBlock) + parseInt(props?.bond?.vestingTerm);
    const seconds = secondsUntilBlock(chainId, currentBlock, vestingBlock);

    if (seconds>86400) return prettifySeconds(seconds, "day");
    return prettifySeconds(seconds);
  };

  const onBond = async () => {
    if (quantity === "") {
      dispatch(error("Please enter a value!"));
    } else if (isNaN(quantity)) {
      dispatch(error("Please enter a valid value!"));
    } else if (props?.bond.interestDue>0 || props?.bond.pendingPayout>0) {
      const shouldProceed = window.confirm(
        "You have an existing props?.bond. Bonding will reset your vesting period and forfeit rewards. We recommend claiming rewards first or using a fresh wallet. Do you still want to proceed?",
      );
      if (shouldProceed) {
        await dispatch(
          bondAsset({
            value: quantity,
            slippage,
            bond: props?.bond,
            networkId: chainId,
            provider,
            address,
          }),
        );
      }
    } else {
      await dispatch(
        bondAsset({
          value: quantity,
          slippage,
          bond: props?.bond,
          networkId: chainId,
          provider,
          address,
        }),
      );
      clearInput();
    }
  };

  const onSeekApproval = async () => {
    dispatch(changeApproval({ address, bond: props?.bond, provider, networkId: chainId }));
  };

  const setMax = () => {
    let maxQ;
    if (props?.bond.maxBondPrice * props?.bond.props?.bondPrice < Number(props?.bond.balance)) {
      // there is precision loss here on Number(props?.bond.balance)
      maxQ = props?.bond.maxBondPrice * props?.bond.props?.bondPrice.toString();
    } else {
      maxQ = props?.bond.balance;
    }
    setQuantity(maxQ);
  };

  const clearInput = () => {
    setQuantity(0);
  };

  const bondDetailsDebounce = useDebounce(quantity, 1000);

  useEffect(() => {
    props?.bond && dispatch(calcBondDetails({ bond: props?.bond, value: quantity, networkId: chainId }));
  }, [bondDetailsDebounce, props?.forceBondLoading]);

  return (
    <Box>
      <Box>
        <Typography variant="body2">Select Bond Assets</Typography>
        <Box display="flex" alignItems="center" justifyContent="space-between" mt="5px"
             px="15px" className="line-border cursor-pointer" height="55px" onClick={ () => props.openBondModal() }>
          <Box display="flex" alignItems="center">
            <BondLogo bond={ props?.bond } />
            <Typography variant="h6" className="font-weight-bolder"
                        align="right">{ props?.bond?.displayName }</Typography>
          </Box>
          <Box mt="12px">
            <SvgIcon component={ ArrowDown } />
          </Box>
        </Box>
      </Box>
      <Box mt="30px">
        { !hasAllowance() ? (
          <div className="help-text">
            <em>
              <Typography variant="body1" align="center" color="textSecondary">
                First time bonding <b>{ props?.bond?.displayName }</b>? <br /> Please approve Fantohm to use your{ " " }
                <b>{ props?.bond?.displayName }</b> for bonding.
              </Typography>
            </em>
          </div>
        ) : (
          <FormControl variant="outlined" color="primary" fullWidth>
            <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
            <OutlinedInput
              id="outlined-adornment-amount"
              type="number"
              value={ quantity }
              onChange={ e => setQuantity(e.target.value) }
              labelWidth={ 55 }
              endAdornment={
                <InputAdornment position="end">
                  <Button variant="text" onClick={ setMax }>
                    Max
                  </Button>
                </InputAdornment>
              }
            />
          </FormControl>
        ) }

        <Box mt="10px">
          {hasAllowance() ? (
            <Button
              variant="contained"
              color="primary"
              id="bond-btn"
              className="w-full"
              disabled={ isPendingTxn(pendingTransactions, "bond_" + props?.bond?.name) }
              onClick={ onBond }
            >
              { txnButtonText(pendingTransactions, "bond_" + props?.bond?.name, props?.bond?.isFhud ? `${ props?.bond?.bondAction } ${ props?.bond?.paymentToken }` : props?.bond?.bondAction) }
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              id="bond-approve-btn"
              className="w-full"
              disabled={ isPendingTxn(pendingTransactions, "approve_" + props?.bond?.name) }
              onClick={ onSeekApproval }
            >
              { txnButtonText(pendingTransactions, "approve_" + props?.bond?.name, "Approve") }
            </Button>
          )}
        </Box>
      </Box>
      <Box className="bond-data" mt="30px">
        <div className="data-row">
          <Typography>Your Balance</Typography>
          <Typography>
            { isBondLoading ? (
              <Skeleton width="100px" />
            ) : (
              <>
                { trim(props?.bond?.balance, props?.bond?.displayUnits === "LP" ? 18 : 4) } { props?.bond?.displayUnits }
              </>
            ) }
          </Typography>
        </div>

        <div className={ `data-row` }>
          <Typography>You Will Get</Typography>
          <Typography id="bond-value-id" className="price-data">
            { isBondLoading ? <Skeleton
              width="100px" /> : `${ trim(props?.bond?.bondQuote, props?.bond?.paymentToken === "USDB" ? 2 : 4) || "0" } ${ props?.bond?.paymentToken }` }
          </Typography>
        </div>

        <div className={ `data-row` }>
          <Typography>Max You Can Buy</Typography>
          <Typography id="bond-value-id" className="price-data">
            { isBondLoading ? <Skeleton
              width="100px" /> : `${ trim(props?.bond?.maxBondPrice, 4) || "0" } ${ props?.bond?.paymentToken }` }
          </Typography>
        </div>

        { !props?.bond?.isFhud && <div className="data-row">
          <Typography>{ props?.bond?.type === BondType.Bond_44 ? "Bond ROI" : "Discount" }</Typography>
          <Typography>
            { isBondLoading ? <Skeleton width="100px" /> : `${ trim(props?.bond?.bondDiscount * 100, 2) }%` }
          </Typography>
        </div> }

        { !props?.bond?.isFhud && <div className="data-row">
          <Typography>Debt Ratio</Typography>
          <Typography>
            { isBondLoading ? <Skeleton width="100px" /> : `${ trim(props?.bond?.debtRatio / 10000000, 2) }%` }
          </Typography>
        </div> }

        { !props?.bond?.isFhud && <div className="data-row">
          <Typography>Vesting Term</Typography>
          <Typography>{ isBondLoading ? <Skeleton width="100px" /> : vestingPeriod() }</Typography>
        </div> }
      </Box>
    </Box>
  );

}

export default memo(BondSection);