import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, CardContent, InputAdornment, TextField, Typography } from '@mui/material';
import parse from 'html-react-parser';
import SearchBar from "material-ui-search-bar";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updateAuth } from "../../_redux/AuthSlice";
import { updateLoader } from "../../_redux/LoaderSlice";
import { updateSnackbar } from "../../_redux/SnackbarSlice";
import { dateTimeAgo } from "../../_utilities/dateTimeAgo";
import Pagination from '../../components/Pagination/Pagination';
import { advanceSearchModel, configuration, typeModel, initalFilter, initalData, initialSnackbar, initialPrimary, initialTypography } from "./jobsData";
import { applyTheme } from "../../_utilities/themeUtils";
import { decryptParams, encryptParams, parseParamsString } from '../../_utilities/Encrypt_decrypt';
import './JobFeedPage.css';

const JobFeedPage = () => {

  const [cardItems, setCardItems] = useState([]);
  const [titleObj, setTitleObj] = useState([]);
  const [titleVal, setTitleVal] = useState("");
  const [filterKey, setFilterKey] = useState("");
  const [styleData, setStyleData] = useState("");
  const [activePost, setActivePost] = useState([]);
  const [queryParams, setQueryParams] = useState({});
  const [config, setConfig] = useState(configuration);
  const [locationValue, setLocationValue] = useState("");
  const [activefilterObj, setActivefilterObj] = useState("");
  const [advanceSearchlist, setAdvanceSearchlist] = useState(advanceSearchModel)
  const [filterObj, setFilterObj] = useState(JSON.parse(JSON.stringify(initalFilter)));
  const [logo, setLogo] = useState("");
  const [userCountries, setUserCountries] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { key: paramsKey } = useParams();

  useEffect(() => {
    if (paramsKey) {
      const decryptedValue = decryptParams(paramsKey);
      const parsedParams = parseParamsString(decryptedValue);
      let selectedCountry = null;
      let storedCountry = null;
      if(userCountries.length === 0) {
        getCountries(parsedParams.customerId);
      } else {
         storedCountry = localStorage.getItem("selectCountryId_jobboardportal");
         let findCountry = userCountries.filter((x)=> x.id === parseInt(storedCountry));
         selectedCountry = findCountry.length > 0 ? findCountry[0].id : userCountries[0].id;
         localStorage.setItem("selectCountryId_jobboardportal", JSON.stringify(selectedCountry));
      }
      if(parsedParams) {
        setQueryParams(parsedParams);
        getData(parsedParams.customerId, parsedParams.segmentId);
        if (selectedCountry) {
          let obj1 = { current: config.currentPage, offset: 1, customerId: parsedParams.customerId, countryId: selectedCountry, segmentid: parsedParams.segmentId.toString() };
          fetchData(obj1);
        } 
        // else {
        //   getCountries(parsedParams.customerId, parsedParams.segmentId);
        // }
      }
    }
  }, [paramsKey, userCountries]);

  const onSearchhandler = (value, type) => {
    if (value !== "" && type !== "onChange") {
      value = value.trimStart();
      value = value.replace(/[^a-zA-Z0-9&%/-_.():, ]/g, "");
      let obj = { offset: 1, current: 1, segmentid: queryParams?.segmentId }
      fetchData(obj, value);
      setFilterKey(value);
    } else if (type === "onCancelSearch" || value === "") {
      let obj1 = { current: 1, offset: 1, segmentid: queryParams?.segmentId };
      fetchData(obj1, undefined);
      setFilterKey("");
    }
  };

  const getData = async (id, segmentId) => {
    dispatch(updateLoader(true));
    dispatch(updateSnackbar(initialSnackbar));
    try {
      const res = await fetch(`${process.env.REACT_APP_BASEURL3}/mgmt/customers/jobBoard`, {
        method: "GET",
        headers: { "Content-Type": "Application/json", "customerId": id },
      });
      const jsonData = await res.json();
      if (jsonData?.Data?.jobBoard.length > 0) {
        let newData = jsonData.Data.jobBoard.filter(x => x.segmentId === segmentId)[0];
        newData.isJobPortal = parseInt(newData.isJobPortal) === 1;
        newData.primaryData = newData.primaryData ? JSON.parse(newData.primaryData) : initialPrimary;
        newData.typography = newData.typography ? JSON.parse(newData.typography) : initialTypography;
        newData.url = newData.url || initalData.url;
        newData.preview = newData.logo ? newData.logo.substring(newData.logo.lastIndexOf("/") + 1) : initalData.preview;

        const getValue = (title) => newData.primaryData.find((item) => item.title === title)?.value;

        const theme = {
          primaryColor: getValue("PrimaryColor") || "#FFD800",
          secondaryColor: getValue("SecondaryColor") || "#3B4046",
          primaryFontColor: getValue("PrimaryFontColor") || "#3B4046",
          secondaryFontColor: getValue("SecondaryFontColor") || "#FFFFFF",
          fontFamily: newData.typography.fontName || ["Roboto"],
          useCustomHeader: getValue("UseCustomHeader") === "true",
          headerBackgroundColor: getValue("HeaderBackgroundColor") || "#FFFFFF",
          headerTextColor: getValue("HeaderTextColor") || "#000000",
        };
        applyTheme(theme);

        const styleObj = {
          headerColor: theme.primaryColor,
          bodyColor: theme.secondaryColor,
          typographyMain: newData.typography[0],
          typographyBody: newData.typography[1],
          isJobPortal: newData.isJobPortal,
        };
        setStyleData(styleObj);

        if (!newData.logo.includes("s3.ap-south-2.amazonaws.com")) {
          const res1 = await fetch(`${process.env.REACT_APP_BASEURL3}/mgmt/customers/previewDocument`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "customerId": id },
            body: JSON.stringify({ path: newData.logo }),
          });

          const docData = await res1.json();
          if (docData.code === 200 && docData.path) {
            newData.logo = docData.path;
            setLogo(docData.path);
          }
        } else if (newData.logo.includes("s3.ap-south-2.amazonaws.com")) {
          newData.logo = newData.logo;
          setLogo(newData.logo);
        } else {
          newData.logo = initalData.logo;
        }
        dispatch(updateAuth({ layoutStyleData: JSON.stringify(newData), headerPreviewImg: JSON.stringify(newData.logo) }));
      }
    } catch (error) {
      console.error("Error fetching job board theme:", error);
    } finally {
      dispatch(updateLoader(false));
    }
  };

  const getCountries = async (id, segmentId) => {
    const res = await fetch(`${process.env.REACT_APP_BASEURL3}/mgmt/customer/${id}`, {
      method: "GET",
      headers: { "content-type": "application/json" }
    });
    const jsonData = await res.json();
    const myData = jsonData.customer;
    if (jsonData.code === 200) {
      if (myData && myData.length > 0) {
        let country = JSON.parse(myData[0].country)
        setUserCountries(country);
        // let obj1 = { current: config.currentPage, offset: 1, customerId: id, countryId: country[0].id, segmentid: segmentId.toString() };
        // fetchData(obj1);
      }
    }
  }

  const fetchData = async (obj, value) => {
    const getCountryId = localStorage.getItem("selectCountryId_jobboardportal");
    setCardItems([]);
    dispatch(updateLoader(true));
    dispatch(updateSnackbar(initialSnackbar));
    let res
    if (value) {
      res = await fetch(`${process.env.REACT_APP_BASEURL}/mgmt/jobopening?limit=${config.limitData}&offset=${obj.offset}&keyword=${value}`, {
        headers: { "Countryid": getCountryId ?? obj.countryId ?? queryParams?.countryId, "Customerid": obj.customerId ?? queryParams?.customerId, "segmentid": obj.segmentid || queryParams?.segmentId, "Portaltype": "JBPortal" }
      });
    } else {
      res = await fetch(`${process.env.REACT_APP_BASEURL}/mgmt/jobopening?limit=${config.limitData}&offset=${obj.offset}`, {
        headers: { "Countryid": getCountryId ?? obj.countryId ?? queryParams?.countryId , "Customerid": obj.customerId ?? queryParams?.customerId, "segmentid": obj.segmentid || queryParams?.segmentId, "Portaltype": "JBPortal" }
      });

    }
    const jsonData = await res.json();
    const myData = jsonData.data;
    if (jsonData.code === 200) {
      if (myData !== undefined && myData.rows.length > 0) {
        dispatch(updateLoader(false));
        let configure = JSON.parse(JSON.stringify(config));
        configure.totalRecords = myData.total_count;
        configure.currentPage = obj.current;
        setConfig(configure);
        myData.rows.forEach((jType)=>{
         jType.jobType  = (jType.jobType.split(",")).join(", ") 
        })
        setCardItems(myData.rows);
      }
      else {
        dispatch(updateLoader(false));
        setConfig(configuration);
        setCardItems(myData);
      }
    } else {
      dispatch(updateLoader(false));
      dispatch(
        updateSnackbar({ type: "error", message: "" })
      );
    }
  };

  const handleActionClick = (page) => {
    let obj = { current: page, offset: page !== 1 ? (page - 1) * config.limitData + 1 : 1, segmentid: queryParams?.segmentId };
    if (titleObj.length !== 0 || filterObj.jobType !== '' || filterObj.location !== '') {
      onApplyAdFilterHandler(obj, "pagination")
    } else {
      if (filterKey) {
        fetchData(obj, filterKey);
      } else {
        fetchData(obj);
      }
    }
  }

  const onActiveAccodianHandler = (obj) => {
    let data = JSON.parse(JSON.stringify(advanceSearchlist));
    data.forEach(list => list.isActive = false);
    let index = data.findIndex(s => s.id === obj.id);
    data[index].isActive = !data[index].isActive;
    setActivefilterObj(data[index]);
    setAdvanceSearchlist(data);
  }

  const onRemoveValueHandler = (e, list, i) => {
    let Array = JSON.parse(JSON.stringify(titleObj));
    Array.splice(i, 1);
    setTitleVal("");
    setTitleObj(Array);
    onApplyAdFilterHandler(Array, "clearKeyword")
  }

  const onkeyhandlerhandler = (e) => {
    if (e.which === 13 && titleVal !== '') {
      let Array = JSON.parse(JSON.stringify(titleObj));
      Array.push(titleVal);
      setTitleVal("");
      setTitleObj(Array);
    }
  }

  const filterObjHandler = (type, value) => {
    let obj = JSON.parse(JSON.stringify(filterObj));
    if (type === 'jobType') {
      if (value === "All") {
        if (activePost.includes("All")) {
          obj.jobType = ""
          setActivePost([]);
        } else {
          obj.jobType = "Full time,Part time,Intern,Contract";
          setActivePost(typeModel);
        }
      } else {
        let modifyData = JSON.parse(JSON.stringify(activePost))
        let Index = modifyData.findIndex(x => x === value);
        if (Index !== -1) {
          modifyData.splice(Index, 1);
          let allIndex = modifyData.findIndex(x => x === "All");
          if (allIndex !== -1) {
            modifyData.splice(allIndex, 1);
          }
          obj.jobType = modifyData.toString();
        } else {
          obj.jobType = obj.jobType ? `${obj.jobType},${value}` : value;
          modifyData.push(value);
        }
        setActivePost(modifyData);
      }
    } else if (type === 'location') {
      obj.location = value
      setLocationValue(value)
    }
    else if (type === 'keywords') {
      obj.keywords = titleObj;
    }
    setFilterObj(obj);
  };

  const onApplyAdFilterHandler = (data, type) => {
    let params = [], generateURL = '';
    if (type === "clearKeyword") {
      if (data.length > 0) {
        params = []; generateURL = ''
        params.push(`keyword=${data}`);
      } else {
        let obj1 = { current: config.currentPage, offset: 1, segmentid: queryParams?.segmentId };
        fetchData(obj1);
      }
    }
    else {
      if (filterObj.keywords.length === 0) {
        params.push(`keyword=${titleObj}`);
      }
    }
    if (filterObj.jobType !== '') {
      params.push(`jobtype=${filterObj.jobType}`);
    }
    if (filterObj.location !== '') {
      params.push(`location=${filterObj.location}`);
    }
    if (params.length > 0) {
      generateURL = params.join("&");
      let obj = {};
      if (type === "pagination") {
        obj = { limit: config.limitData, offset: (data.current !== 1) ? (data.current - 1) * config.limitData + 1 : data.current, current: data.current };
      } else {
        obj = { limit: config.limitData, offset: 1, current: 1 };
      }
      filterData(obj, generateURL)
    }
    console.log(generateURL);
  }

  const onClearFilterHandler = () => {
    setTitleObj([]);
    setFilterObj(initalFilter);
    setLocationValue("")
    setActivePost([])
    let data = JSON.parse(JSON.stringify(advanceSearchlist));
    data.forEach(list => list.isActive = false);
    setAdvanceSearchlist(data);
    setActivefilterObj("");
    let obj = { current: config.currentPage, offset: 1, segmentid: queryParams?.segmentId };
    fetchData(obj);
  }

  const filterData = async (obj, generateURL) => {
    const getCountryId = localStorage.getItem("selectCountryId_jobboardportal");
    dispatch(updateLoader(true));
    dispatch(updateSnackbar(initialSnackbar));
    const res = await fetch(`${process.env.REACT_APP_BASEURL}/mgmt/jobopening/search?limit=${config.limitData}&offset=${obj.offset}&${generateURL}`, {
      method: "GET",
      headers: { 'Countryid': getCountryId ?? queryParams?.countryId , "Customerid": queryParams?.customerId, "segmentid": queryParams?.segmentId, "Portaltype": "JBPortal" }
    });
    const jsonData = await res.json();
    const myData = jsonData.data;
    if (jsonData.code === 200) {
      if (myData !== undefined && myData.length > 0) {
        dispatch(updateLoader(false));
        let configure = JSON.parse(JSON.stringify(config));
        configure.totalRecords = myData[0].total_count;
        configure.currentPage = obj.current;
        setConfig(configure);
        setCardItems(myData)
      } else {
        dispatch(updateLoader(false));
        setConfig(configuration);
        setCardItems(myData);
        if (myData.length === 0) {
        }
      }
    } else {
      dispatch(updateSnackbar({ type: "error", message: "" }));
    }
    dispatch(updateLoader(false));
  };

  const onSelectCardhandler = (item) => {
    const newQueryParams = {
      countryId: item.customerId,
      customerId: item.customerId,
      jobfeedId: item.id,
      segmentId: queryParams?.segmentId || 0,
    }
    const queryString = encryptParams(newQueryParams);
    if(queryString){
      navigate(`/jobboardportal/jobdetails/${queryString}`);
    }
  }

  return (
    <div >
      <div className="adSearchPannel">
        <p style={{ color: "#5D5D5D", fontSize: 20, font: "roboto" }}>Total number of Jobs <b>• {cardItems.length > 0 ? config.totalRecords : '0'}</b> jobs found</p>
        <ul className="adSearchPannelList" >
          {advanceSearchlist.map(item => (
            <li onClick={(e) => { onActiveAccodianHandler(item) }} >
              <div className={item.isActive ? "active" : 'filterLabel'} style={{ background: item.isActive ? styleData.headerColor : "", color: item.isActive ? styleData.bodyColor : "" }}>
                {item.displayName}
              </div>
            </li>
          ))}
        </ul>
        {activefilterObj.isActive === true ? (
          <div className="" style={{ position: "absolute", top: "149px", width: "", left: "440px", textAlign: "center" }}>
            <Button type="button" className="cancelBtn"
              style={{ backgroundColor: "transparent", textTransform: "capitalize" }}
              onClick={onClearFilterHandler}
            >
              Clear
            </Button>
            <Button className="filterbtn" variant="contained" type="submit"
              onClick={onApplyAdFilterHandler}
            >
              Filter
            </Button>
          </div>
        ) : ""}

        {/* sub filters */}
        {activefilterObj?.name === 'keywords' && (
          <div className="d-flex" style={{ gap: "30px" }}>
            <TextField id="standard-basic" variant="standard" placeholder={`Search for ${activefilterObj.name}`} className="adSearchBox"
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onKeyUp={onkeyhandlerhandler}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon />
                  </InputAdornment>),
                disableUnderline: true
              }}
            />
            <ul className="listbtns mt-3">
              {titleObj && titleObj.map((list, i) => (
                <li>{list}<span onClick={(e) => onRemoveValueHandler(e, list, i)}> x </span></li>
              ))}</ul>
          </div>
        )}
        {activefilterObj?.name === 'location' && (
          <div className="d-flex" style={{ gap: "30px" }}>
            <TextField id="standard-basic" variant="standard" placeholder={`Search for ${activefilterObj.name}`} className="adSearchBox"
              value={locationValue}
              onChange={e =>
                filterObjHandler("location", e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon />
                  </InputAdornment>),
                disableUnderline: true
              }}
            />
          </div>
        )}

        {activefilterObj?.name === 'jobtype' && (
          <ul className="listbtns">
            {typeModel.map(list => (
              <li className={activePost.includes(list) ? "active" : ''} onClick={() =>
                filterObjHandler("jobType", list)}
              >{list}</li>
            ))}
          </ul>
        )}
      </div>
      <div className='searchdivpos'>
        <SearchBar className="SearchBar" autoFocus
          onChange={(newValue) => onSearchhandler(newValue.slice(0, 20), "onChange")}
          onRequestSearch={(newValue) => onSearchhandler(newValue.slice(0, 20), "onRequestSearch")}
          onCancelSearch={() => onSearchhandler("", "onCancelSearch")}
          placeholder="Search by keyword"
        />
      </div>

      <div className="innerdiv">
        {cardItems && cardItems.length > 0 ?
          <>
            {cardItems.map((elem) => {
              return (
                <Card className='cardPosition'
                  onClick={() => onSelectCardhandler(elem)}
                  sx={{ border: "0px solid #ffffff", "&:hover": { outline: `2px solid ${styleData?.headerColor}` } }}
                >
                  {/* <CardContent style={{ paddingBottom: "15px" }}>

                    <Typography sx={{ fontSize: 23, font: "roboto", fontWeight: 700, color: styleData.typographyMain?.color ? styleData.typographyMain.color : "#4F5357" }} component="div" >
                      <span title={elem.jobTitle} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", display: "block", backgroundColor: 'var(--primary-bg-color)', color: 'var(--primary-background-text-color)' }} className='inderdivheader'  >
                        {elem.jobTitle}
                      </span>
                    </Typography>
                    <div className="cardItems">
                      <Typography sx={{ fontSize: 17, font: "roboto", margin: "5px", fontWeight: 400, color: styleData.typographyBody?.color ? styleData.typographyBody.color : "#16202C" }} component="div" gutterBottom>
                        {elem.clientName ? `${elem.clientName} - ` : ''} {elem.jobType}
                      </Typography>
                      <Typography sx={{ mb: 1, fontSize: 17, font: "roboto", marginLeft: "7px", marginRight: "10px", fontWeight: 400, color: styleData.typographyBody?.color ? styleData.typographyBody.color : "#16202C" }} component="div" >
                        {elem.payBillRate}
                      </Typography>
                      <Typography variant="body2" color="#4F5357" className="multilinetextWrap" sx={{ fontSize: 15, font: "roboto", marginBottom: "10px", fontWeight: 400, color: styleData.typographyBody?.color ? styleData.typographyBody.color : "#16202C" }} component="div">
                        {parse(elem.jobDesc)}
                      </Typography>
                    </div>
                    <Typography sx={{ fontSize: 14, font: "roboto", fontWeight: 500, textAlign: "right", paddingTop: "10px" }} component="div" color="#7A7A7A">
                      {dateTimeAgo(elem.createdAt)} ago
                    </Typography>
                  </CardContent> */}
                  <CardContent style={{ padding: "0px" }}>
                        <img className="cardLogoCss" src={logo || "/static/assests/img/HirewingLogin.svg"} alt="Hirewinglogo" />
                        <div className='cardItems'>
                          <Typography component="div"
                            sx={{ mb: 1, fontSize: "18px !important", font: "var(--applications-font-family)", fontWeight: 400, color: "#3B4046", padding:"0px 10px 0px 16px", margin: "0px" }}
                          >
                            {elem.jobTitle}
                          </Typography>
                          <Typography sx={{ mb: 1, fontSize: "18px !important", font: "var(--applications-font-family)", fontWeight: 400, color: "#3B4046", padding:"10px 10px 0px 16px", margin: "0px" }} component="div" >
                            {elem.jobType}
                          </Typography>
                          {elem.clientName ? <Typography sx={{ fontSize: "18px !important", font: "var(--applications-font-family)", fontWeight: 400, color: "#3B4046", padding:"10px 10px 0px 16px", margin: "0px" }} component="div" gutterBottom>
                            {elem.clientName ? elem.clientName : ""}
                          </Typography> : ""}
                          <Typography sx={{ fontSize: "18px !important", font: "var(--applications-font-family)", fontWeight: 400, color: "#3B4046", padding:"10px 10px 0px 16px", margin: "0px" }} component="div" gutterBottom>
                            {elem.location}
                          </Typography>
                        </div>
                        <Typography sx={{ fontSize: 14, font: "var(--applications-font-family)", fontWeight: 400, textAlign: "right", paddingRight: "12px", marginTop: "7px" }} component="div" color="#7A7A7A">
                          {dateTimeAgo(elem.createdAt)} ago
                        </Typography>
                      </CardContent>
                </Card>
              );
            })}
          </> : <h3 style={{ color: "#7A7A7A", width: "100%", display: "flex", justifyContent: "center" }}>No Match Found</h3>}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'end',
          padding: '25px 110px 80px 0',
        }}
      >
        <Pagination
          className="pagination-bar"
          currentPage={config.currentPage}
          totalCount={config.totalRecords}
          pageSize={config.limitData}
          onPageChange={(page) => handleActionClick(page)}
        />
      </div>
    </div >
  )
}
export default JobFeedPage;