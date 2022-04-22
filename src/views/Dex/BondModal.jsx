import {
  Box,
  Typography,
  Modal,
  Fade,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer, Link, SvgIcon,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { memo } from "react";

import BondLogo from "../../components/BondLogo";
import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";
import { trim } from "../../helpers";
import "./dex.scss";

function BondModal(props) {

  return (
    <Modal open={props.open} onClose={() => props.onClose(null)}>
      <Fade in={props.open}>
        <Box className="bond-modal" padding="20px">
          <Box mb="20px">
            <Typography variant="h4">Select Bond</Typography>
          </Box>
          <TableContainer>
            <Table aria-label="Available bonds">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Bond</TableCell>
                  <TableCell align="left">Price</TableCell>
                  <TableCell align="left">Bond ROI</TableCell>
                  <TableCell align="right">Purchased</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {props?.bonds?.map((bond, index) => (
                  bond.isPurchasable && <TableRow className="cursor-pointer" key={`row_${index}`} id={`${bond.name}--bond`} onClick={() => props.onClose(bond)}>
                    <TableCell align="left" className="bond-name-cell cursor-pointer">
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
                          {!bond.bondPrice ? (
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
                    <TableCell align="left">{ bond.isPurchasable && !bond.isFhud && (!bond.bondPrice ? <Skeleton /> : `${trim(bond.bondDiscount * 100, 2)}%`)}</TableCell>
                    { !bond.isFhud && <TableCell align="right">
                      {!bond.bondPrice ? (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Fade>
    </Modal>
  );

}

export default memo(BondModal);