import { Button, IconButton } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import { useState } from "react";

/*
 * Used this component in Submissions.jsx and Page2.jsx pages
 */
function SearchBar(props) {
  const [isHovering, setIsHovering] = useState(false);
  //console.log("props: ", props);

  const handleMouseEnter = () => {
    //console.log("handleMouseEnter");
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    //console.log("handleMouseLeave");
    setIsHovering(false);
  };

  return (
    <Paper
      component="form"
      sx={{
        // p: '2px 4px',
        display: "flex",
        alignItems: "center",
        width: props.hover ? (isHovering ? "263px" : "150px") : "150px",
        marginLeft: props.marginLeft ? props.marginLeft : "150px",
        borderTopLeftRadius: props.borderTopLeftRadius
          ? props.borderTopLeftRadius
          : "0px",
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
        borderTopRightRadius: props.borderTopRightRadius
          ? props.borderTopRightRadius
          : "0px",
        height: "38px",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <InputBase
        sx={{ ml: 3, flex: 1 }}
        inputProps={{ "aria-label": "Enter text here" }}
        placeholder={props.hover ? (isHovering ? "Search By Keyword" : "") : ""}
      />
      <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}

export default SearchBar;
