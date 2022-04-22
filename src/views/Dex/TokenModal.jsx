import { Modal, Box, Typography, OutlinedInput, Fade, FormControl, InputLabel } from "@material-ui/core";
import { useState, memo } from "react";
import InfiniteScroll from "react-infinite-scroller";
import ReactLoading from "react-loading";

import { formatAmount } from "../../helpers/Dex";
import "./dex.scss";

function TokenModal(props) {
  const [tokenName, setTokenName] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [showedIndex, setShowedIndex] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMoreData = () => {
    if (showedIndex>=props?.tokenCount) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setShowedIndex(showedIndex + 20);
    }, 1000);
  };

  return (
    <Modal open={ props?.open } onClose={ () => props?.onClose(props?.type, null) }>
      <Fade in={ props?.open }>
        <Box className="token-modal">
          <Box p="10px">
            <FormControl className="line-border w-full" variant="standard"
                         color="primary">
              <OutlinedInput
                placeholder={ `Search in ${ props?.tokenCount } token` }
                value={ tokenName }
                onChange={ e => {
                  setTokenName(e.target.value);
                  props?.onChange(e.target.value, props?.type);
                } }
                style={ { fontSize: "20px" } }
                notchedOutline={ false }
              />
            </FormControl>
          </Box>
          <Box px="10px" my="10px">
            <Typography variant="h6">Assets</Typography>
          </Box>
          <Box px="10px" height="300px" overflow="auto">
            {
              <InfiniteScroll
                dataLength={ props?.tokenList.length }
                loadMore={ fetchMoreData }
                loader={ <Box display="flex" justifyContent="center" key={0}><ReactLoading type="spin" color="white" height={ 30 } width="35px" delay={ 100 } /></Box> }
                hasMore={ hasMore }
                useWindow={ false }
              >
                {
                  props?.tokenList.slice(0, showedIndex).map((token, index) => {
                    return (
                      <Box display="flex" className="cursor-pointer" justifyContent="space-between" alignItems="center" mb="10px"
                           key={ `token_${ index }_${ token?.symbol }` }
                           onClick={ () => props?.onClose(props?.type, token) }>
                        <Box display="flex">
                          <img style={ { width: "35px", height: "35px" } } src={ token?.image } alt={ token?.symbol } />
                          <Box display="flex" flexDirection="column" ml="5px" justifyContent="center">
                            <Typography variant="h6">{ token?.symbol } ({ token?.blockchain })</Typography>
                            <Typography style={ { fontSize: "10px" } }>{ token?.name }</Typography>
                          </Box>
                        </Box>
                        <Box display="flex" flexDirection="column" justifyContent="center">
                          <Typography variant="h6"
                                      align="right">{ formatAmount(token.amount, token.decimals, 2, token.symbol) }</Typography>
                          {
                            token?.amount>0 && (
                              <Typography style={ { fontSize: "10px" } }
                                          align="right">{ Number(formatAmount(token.amount, token.decimals, 2, token.symbol) * token.usdPrice).toFixed(2) }$</Typography>
                            )
                          }
                        </Box>
                      </Box>
                    );
                  })
                }
              </InfiniteScroll>
            }
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

export default memo(TokenModal);