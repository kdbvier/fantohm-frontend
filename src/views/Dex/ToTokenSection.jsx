import {
  Box,
  Typography,
  FormControl, OutlinedInput, InputAdornment,
} from "@material-ui/core";
import { memo } from "react";
import ReactLoading from "react-loading";

import { formatCurrency } from "../../helpers";
import { formatAmount, getDownRate } from "../../helpers/Dex";
import { modalType } from "./data";
import "./dex.scss";

function ToTokenSection(props) {

  return (
    <Box>
      <Typography variant="body2">You receive</Typography>
      <Box display="flex" mt="5px" flexWrap={ { xs: "wrap", sm: "nowrap" } }
           flexDirection={ { xs: "column-reverse", sm: "row" } }>
        <Box flex={ { xs: "100%", sm: "100%" } } pr={ { sm: "5px" } }>
          <Box display="flex" alignItems="center" px="15px" className="line-border" height="78px">
            <Box flex="100%" mr="10px">
              <FormControl className="w-full" variant="standard" color="primary">
                <OutlinedInput
                  id="from-token-amount-input"
                  type="number"
                  placeholder="Enter an amount"
                  value={ props?.toTokenAmount }
                  labelWidth={ 0 }
                  style={ { fontSize: "20px" } }
                  notchedOutline={ false }
                  endAdornment={
                    <InputAdornment position="end">
                      <Typography variant="h6"
                                  color="textPrimary">≈ { formatCurrency(props?.toTokenAmount * (props?.toToken?.usdPrice || 0), 2) }</Typography>
                      <Box ml="5px">
                        {
                          getDownRate(props?.fromToken, props?.toToken, props?.fromTokenAmount, props?.toTokenAmount) &&
                          <Typography variant="body2"
                                      style={{color: "#F7C775"}}>({ getDownRate(props?.fromToken, props?.toToken, props?.fromTokenAmount, props?.toTokenAmount).toFixed(2) }%)</Typography>
                        }
                      </Box>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Box>
            {
              props?.toUpdateTokenLoading ? (
                <ReactLoading type="spinningBubbles" color="#fff" width={ 35 } height={ 35 } />
              ) : (
                <Box display="flex" alignItems="center" className="cursor-pointer"
                     onClick={ () => props?.openTokenModal(modalType.to) }>
                  <Box mr="10px">
                    <Typography variant="h6" className="font-weight-bolder"
                                align="right">{ props?.toToken?.symbol }</Typography>
                    {
                      props?.toToken && <Typography noWrap variant="body2"
                                                    align="right">{ formatAmount(props?.toToken?.amount, props?.toToken?.decimals, 2, props?.fromToken?.symbol) }</Typography>
                    }
                  </Box>
                  <Box width="35px">
                    <img src={ props?.toToken?.image } alt={ props?.toToken?.symbol } className="w-full" />
                  </Box>
                </Box>
              )
            }
          </Box>
        </Box>
        <Box flex={ { xs: "100%", sm: "90px" } } className="line-border" display="flex" py="10px"
             flexDirection="column" justifyContent="center" alignItems="center" mb={ { xs: "10px", sm: "0" } }
             onClick={ () => props?.opeNetworkModal(modalType.to) }>
          <Box mb="5px" width="35px">
            { props?.toNetwork && props?.toNetwork?.logo }
          </Box>
          <div>{ props?.toNetwork?.name }</div>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(ToTokenSection);