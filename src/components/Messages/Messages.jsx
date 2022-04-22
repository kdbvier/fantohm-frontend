import { LinearProgress, Snackbar, makeStyles, Box, Typography, SvgIcon } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactLoading from "react-loading";

import "./ConsoleInterceptor.js";
import { close, closeAll, handle_obsolete } from "../../slices/MessagesSlice";
import store from "../../store";
import { isDexPage } from "../../helpers/Dex";
import { trim } from "../../helpers";

const useStyles = makeStyles({
  root: {
    width: "100%",
    marginTop: "10px",
  },
});

function Linear({ message }) {
  const [progress, setProgress] = useState(100);
  const classes = useStyles();
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress === 0) {
          clearInterval(timer);
          dispatch(close(message));
          return 0;
        }
        const diff = oldProgress - 5;
        return diff;
      });
    }, 333);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={ classes.root }>
      <LinearProgress variant="determinate" value={ progress } />
    </div>
  );
}

// A component that displays error messages
function Messages() {
  const messages = useSelector(state => state?.messages);
  const dispatch = useDispatch();
  // Returns a function that can closes a message
  const handleClose = function(message) {
    return function() {
      dispatch(close(message));
    };
  };
  return (
    <div>
      <div>
        { messages.items.map((message, index) => {
          return (
            message.detail?.type == "swap" ? (
              <Snackbar open={ message.open } key={ index } anchorOrigin={ { vertical: "top", horizontal: "center" } }>
                <Alert
                  variant="filled"
                  icon={ false }
                  severity={ message.severity }
                  onClose={ handleClose(message) }
                  style={ { wordBreak: "break-word" } }
                >
                  <Box mb="10px">
                    <Typography variant="h5">{message.detail?.title}</Typography>
                  </Box>
                  <Box minWidth="360px" display="flex" flexDirection="column" >
                    {
                      message.detail?.details.length > 0 && message.detail?.details.map((detail, index) => {
                        return (
                          <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={index < message.detail?.details.length - 1 ? "10px" : "0" }>
                              <Box display="flex" alignItems="center" mr="20px">
                                <Box display="flex" alignItems="center" width="30px" mr="5px">
                                  <img style={ { width: "100%" } } src={ detail.swap?.logo }
                                       alt={ detail.swap?.swapperId } />
                                </Box>
                                <Box>
                                  <Typography variant="h6">{ detail.swap?.swapperId }</Typography>
                                  {
                                    detail?.txStatus?.status !== "success" && detail?.text && <Typography variant="body2">{detail?.text}</Typography>
                                  }
                                </Box>
                              </Box>
                              <Box>
                                {
                                  detail?.txStatus?.status === "success" && (<Box mr="5px"><Typography variant="h6" style={{fontStyle: "italic"}}>{trim(detail?.txStatus?.outputAmount, 2)} {index < message.detail?.details.length -1 ? detail.swap?.from?.symbol : detail.swap?.to?.symbol}</Typography></Box>)
                                }
                                {
                                  detail?.txStatus?.status !== "success" && (message.detail?.step === detail?.step ?
                                    (<Box ml="5px"><ReactLoading type="spinningBubbles" color="#fff" width={ 25 } height={ 25 } /></Box>) : (<Typography variant="h6" style={{fontStyle: "italic"}}>Pending</Typography>))
                                }
                              </Box>
                            </Box>
                            {
                              detail?.txStatus?.explorerUrl?.length > 0 && <Box className="link" my="10px" display="flex" alignItems="center" justifyContent="center">
                                {
                                  detail?.txStatus?.explorerUrl.map((item, index) => (<Box mr="10px" key={`link_${index}`}><a style={{fontSize: "15px"}} href={item.url} target="_blank">{item.description ? `${item.description} tx` : "View Transaction"}</a></Box>))
                                }
                              </Box>
                            }
                          </Box>

                        );
                      })
                    }
                  </Box>
                </Alert>
              </Snackbar>
            ) : (
              <Snackbar open={ message.open } key={ index } anchorOrigin={ { vertical: "top", horizontal: "center" } }>
                <Alert
                  variant="filled"
                  icon={ false }
                  severity={ message.severity }
                  onClose={ handleClose(message) }
                  style={ { wordBreak: "break-word" } }
                >
                  <AlertTitle>{ message.title }</AlertTitle>
                  { message.text }
                  <Linear message={ message } />
                </Alert>
              </Snackbar>
            )
          );
        }) }
      </div>
    </div>
  );
};
window.setInterval(() => {
  store.dispatch(handle_obsolete());
}, isDexPage() ? 24000000 : 60000);
export default Messages;
