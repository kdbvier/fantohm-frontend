import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Paper,
  Typography,
  Slider,
  useMediaQuery,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { trim } from "../../helpers";
import "./crystalball.scss";
import { Skeleton } from "@material-ui/lab";

function CrystalBall() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const isAppLoading = useSelector(state => state.app.loading);
  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });
  const sohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.sohm;
  });
  const stakingRebase = useSelector(state => {
    return state.app.stakingRebase;
  });

  const secondsPerEpoch = useSelector(state => {
    return state.app.secondsPerEpoch;
  });

  const stakingRebasePercentage = trim(stakingRebase * 100, 4);
  const trimmedMarketPrice = trim(marketPrice, 2);
  const trimmedSohmBalance = trim(sohmBalance, 2);

  const [formData, setFormData] = useState({
    sfhmAmount: 0,
    yield: 0,
    purchasePrice: 0,
    futurePrice: 0,
  });

  useEffect(() => {
    setFormData({
      sfhmAmount: isNaN(sohmBalance) ? 1: (sohmBalance == 0 ? 1 : sohmBalance),
      yield: isNaN(stakingRebasePercentage) ? "": stakingRebasePercentage,
      purchasePrice: isNaN(trimmedMarketPrice) ? "": trimmedMarketPrice,
      futurePrice: isNaN(trimmedMarketPrice) ? "": trimmedMarketPrice,
    });
  }, [sohmBalance, stakingRebasePercentage, trimmedMarketPrice, marketPrice]);

  const handleFormChange = (prop) => (event) => {
    setFormData({ ...formData, [prop]: event.target.value });
  };
  
  const [investmentDays, setInvestmentDays] = useState(30);
  const handleInvestmentDaysChange = (event, newValue) => {
    setInvestmentDays(newValue);
  };

  const initialInvestment = trim(parseFloat(formData.sfhmAmount) * parseFloat(formData.purchasePrice), 2);
  const currentWealth = trim(parseFloat(formData.sfhmAmount) * marketPrice, 2);
  const rewardsPerDay = 24 * 60 * 60 / secondsPerEpoch;
  const rewardsEstimate = trim(parseFloat(formData.sfhmAmount) * (Math.pow(1 + parseFloat(formData.yield) / 100, rewardsPerDay * investmentDays) - 1), 2);
  const potentialReturn = trim((parseFloat(formData.sfhmAmount) + parseFloat(rewardsEstimate)) * parseFloat(formData.futurePrice), 2);

  return (
    <div id="crystalball-view">
      <Paper className={`ohm-card`}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <div className="card-header">
              <Typography variant="h5">Crystal Ball (🔮, 🔮)</Typography>
              <Typography variant="h6">Estimate your returns</Typography>
            </div>
          </Grid>

          <Grid item>
            <div className="crystalball-top-metrics">
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={4} md={4} lg={4}>
                  <div className="crystalball-price">
                    <Typography variant="h5" color="textSecondary">
                      Current FHM Price
                    </Typography>
                    <Typography variant="h5">
                      {isAppLoading ? <Skeleton width="100px" /> : `$${trimmedMarketPrice}`}
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={12} sm={4} md={4} lg={4}>
                  <div className="crystalball-yield">
                    <Typography variant="h5" color="textSecondary">
                      Current Reward Yield
                    </Typography>
                    <Typography variant="h5">
                      {isAppLoading ? <Skeleton width="100px" /> : `${stakingRebasePercentage}%`}
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={12} sm={4} md={4} lg={4}>
                  <div className="crystalball-balance">
                    <Typography variant="h5" color="textSecondary">
                      Your Balance
                    </Typography>
                    <Typography variant="h5">
                      {isAppLoading ? <Skeleton width="100px" /> : `${trimmedSohmBalance} sFHM`}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </div>
          </Grid>

          <Grid item>
            <div className="crystalball-area">
              <Grid container spacing={2}>
                <Grid container xs={12} sm={5} md={5} lg={5} spacing={3}>
                  <Grid item xs={12}>
                    <InputLabel htmlFor="sfhm-amount">sFHM Amount</InputLabel>
                    <FormControl variant="outlined" color="primary" fullWidth>
                      <OutlinedInput
                        id="sfhm-amount"
                        type="number"
                        value={formData.sfhmAmount}
                        onChange={handleFormChange('sfhmAmount')}
                        endAdornment={<InputAdornment position="end">sFHM</InputAdornment>}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <InputLabel htmlFor="reward-yield">Reward Yield (%)</InputLabel>
                    <FormControl variant="outlined" color="primary" fullWidth>
                      <OutlinedInput
                        id="reward-yield"
                        type="number"
                        value={formData.yield}
                        onChange={handleFormChange('yield')}
                        endAdornment={<InputAdornment position="end">%</InputAdornment>}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <InputLabel htmlFor="fhm-price">FHM Purchase Price ($)</InputLabel>
                    <FormControl variant="outlined" color="primary" fullWidth>
                      <OutlinedInput
                        id="fhm-price"
                        type="number"
                        value={formData.purchasePrice}
                        onChange={handleFormChange('purchasePrice')}
                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <InputLabel htmlFor="fhm-future-price">Future FHM Market Price ($)</InputLabel>
                    <FormControl variant="outlined" color="primary" fullWidth>
                      <OutlinedInput
                        id="fhm-future-price"
                        type="number"
                        value={formData.futurePrice}
                        onChange={handleFormChange('futurePrice')}
                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container xs={12} sm={2} md={2} lg={2} justifyContent="center">
                  <Box alignItems="center" className="investment-days" sx={{pt: isSmallScreen ? "20px" : "0px"}}>
                    <InputLabel htmlFor="investment-days">{investmentDays} days</InputLabel>
                    <Slider
                      id="investment-days"
                      min={1}
                      max={365}
                      step={1}
                      orientation={isSmallScreen ? "horizontal" : "vertical"}
                      value={investmentDays}
                      onChange={handleInvestmentDaysChange}
                      aria-label="Investment Period"
                    />
                  </Box>
                </Grid>
                <Grid container xs={12} sm={5} md={5} lg={5} spacing={3}>
                  <Grid item xs={12}>
                    <div className="crystalball-info">
                      <Typography variant="h6" color="textSecondary">
                        Your initial investment
                      </Typography>
                      <Typography variant="h6" color="textPrimary">
                        ${new Intl.NumberFormat("en-US").format(initialInvestment)}
                      </Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <div className="crystalball-info">
                      <Typography variant="h6" color="textSecondary">
                        Current value
                      </Typography>
                      <Typography variant="h6" color="textPrimary">
                        ${new Intl.NumberFormat("en-US").format(currentWealth)}
                      </Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <div className="crystalball-info">
                      <Typography variant="h6" color="textSecondary">
                        FHM rewards estimate
                      </Typography>
                      <Typography variant="h6" color="textPrimary">
                        {new Intl.NumberFormat("en-US", { notation: "compact" }).format(rewardsEstimate)} FHM
                      </Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <div className="crystalball-info">
                      <Typography variant="h6" color="textSecondary">
                        Potential future value
                      </Typography>
                      <Typography variant="h6" color="textPrimary">
                        ${new Intl.NumberFormat("en-US").format(potentialReturn)}
                      </Typography>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}

export default CrystalBall;
