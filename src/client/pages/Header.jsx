import {
  AppBar,
  Button,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { updateLoader } from "../_redux/LoaderSlice";
import { updateSnackbar } from "../_redux/SnackbarSlice";
import { decryptParams, encryptParams, parseParamsString } from "../_utilities/Encrypt_decrypt";

const initialSnackbar = { type: "", message: "" };
const pages = [{ id: 1, path: ``, displayName: "Job Feed", isActive: true }];

function Header() {
  const dispatch = useDispatch();
  const [detaillsOfUser, setDetaillsOfUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userCountries, setUserCountries] = useState(null);
  const [getCountries, setGetCountries] = useState([]);
  const [styleData, setStyleData] = useState("");
  const [data, setData] = useState([]);
  const [queryParams, setQueryParams] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const userDetails = useSelector((state) => state.Auth);


  const { key: paramsKey } = useParams();

  useEffect(() => {
    if (paramsKey) {
      const decryptedValue = decryptParams(paramsKey);
      const parsedParams = parseParamsString(decryptedValue);
      if (parsedParams) {
        setQueryParams(parsedParams);
        getCustomerDetails(parsedParams.customerId);
      }
    }
  }, [paramsKey]);

  useEffect(() => {
    if (userDetails && (userDetails.layoutStyleData !== "" || userDetails.headerPreviewImg !== "") ) {
      let adminData = JSON.parse(userDetails.layoutStyleData);
      let adminImage = JSON.parse(userDetails.headerPreviewImg);
      if (adminData || adminImage) {
        const useCustomHeader = adminData.primaryData.find(x => x.title === "UseCustomHeader")?.value === "true";
        const headerBackgroundColor = adminData.primaryData.find(x => x.title === "HeaderBackgroundColor")?.value;
        const headerTextColor = adminData.primaryData.find(x => x.title === "HeaderTextColor")?.value;
        const secondaryColor = adminData.primaryData.find(x => x.title === "SecondaryColor")?.value;
        const secondaryFontColor = adminData.primaryData.find(x => x.title === "SecondaryFontColor")?.value;

        let styleObj = {
          headerColor: useCustomHeader ? headerBackgroundColor : secondaryColor,
          headerTextColor: useCustomHeader ? headerTextColor : secondaryFontColor,
          logo: adminData.logo,
          typographyMain: adminData.typography[0],
          typographyBody: adminData.typography[0],
        }
        setStyleData(styleObj);
        setData(adminImage);
      }
    }
  }, [userDetails])

  const getCustomerDetails = async (id) => {
    dispatch(updateLoader(true));
    dispatch(updateSnackbar(initialSnackbar));
    const res = await fetch(`${process.env.REACT_APP_BASEURL3}/mgmt/customer/${id}`, {
      method: "GET",
      headers: { "content-type": "application/json" }
    });
    const jsonData = await res.json();
    const myData = jsonData.customer;
    if (jsonData.code === 200) {
      if (myData !== undefined && myData.length > 0) {
        dispatch(updateLoader(false));
        let country = JSON.parse(myData[0].country)
        setGetCountries(country);
      }
      localStorage.setItem("detaillsOfUser_jobboardportal", JSON.stringify(myData[0]));
    } else {
      dispatch(updateSnackbar({ type: "error", message: "" }));
    }
    dispatch(updateLoader(false));
  }

  useEffect(() => {
    if (getCountries && getCountries.length > 0) {
      let assignedCountries = getCountries;
      setDetaillsOfUser(assignedCountries);
      if (assignedCountries.length > 0) {
        let selCountry = JSON.parse(localStorage.getItem('selectCountry_jobboardportal'));
        if (selCountry) {
          let countryObj = assignedCountries.filter((x)=> x.id === selCountry.id);
          console.log(countryObj);

          setUserCountries(countryObj.length > 0 ? countryObj[0] : assignedCountries[0]);
          localStorage.setItem("selectCountry_jobboardportal", countryObj.length > 0 ? JSON.stringify(countryObj[0]) : JSON.stringify(assignedCountries[0]));
          localStorage.setItem("selectCountryId_jobboardportal",countryObj.length > 0 ? JSON.stringify(countryObj[0].id) : JSON.stringify(assignedCountries[0]));
        } else {
          setUserCountries(assignedCountries[0]);
          localStorage.setItem("selectCountry_jobboardportal", JSON.stringify(assignedCountries[0]));
          localStorage.setItem("selectCountryId_jobboardportal", JSON.stringify(assignedCountries[0].id));
        }
      }
    }
  }, [getCountries]);

  const open = Boolean(anchorEl);
  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event, index, obj) => {
    setUserCountries(obj);
    localStorage.setItem("selectCountry_jobboardportal", JSON.stringify(obj));
    localStorage.setItem("selectCountryId_jobboardportal", JSON.stringify(obj.id));
    const newQueryParams = {
      countryId: obj.id,
      customerId: queryParams?.customerId,
      jobfeedId: queryParams?.jobfeedId,
      segmentId: queryParams?.segmentId,
    }
    const queryString = encryptParams(newQueryParams);
    if (queryString) {
      navigate(`/jobboardportal/jobfeed/${queryString}`);
    }
    // window.location.reload();
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onActiveMenuHandler = (page, boolean) => {
    let obj = pages;
    obj.forEach((e) => (e.isActive = false));
    let findIndex = obj.findIndex((x) => x.id === page.id);
    if (findIndex !== -1) {
      obj[findIndex].isActive = true;
    }
    if (boolean) {
      let queryParamObject = {
        countryId: queryParams?.customerId,
        customerId: queryParams?.customerId,
        jobfeedId: queryParams?.jobfeedId,
        segmentId: queryParams?.segmentId,
      };
      const queryParamString = encryptParams(queryParamObject)
      navigate(`/jobboardportal/jobfeed/${queryParamString}`);
    }
  };


  return (
    <AppBar position="fixed" className="headerBar" style={{
      background: styleData.headerColor || 'var(--primary-bg-color)',
      color: styleData.headerTextColor || 'var(--primary-background-text-color)'
    }}>
      <Toolbar className="toolbarforquestions">
        <div className="headerlogotext">
          <img
            src={data ? data : "/static/assests/img/HireWing.png"}
            alt="brand logo"
            className="hirewingImg"
          />
          <div style={{ flexGrow: 1, display: "flex", minWidth: "100%" }} className="tabs">
            {pages.map((page) => (
              <Button
                // href={page.path}
                key={page.id}
                style={{
                  color: styleData.headerTextColor || 'var(--primary-background-text-color)',
                  display: "block",
                  padding: "24px 8px",
                  fontSize: "16px",
                  alignContent: "center",
                  textTransform: 'capitalize',
                }}
                className={page.isActive === true ? "activebtn" : ""}
                onClick={(e) => onActiveMenuHandler(page, true)}
              >
                {page.displayName}
              </Button>
            ))}
          </div>
        </div>
        <div className="d-flex">
          <div>
            <List component="nav" aria-label="Device settings">
              <ListItem
                className="countrydisplay"
                id="lock-button"
                style={{ marginTop: "-4px" }}
                aria-haspopup="listbox"
                aria-controls="lock-menu"
                aria-expanded="true"
                onClick={handleClickListItem}
              >
                <ListItemText
                  className="flagname"
                  style={{
                    display: "flex",
                    gap: "15px",
                    justifyContent: "left",
                    width: "120px",
                    color: styleData.headerTextColor || 'var(--primary-background-text-color)',
                    marginTop: "12px",
                    cursor: "pointer",
                  }}
                  primary={
                    <img src={userCountries ? `/static/assests/img/${userCountries.logo}` : ""} alt="" />
                  }
                  secondary={userCountries ? userCountries.name : ""}
                />
              </ListItem>
            </List>
            <Menu
              id="lock-menu"
              anchorEl={anchorEl}
              open={open}
              onClick={handleClose}
              onMouseLeave={handleClose}
              MenuListProps={{
                "aria-labelledby": "lock-button",
                role: "listbox",
              }}
            >
              {detaillsOfUser &&
                detaillsOfUser.map((option, index) => (
                  <MenuItem
                    style={{
                      display: "flex",
                      gap: "15px",
                      justifyContent: "left",
                      height: "35px",
                      padding: "0 12px",
                      width: "135px",

                    }}
                    className="menucountrydropdown"
                    key={option}
                    selected={option.id === userCountries.id ? userCountries.id : 0}
                    onClick={(event) => handleMenuItemClick(event, index, option)}
                  >
                    <img
                      src={`/static/assests/img/${option.logo}`}
                      alt=""
                      className="countryflagsimg"
                    />
                    <p className="countryflagname">{option.name}</p>
                  </MenuItem>
                ))}
            </Menu>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Header;