import { Paper, Box, Typography } from "@material-ui/core";
import "./customtooltip.scss";

const renderDate = (index, payload, item) => {
  return index === payload.length - 1 ? (
    <div className="tooltip-date">
      {new Date(item.payload.timestamp * 1000).toLocaleString("default", { month: "long" }).charAt(0).toUpperCase()}
      {new Date(item.payload.timestamp * 1000).toLocaleString("default", { month: "long" }).slice(1)}
      &nbsp;
      {new Date(item.payload.timestamp * 1000).getDate()}, {new Date(item.payload.timestamp * 1000).getFullYear()}
    </div>
  ) : (
    ""
  );
};

const renderItem = (type, item) => {
  return type === "$" ? (
    <Typography variant="body2">{`${type}${Math.round(item).toLocaleString("en-US")}`}</Typography>
  ) : (
    <Typography variant="body2">{`${Math.round(item).toLocaleString("en-US")}${type}`}</Typography>
  );
};

const renderTooltipItems = (payload, bulletpointColors, itemNames, itemType, isStaked = false, isPOL = false) => {
  const zeroValueIndices = payload && payload.map((item, index) => item.value <= 0 ? index : -1);
  const filteredPayload = payload && payload.filter((_, index) => !zeroValueIndices.includes(index));
  const filteredItemNames = itemNames && itemNames.filter((_, index) => !zeroValueIndices.includes(index));
  const filteredBulletpointColors = bulletpointColors && bulletpointColors.filter((_, index) => !zeroValueIndices.includes(index));
  return isStaked ? (
    <Box>
      <Box className="item" display="flex" justifyContent="space-between">
        <Typography variant="body2">
          <span className="tooltip-bulletpoint" style={bulletpointColors[0]}></span>
          Staked
        </Typography>
        <Typography>{`${Math.round(payload[0].value)}%`}</Typography>
      </Box>
      <Box className="item" display="flex" justifyContent="space-between">
        <Typography variant="body2">
          <span className="tooltip-bulletpoint" style={bulletpointColors[1]}></span>
          Not staked
        </Typography>
        <Typography>{`${Math.round(100 - payload[0].value)}%`}</Typography>
      </Box>
      <Box>{renderDate(0, payload, payload[0])}</Box>
    </Box>
  ) : isPOL ? (
    <Box>
      <Box className="item" display="flex" justifyContent="space-between">
        <Typography variant="body2">
          <span className="tooltip-bulletpoint" style={bulletpointColors[0]}></span>
          {itemNames[0]}
        </Typography>
        <Typography>{`${Math.round(payload[0].value)}%`}</Typography>
      </Box>
      <Box className="item" display="flex" justifyContent="space-between">
        <Typography variant="body2">
          <span className="tooltip-bulletpoint" style={bulletpointColors[1]}></span>
          {itemNames[1]}
        </Typography>
        <Typography>{`${Math.round(100 - payload[0].value)}%`}</Typography>
      </Box>
      <Box>{renderDate(0, payload, payload[0])}</Box>
    </Box>
  ) : (
    filteredPayload.map((item, index) => (
      <Box key={index}>
        <Box className="item" display="flex">
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">
              <span className="tooltip-bulletpoint" style={filteredBulletpointColors[index]}></span>
              {`${filteredItemNames[index]}`}
            </Typography>
          </Box>
          {renderItem(itemType, item.value)}
        </Box>
        <Box>{renderDate(index, filteredPayload, item)}</Box>
      </Box>
    ))
  );
};

function CustomTooltip({ active, payload, bulletpointColors, itemNames, itemType, isStaked, isPOL, setActive }) {
  if (active && payload && payload.length) {
    setActive && setActive(payload[0].payload);
    return (
      <Paper className={`ohm-card tooltip-container`}>
        {renderTooltipItems(payload, bulletpointColors, itemNames, itemType, isStaked, isPOL)}
      </Paper>
    );
  }
  setActive && setActive(null);
  return null;
}

export default CustomTooltip;
