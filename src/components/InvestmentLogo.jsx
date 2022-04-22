import { Box, SvgIcon } from "@material-ui/core";

function InvestmentLogo({ investment, isLp}) {
  let viewBox = "0 0 32 32";
  let style = { height: "32px", width: "32px" };

  // Need more space if its an LP token
  if (isLp) {
    viewBox = "0 0 64 32";
    style = { height: "32px", width: "62px" };
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" width={"64px"}>
      <SvgIcon component={investment.tokenIcon} viewBox={viewBox} style={style} />
    </Box>
  );
}

export default InvestmentLogo;
