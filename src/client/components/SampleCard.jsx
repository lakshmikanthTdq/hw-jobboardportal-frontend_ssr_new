import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  CardActionArea,
  Box,
} from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  card: {
    maxWidth: 300,
    position: "relative",
  },
  hoverBox: {
    position: "absolute",
    top: 0,
    right: 0,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: "black",
    padding: "4px 8px",
    zIndex: 1,
    // opacity: 0,
    // transition: 'opacity 0.2s ease-in-out',
  },
  cardHover: {
    "&:hover": {
      "& $hoverBox": {
        opacity: 1,
      },
      boxShadow:
        "0px 3px 15px rgba(62, 16, 169, 0.2), 0 0 0 3px rgb(255, 216, 0)", // add border highlight on hover
    },
  },

  // cardSelected: {
  //   "&:selected": {
  //     "& $hoverBox": {
  //       opacity: 1,
  //     },
  //     boxShadow:
  //       "0px 3px 15px rgba(62, 16, 169, 0.2), 0 0 0 3px rgb(255, 216, 0)", // add border highlight on hover
  //   },
  // },
});

export function MyCard() {
  const classes = useStyles();
  const date = new Date(); // replace with your actual date

  return (
    <Card
      className={`${classes.card} ${classes.cardHover} ${classes.cardSelected}`}
    >
      <CardHeader
        title="UX Designer"
        sx={{ marginTop: "20px", fontSize: "23px" }}
      />
      <Box className={classes.hoverBox}>{`${getDateDiff(date)}`}</Box>
      <CardContent>
        <Typography
          variant="body1"
          sx={{ marginBottom: "40px", marginTop: "-30px" }}
        >
          The Company Media Office - Full Time
        </Typography>
        <Typography variant="body2">
          Phasellus quis turpis at orci commodo bibendum sed vel purus. Sed
          sagittis libero eu lacus hendrerit, vel fringilla est pharetra.
          Vivamus vitae quam a libero laoreet varius.
        </Typography>
      </CardContent>
    </Card>
  );
}

function getDateDiff(date) {
  const today = new Date();
  const diffTime = Math.abs(today - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days ago`;
}
