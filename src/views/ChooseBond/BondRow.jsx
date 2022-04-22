import { trim } from "../../helpers";
import BondLogo from "../../components/BondLogo";
import { Box, Button, Link, Paper, Typography, TableRow, TableCell, SvgIcon, Slide } from "@material-ui/core";
import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";
import { NavLink } from "react-router-dom";
import "./choosebond.scss";
import { Skeleton } from "@material-ui/lab";
import useBonds from "src/hooks/Bonds";
import { useWeb3Context } from "../../hooks/web3Context";
import { BondType } from "src/lib/Bond";

function getBondUrl(bondType) {
  if (bondType === BondType.Bond_11) {
    return "/bonds-11";
  } else if (bondType === BondType.Bond_44) {
    return "/bonds-44";
  } else if (bondType === BondType.Bond_USDB) {
    return "/bonds-usdb";
  } else {
    return "/bonds";
  }
}

export function BondDataCard({ bond }) {
  const { connected, chainId } = useWeb3Context();
  const { loading } = useBonds(chainId);
  const isBondLoading = !bond.bondPrice ?? true;
  const ableToBond = connected && bond.isAvailable[chainId] && !bond.isCircuitBroken && bond.isPurchasable;

  return (
    <Slide direction="up" in={true}>
      <Paper id={`${bond.name}--bond`} className="bond-data-card ohm-card">
        <div className="bond-pair">
          <BondLogo bond={bond} />
          <div className="bond-name">
            <Typography>{bond.displayName}</Typography>
            {bond.isLP && (
              <div>
                <Link href={bond.lpUrl} target="_blank">
                  <Typography variant="body1">
                    View Contract
                    <SvgIcon component={ArrowUp} htmlColor="#A3A3A3" />
                  </Typography>
                </Link>
              </div>
            )}
          </div>
        </div>

        {bond.isPurchasable && <div className="data-row">
          <Typography>Price</Typography>
          <Typography className="bond-price">
            <>
              {isBondLoading ? (
                <Skeleton width="50px" />
              ) : (
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                }).format(bond.bondPrice)
              )}
            </>
          </Typography>
        </div>}

        {bond.isPurchasable && !bond.isFhud && <div className="data-row">
          <Typography>{bond.type === BondType.Bond_44 ? 'Bond ROI' : 'Discount'}</Typography>
          <Typography>{isBondLoading ? <Skeleton width="50px" /> : `${trim(bond.bondDiscount * 100, 2)}%`}</Typography>
        </div>}

        { !bond.isFhud && <div className="data-row">
          <Typography>Purchased</Typography>
          <Typography>
            {isBondLoading ? (
              <Skeleton width="80px" />
            ) : (
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              }).format(bond.purchased)
            )}
          </Typography>
        </div>}
        {ableToBond && <Link component={NavLink} to={`${getBondUrl(bond.type)}/${bond.name}`}>
          <Button variant="outlined" color="primary" fullWidth>
            <Typography variant="h5">{bond.isFhud ? `${bond.bondAction} ${bond.paymentToken}` : bond.bondAction}</Typography>
          </Button>
        </Link>}
        {!ableToBond && bond.isPurchasable && <Button variant="outlined" color="primary" fullWidth disabled={true}>
            <Typography variant="h5">{!connected ? "Connect Wallet" : "Sold Out"}</Typography>
          </Button>}
      </Paper>
    </Slide>
  );
}

export function BondTableData({ bond }) {
  const { connected, chainId } = useWeb3Context();
  // Use BondPrice as indicator of loading.
  const isBondLoading = !bond.bondPrice ?? true;
  // const isBondLoading = useSelector(state => !state.bonding[bond]?.bondPrice ?? true);
  const ableToBond = connected && bond.isAvailable[chainId] && !bond.isCircuitBroken && bond.isPurchasable;

  return (
    <TableRow id={`${bond.name}--bond`}>
      <TableCell align="left" className="bond-name-cell">
        <BondLogo bond={bond} />
        <div className="bond-name">
          <Typography variant="body1">{bond.displayName}</Typography>
          {bond.isLP && (
            <Link color="primary" href={bond.lpUrl} target="_blank">
              <Typography variant="body1">
                View Contract
                <SvgIcon component={ArrowUp} htmlColor="#A3A3A3" />
              </Typography>
            </Link>
          )}
        </div>
      </TableCell>
      <TableCell align="left">
        {bond.isPurchasable && <Typography>
          <>
            {isBondLoading ? (
              <Skeleton width="50px" />
            ) : (
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }).format(bond.bondPrice)
            )}
          </>
        </Typography>}
      </TableCell>
      <TableCell align="left">{ bond.isPurchasable && !bond.isFhud && (isBondLoading ? <Skeleton /> : `${trim(bond.bondDiscount * 100, 2)}%`)}</TableCell>
      { !bond.isFhud && <TableCell align="right">
        {isBondLoading ? (
          <Skeleton />
        ) : (
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          }).format(bond.purchased)
        )}
      </TableCell>}
      <TableCell>
        {ableToBond && <Link component={NavLink} to={`${getBondUrl(bond.type)}/${bond.name}`}>
          <Button variant="outlined" color="primary" className={bond.isFhud ? 'bond-action-fhud-btn' : ''}>
            <Typography variant="h6">{bond.isFhud ? `${bond.bondAction} ${bond.paymentToken}` : bond.bondAction}</Typography>
          </Button>
        </Link>}
        {!ableToBond && bond.isPurchasable && <Button variant="outlined" color="primary" disabled={true}>
            <Typography variant="h6">{!connected ? "Connect Wallet" : "Sold Out"}</Typography>
          </Button>}
      </TableCell>
    </TableRow>
  );
}
