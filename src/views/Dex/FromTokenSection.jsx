import {
  Box,
  Typography,
  FormControl, OutlinedInput, InputAdornment,
} from "@material-ui/core";
import { memo } from "react";
import ReactLoading from "react-loading";

import { formatCurrency } from "../../helpers";
import { formatAmount } from "../../helpers/Dex";
import { modalType } from "./data";
import "./dex.scss";

function FromTokenSection(props) {

  return (
    <Box>
      <Typography variant="body2">You pay</Typography>
      <Box display="flex" mt="5px" mb="20px" flexWrap={ { xs: "wrap", sm: "nowrap" } }
           flexDirection={ { xs: "column-reverse", sm: "row" } }>
        <Box flex={ { xs: "100%", sm: "100%" } } pr={ { sm: "5px" } }>
          <Box display="flex" alignItems="center" justifyContent="end" px="15px" className="line-border" height="78px">
            <Box flex="100%" mr="10px">
              <FormControl className="w-full" variant="standard" color="primary">
                <OutlinedInput
                  id="from-token-amount-input"
                  type="number"
                  placeholder="Enter an amount"
                  value={props?.fromTokenAmount}
                  onChange={e => props?.setFromTokenAmount(e.target.value)}
                  style={{fontSize: "20px"}}
                  endAdornment={
                    <InputAdornment position="end">
                      <Typography variant="h6" color="textPrimary">≈ {formatCurrency(props?.fromTokenAmount * (props?.fromToken?.usdPrice || 0), 2)}</Typography>
                      <Box mx="10px">
                        <Typography variant="h6" style={{color: "#F7C775"}} className="cursor-pointer" onClick={props?.setMaxFromTokenAmount}>Max</Typography>
                      </Box>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Box>
            {
              props?.fromUpdateTokenLoading ? (
                <ReactLoading type="spinningBubbles" color="#fff" width={35} height={35}/>
              ) : (
                <Box display="flex" alignItems="center" className="cursor-pointer" onClick={ () => props?.openTokenModal(modalType.from) }>
                  <Box mr="5px">
                    <Typography variant="h6" className="font-weight-bolder" align="right">{ props?.fromToken?.symbol}</Typography>
                    {
                      props?.fromToken && <Typography noWrap variant="body2" align="right">{ formatAmount(props?.fromToken?.amount, props?.fromToken?.decimals, 2, props?.fromToken?.symbol) }</Typography>
                    }
                  </Box>
                  <Box width="35px">
                    <img src={props?.fromToken?.image} alt={props?.fromToken?.symbol} className="w-full" />
                  </Box>
                </Box>
              )
            }
          </Box>
        </Box>
        <Box flex={ { xs: "100%", sm: "90px" } } className="line-border" display="flex" py="10px"
             flexDirection="column" justifyContent="center" alignItems="center" mb={{xs: "10px", sm: "0"}}
             onClick={ () => props?.opeNetworkModal(modalType.from) }>
          <Box mb="5px" width="35px">
            { props?.fromNetwork && props?.fromNetwork?.logo }
          </Box>
          <div>{ props?.fromNetwork?.name }</div>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(FromTokenSection);