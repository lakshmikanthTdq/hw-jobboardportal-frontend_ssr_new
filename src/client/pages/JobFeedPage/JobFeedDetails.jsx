import React, { useEffect, useState, } from 'react';
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import parse from 'html-react-parser';
import { useParams } from "react-router-dom";
import { FormControlLabel, RadioGroup } from '@mui/material';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Box, Button, Card, CardContent, Checkbox, FormControl, Grid, InputLabel, MenuItem, Modal, Radio, Select, TextField, Typography } from '@mui/material';
import * as Yup from "yup";
import { updateAuth } from "../../_redux/AuthSlice";
import { updateLoader } from "../../_redux/LoaderSlice";
import { updateSnackbar } from "../../_redux/SnackbarSlice";
import { dateTimeAgo } from "../../_utilities/dateTimeAgo";
import RightSideBar from "../../components/Rightsidebar/RightSideBar";
import { CandidateTitle, QuestionTypes, QuestionsTitle, initialData, initalData, initialPrimary, initialTypography } from "./jobsData";
import { applyTheme } from "../../_utilities/themeUtils";
import MetaGenerator from '../../components/MetaGenerator/MetaGenerator'
import { decryptParams, parseParamsString } from "../../_utilities/Encrypt_decrypt";
import './JobFeedPage.css';

const initData = JSON.stringify(initialData);
const initialSnackbar = { type: "", message: "" };

const JobFeedDetails = () => {

  const [modal, setModal] = useState(false);
  const [styleData, setStyleData] = useState("");
  const [selectCard, setSelectCard] = useState([]);
  const [queryParams, setQueryParams] = useState({});
  const [isQuestionTitle, setIsQuestionTitle] = useState(false);
  const [isRightSidePannel, setIsRightSidePannel] = useState(false);
  const [logo, setLogo] = useState("");

  const dispatch = useDispatch();
  const { key: paramsKey } = useParams();

  useEffect(() => {
    if (paramsKey) {
      const decryptedValue = decryptParams(paramsKey);
      const parsedParams = parseParamsString(decryptedValue);
      if (parsedParams) {
        setQueryParams(parsedParams);
        getData(parsedParams.customerId, parsedParams.segmentId);
        fetchDatabyId(parsedParams.customerId, parsedParams.countryId, parsedParams.jobfeedId);
      }
    }
  }, [paramsKey]);

  useEffect(() => {
    if (modal === true) {
      setTimeout(() => { setModal(false) }, 3000)
    }
  }, [modal])

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

        // Parse and normalize data
        newData.isJobPortal = parseInt(newData.isJobPortal) === 1;
        newData.primaryData = newData.primaryData ? JSON.parse(newData.primaryData) : initialPrimary;
        newData.typography = newData.typography ? JSON.parse(newData.typography) : initialTypography;
        newData.url = newData.url || initalData.url;
        newData.preview = newData.logo
          ? newData.logo.substring(newData.logo.lastIndexOf("/") + 1)
          : initalData.preview;

        // Prepare theme object
        const getValue = (title) =>
          newData.primaryData.find((item) => item.title === title)?.value;

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

        // Apply CSS theme
        applyTheme(theme);

        // StyleData for internal use (e.g., filter button coloring)
        const styleObj = {
          headerColor: theme.primaryColor,
          bodyColor: theme.secondaryColor,
          typographyMain: newData.typography[0],
          typographyBody: newData.typography[1],
          isJobPortal: newData.isJobPortal,
        };

        setStyleData(styleObj);

        // Handle logo preview
        if (!newData.logo.includes("s3.ap-south-2.amazonaws.com")) {
          const res1 = await fetch(`${process.env.REACT_APP_BASEURL3}/mgmt/customers/previewDocument`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "customerId": id,
            },
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
        dispatch(
          updateAuth({
            layoutStyleData: JSON.stringify(newData),
            headerPreviewImg: JSON.stringify(newData.logo),
          })
        );
      }
    } catch (error) {
      console.error("Error fetching job board theme:", error);
    } finally {
      dispatch(updateLoader(false));
    }
  };

  const handleClose = () => setModal(false);

  const onReceivePropsHandler = (pannel, load) => {
    if (load === "modal") {
      setTimeout(() => {
        setModal(true);
      }, 1200);
      setIsRightSidePannel(pannel);
    } else {
      setIsRightSidePannel(pannel);
    }
  };


  const handleClick = (list) => {
    console.log(list);
  }

  const fetchDatabyId = async (customerId, countryId, jobfeedId) => {
    dispatch(updateLoader(true));
    dispatch(updateSnackbar(initialSnackbar));
    const res = await fetch(`${process.env.REACT_APP_BASEURL}/mgmt/jobopening/${jobfeedId}`, {
      method: "GET",
      headers: { 'Countryid': countryId, "Customerid": customerId, "Portaltype": "JBPortal" }
    });
    const jsonData = await res.json();
    const myData = jsonData.data;
    if (jsonData.code === 200) {
      myData[0].jobType =  (myData[0].jobType.split(",")).join(", ")
      setSelectCard(myData);
    } else {
      dispatch(updateSnackbar({ type: "error", message: "" }));
    }
    dispatch(updateLoader(false));
  };

  return (
    <div style={{marginTop: "75px"}}>
      {selectCard && selectCard.length > 0 && (
        <>
          <div style={{ background: "#FAFAFA" }}>
            <div className="selectionCards" style={{ width: "95%", margin: "20px auto 0" }}>
              <FormControl fullWidth>
                <InputLabel id="jobcard-select">Select JobRole</InputLabel>
                <Select
                  labelId="jobcard-select"
                  id="jobcard-select"
                  autoComplete="off"
                  value={selectCard[0].id}
                  label="Select Job Cards"
                  onChange={(e) => handleClick(e)}
                >
                  {selectCard.map((elem) => {
                    return (
                      <MenuItem value={10}>{elem.jobTitle} | {elem.company} - {elem.jobType}</MenuItem>
                    )
                  })
                  }
                </Select>
              </FormControl>

            </div>
            <div className="jobDetailsContainer">
              <div className="sidediv">
                {selectCard.length > 0 ?
                  <>
                    {/* <MetaGenerator job={selectCard[0]} /> */}
                    <Card className="cardPosition active">
                      <CardContent style={{ padding: "0px" }}>
                        <img className="cardLogoCss" src={logo || "/static/assests/img/HirewingLogin.svg"} alt="Hirewinglogo" />
                        <div className='cardItems'>
                          <Typography component="div"
                            sx={{ mb: 1, fontSize: "18px !important", font: "var(--applications-font-family)", fontWeight: 400, color: "#3B4046", padding: "0px 10px 0px 16px", margin: "0px" }}
                          >
                            {selectCard[0].jobTitle}
                          </Typography>
                          <Typography sx={{ mb: 1, fontSize: "18px !important", font: "var(--applications-font-family)", fontWeight: 400, color: "#3B4046", padding: "10px 10px 0px 16px", margin: "0px" }} component="div" >
                            {selectCard[0].jobType}
                          </Typography>
                          {selectCard[0].clientName ? <Typography sx={{ fontSize: "18px !important", font: "var(--applications-font-family)", fontWeight: 400, color: "#3B4046", padding: "10px 10px 0px 16px", margin: "0px" }} component="div" gutterBottom>
                            {selectCard[0].clientName ? selectCard[0].clientName : ""}
                          </Typography> : ""}
                          <Typography sx={{ fontSize: "18px !important", font: "var(--applications-font-family)", fontWeight: 400, color: "#3B4046", padding: "10px 10px 0px 16px", margin: "0px" }} component="div" gutterBottom>
                            {selectCard[0].location}
                          </Typography>
                        </div>
                        <Typography sx={{ fontSize: 14, font: "var(--applications-font-family)", fontWeight: 400, textAlign: "right", paddingRight: "12px", marginTop: "7px" }} component="div" color="#7A7A7A">
                          {dateTimeAgo(selectCard[0].createdAt)} ago
                        </Typography>
                      </CardContent>
                    </Card>
                  </>
                  : <h3 style={{ color: "#7A7A7A", width: "100%", display: "flex", justifyContent: "center" }}>No Match Found</h3>}
              </div>
              <div style={{ display: "flex" }} className="sidesubmitbtn">
                <div
                  className="squarelinedot"
                >
                    <img src={"/static/assests/img/PersonBriefcase.svg"} alt="PersonIcon" />
                </div>

                <div className="displaytext">
                  <Typography
                    sx={{ fontSize: "23px !important", font: "var(--applications-font-family)", fontWeight: 700, maxWidth: "70%" }}
                    component="div"
                    color="#4F5357"
                  >
                    {selectCard[0].jobTitle}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "17px !important", font: "var(--applications-font-family)", fontWeight: 400, color: "#16202C", maxWidth: "70%" }}
                  >
                    {selectCard[0].clientName ? `${selectCard[0].clientName} - ` : ''} {selectCard[0].jobType}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "17px !important", font: "var(--applications-font-family)", fontWeight: 400, color: "#16202C", maxWidth: "70%" }}
                    gutterBottom
                  >
                    Location : {selectCard[0].location}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 16,
                      font: "var(--applications-font-family)",
                      fontWeight: 500,
                      textAlign: "left",
                      maxWidth: "70%",
                    }}
                    component="div" color="#7A7A7A"
                  >
                    {dateTimeAgo(selectCard[0].createdAt)} ago
                  </Typography>

                  <Typography
                    sx={{
                      mb: 1.5,
                      fontSize: 17,
                      font: "var(--applications-font-family)",
                      fontWeight: 400,
                      color: "#16202C", maxWidth: "70%"
                    }}
                  >
                    {selectCard[0].payBillRate}
                  </Typography>
                  <h4 style={{ marginBottom: "10px", color: "#4F5357", fontSize: 20, font: "var(--applications-font-family)", fontWeight: 700 }}>Job Description</h4>
                  <Typography
                    variant="body2"
                    color="#4F5357"
                    sx={{ fontSize: 15, font: "var(--applications-font-family)", fontWeight: 400 }}
                  >
                    {parse(selectCard[0].jobDesc)}
                  </Typography>
                </div>
              </div>
              <div className="submissionbtn">
                <Button
                  className="btn-submit-candidate"
                  size="medium"
                  onClick={() => {
                    setIsRightSidePannel(true);
                  }}
                >
                  <p style={{ fontSize: "16px", fontWeight: "500" }}>Apply Now</p>
                </Button>
              </div>
            </div>
          </div>
          {isRightSidePannel ? (
            <div className="questionPannelSection">
              <RightSideBar
                componentData={
                  <ComponentRenderData
                    onReceivechildProps={onReceivePropsHandler}
                    selectCard={selectCard[0]}
                    initData={initData}
                    selectCountry={queryParams.countryId}
                    onChangeHeaderHandler={(e) => { setIsQuestionTitle(e) }}
                    styleData={styleData}
                  />
                }
                componentLayout={isQuestionTitle ? QuestionsTitle : CandidateTitle}
                onReceiveProps={onReceivePropsHandler}
              />
            </div>
          ) : (
            ""
          )}
          {modal === true ? (
            <Modal
              open={modal}
              onClose={handleClose}
              disableEscapeKeyDown={true}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box className="submitpopup">
                <img
                  src={"/static/assests/img/dialodimg.svg"}
                  alt=""
                />
                <Typography className="submitpopuptext">
                  <h4>Profile Submission - Successful</h4>
                </Typography>
              </Box>
            </Modal>
          ) : ''}
        </>
      )
      }
    </div >
  )
}
export default JobFeedDetails;

const ComponentRenderData = (props) => {
  const [getdetails, setGetDetails] = useState({});
  const [isUploaded, setIsUploaded] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [checked, setChecked] = useState(false);
  const [applicantId, getApplicantId] = useState(null);
  const [manualUpload, setManualUpload] = useState(false);
  const [questionPage, setQuestionPage] = useState(false);
  const [selectedCardData, setSelectedCardData] = useState(null);
  const [resumeObj, setResumeObj] = useState(JSON.parse(props.initData));
  
  const phoneRegExp = /^[0-9()+-\s\b]*$/
  const initialSnackbar = { type: "", message: "" };
  const dispatch = useDispatch();

  useEffect(() => {
    if (isUploaded === true) {
      props.onChangeHeaderHandler(false);
    }
  }, [isUploaded])

  useEffect(() => {
    if (props.selectCard !== null) {
      setSelectedCardData(props.selectCard);
    }
  }, [props.selectCard])

  const uploadImgHandler = (event) => {
    dispatch(updateLoader(false));
    dispatch(updateSnackbar(initialSnackbar));
    var fileInput = document.getElementById('fileId');
    var filePath = fileInput.value;
    var allowedExtensions = /(\.doc|\.docx|\.pdf)$/i;
    if (!allowedExtensions.exec(filePath)) {
      dispatch(updateSnackbar({ type: 'error', message: "File not supported" }));
      fileInput.value = '';
      return false;
    }
    else {
      setUploadFile(event.target.files[0]);
    }
    event.target.value = '';
  };

  const addSubmissionRes = async (url, formData, type) => {
    dispatch(updateLoader(true));
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: { "countryid": selectedCardData.countryId, "customerid": selectedCardData.customerId }
    });
    const jsonData = await res.json();
    if (jsonData.code === 200) {
      if (type === "applicantUpload" || type === "applicantmanualUpload") {
        getApplicantId(jsonData.applicantId)
        dispatch(updateLoader(false));
        dispatch(updateSnackbar({ type: (jsonData.code === 200) ? "success" : "error", message: jsonData.message }));
        setIsUploaded(false);
        setQuestionPage(true);
        setUploadFile('');
        props.onChangeHeaderHandler(true);
        if (getdetails.length === 0) {
          props.onReceivechildProps(false, "modal");
        }
      }
    } else if (jsonData.code === 400) {
      dispatch(updateLoader(false));
      dispatch(updateSnackbar({ type: "error", message: jsonData.message }));
      setIsUploaded(false);
      setManualUpload(true);
    } else {
      dispatch(updateLoader(false));
      dispatch(updateSnackbar({ type: "error", message: jsonData.message }));
    }
  }

  const applyNowHandler = async () => {
    if (resumeObj.firstName !== '' && resumeObj.lastName && selectedCardData !== null) {
      dispatch(updateSnackbar(initialSnackbar));
      let formData = new FormData();
      formData.append("firstName", resumeObj.firstName);
      formData.append("lastName", resumeObj.lastName);
      formData.append("contactNumber", resumeObj.phone);
      formData.append("emailId", resumeObj.emailId);
      formData.append("Resume", uploadFile);
      formData.append("customerId", selectedCardData.customerId);
      formData.append("jobCode", selectedCardData.jobCode);
      formData.append("jobId", selectedCardData.id);
      formData.append("resumesourceId", 10);
      formData.append("sourceFrom", "JobBoard Portal");
      formData.append("source", "JobBoard Portal");
      formData.append("countryid", selectedCardData.countryId);
      formData.append("status", "pending");
      formData.append("DbUserId", "9999");
      const manualUploadUrl = `${process.env.REACT_APP_BASEURL1}/mgmt/jobboardportal/recruiter/${selectedCardData.customerId}/manualsubmissions`
      const UploadUrl = `${process.env.REACT_APP_BASEURL1}/mgmt/jobboardportal/recruiter/${selectedCardData.customerId}/submissions`
      if (manualUpload) {
        await addSubmissionRes(manualUploadUrl, formData, "applicantmanualUpload");
      }
      else {
        await addSubmissionRes(UploadUrl, formData, "applicantUpload");
      }
    }
  }

  const validationSchema = Yup.object({
    firstName: Yup.string().matches(/^[A-Za-z ]*$/, "Please enter valid name.").required("Please Enter First Name").min(2).max(15),
    lastName: Yup.string().matches(/^[A-Za-z ]*$/, "Please enter valid name.").required("Please Enter Last Name").min(2).max(15),
    phone: Yup.string().required('Enter Valid Contact number').min(10, "Contact number should be at least 10 Characters").max(20, "Contact number should be at most 20 Characters").matches(phoneRegExp, 'Contact number is not valid'),
    emailId: Yup.string().email('Invalid email').required('Please enter valid Email '),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      phone: "",
      emailId: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      onBlurHandler();
    }
  });

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };
  useEffect(() => {
    if (selectedCardData !== null) {
      getQuestion();
    }
  }, [selectedCardData]);

  const getQuestion = async () => {
    dispatch(updateLoader(true));
    dispatch(updateSnackbar(initialSnackbar));
    const res = await fetch(`${process.env.REACT_APP_BASEURL}/mgmt/jobopening/${selectedCardData.id}/questions`, {
      headers: { "Countryid": props.selectCountry, "customerid": selectedCardData.customerId, "Portaltype": "JBPortal" }
    });
    const jsonData = await res.json();
    if (jsonData.code === 200) {
      const myData = jsonData.Questions;
      let updatedQuestions = myData.map((item, index) => {
        let isSubQuestionAvailable = item.subQuestion && item.subQuestion !== "null";
        let obj = {
          ...item,
          subQuestion: isSubQuestionAvailable ? Object.values(JSON.parse(item.subQuestion)) : [],
          value: [],
          isError: false,
        }
        return obj;
      });
      dispatch(updateLoader(false));
      setGetDetails(updatedQuestions);
      dispatch(updateSnackbar({ type: "success", message: "" }));
    } else {
      dispatch(updateLoader(false));
      dispatch(updateSnackbar({ type: "error", message: "" }));
    }
  };

  const onBlurHandler = () => {
    applyNowHandler();
  }

  const SaveAnswers = async (obj) => {
    dispatch(updateLoader(true));
    dispatch(updateSnackbar(initialSnackbar));
    const res = await fetch(`${process.env.REACT_APP_BASEURL1}/mgmt/jobboardportal/recruiter/${selectedCardData.customerId}/answers`, {
      method: "POST",
      body: JSON.stringify(obj),
      headers: { "content-type": "application/json", "Countryid": selectedCardData.countryId, "Portaltype": "JBPortal", "Customerid": selectedCardData.customerId }
    });
    const jsonData = await res.json();
    if (jsonData.code === 200) {
      dispatch(updateLoader(false));
      props.onReceivechildProps(false, "modal");
    } else {
      dispatch(updateLoader(false));
      dispatch(updateSnackbar({ type: "error", message: "" }));
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    let payLoad = [];
    getdetails.forEach(item => {
      if (item.type === QuestionTypes.MultiSelect) {
        if (item.value.length > 0) {
          let obj = {};
          obj.questionId = item.id.toString();
          obj.applicantId = applicantId;
          obj.answer = item.value;
          payLoad.push(obj);
        }
      } else {
        if (item.value.length > 0) {
          let obj = {};
          obj.questionId = item.id.toString();
          obj.applicantId = applicantId;
          obj.answer = [item.value];
          payLoad.push(obj);
        }
      }
    })
    if (payLoad.length > 0) {
      SaveAnswers(payLoad);
    } else {
      props.onReceivechildProps(false, "modal");
    }
  };

  const onChangeHandler = (data, type) => {
    if (type === "phone") {
      const regex = /^[0-9()+-\s\b]*$/;
      if (regex.test(data)) {
        let obj = JSON.parse(JSON.stringify(resumeObj));
        obj[type] = data.trimStart();
        formik.values[type] = data;
        setResumeObj(obj);
      }
    } else {
      let obj = JSON.parse(JSON.stringify(resumeObj));
      obj[type] = data.trimStart();
      formik.values[type] = data;
      setResumeObj(obj);
    }
  };

  const onQuestionHandler = (value, object, type) => {
    if (type !== QuestionTypes.MultiSelect) {
      object.value = value;
    } else {
      let index = object.value.findIndex(x => x === value);
      if (index !== -1) {
        object.value.splice(index, 1)
      } else {
        object.value.push(value)
      }
    }
    let updateObj = JSON.parse(JSON.stringify(getdetails));
    let updateObjIndex = updateObj.findIndex(x => x.id === object.id);
    if (updateObjIndex !== -1) {
      updateObj[updateObjIndex] = object;
      setGetDetails(updateObj);
    }
  }

  const submitHandler = () => {
    if (uploadFile && checked) {
      if (manualUpload) {
        formik.handleSubmit()
      } else if (resumeObj.firstName === "" || resumeObj.lastName === "") {
        dispatch(updateSnackbar({ type: "error", message: "Please complete first & last name before applying" }));
      }
      else {
        onBlurHandler();
      }
    } else if (uploadFile && !checked) {
      dispatch(updateSnackbar({ type: "error", message: "You must agree to the Terms and Conditions & Privacy Policy to proceed" }));
    } else if (uploadFile === null && !checked) {
      dispatch(updateSnackbar({ type: "error", message: "Please complete all required fields before applying" }));
    } else if (uploadFile === "" || uploadFile === null && checked) {
      dispatch(updateSnackbar({ type: "error", message: "Please upload file before applying" }));
    }
  }

  return (
    <>
      {isUploaded ? (
        <>
          <b className="ques">Questions</b>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={4} style={{ height: "100px" }}>
              <Grid item md={6} sm={12} xs={12}>
                <TextField
                  className="boldlabel"
                  id="outlined-basic"
                  autoComplete="off"
                  error={formik.errors.firstName && formik.touched.firstName ? true : false}
                  helperText={formik.errors.firstName && formik.touched.firstName ? formik.errors.firstName : ""}
                  InputLabelProps={{ shrink: true }}
                  label="First Name*&nbsp;"
                  variant="outlined"
                  style={{ width: "100%" }}
                  name="firstName"
                  onChange={(e) => onChangeHandler(e.target.value, "firstName")}
                  value={resumeObj.firstName}
                  onKeyUp={formik.handleBlur}
                  onBlur={formik.handleBlur}
                />
              </Grid>
              <Grid item md={6} sm={12} xs={12}>
                <TextField
                  className="boldlabel"
                  id="outlined-basic"
                  autoComplete="off"
                  error={formik.errors.lastName && formik.touched.lastName ? true : false}
                  helperText={ formik.errors.lastName && formik.touched.lastName ? formik.errors.lastName : "" }
                  InputLabelProps={{ shrink: true }}
                  label="Last Name*&nbsp;"
                  variant="outlined"
                  style={{ width: "100%" }}
                  name="lastName"
                  onChange={(e) => onChangeHandler(e.target.value, "lastName")}
                  value={resumeObj.lastName}
                  onKeyUp={formik.handleBlur}
                  onBlur={formik.handleBlur}
                />
              </Grid>
            </Grid>
          </Box>

          <div style={{ height: "calc(100vh - 550px)", display: "grid", alignItems: "center", marginTop: "20px" }}>
            {uploadFile && (
              <ul className="listofUploads">
                <li>
                  <p>{uploadFile.name}</p>
                  <span className="closeImgbtn" onClick={() => setUploadFile('')}><DeleteOutlineIcon /></span>
                </li>
              </ul>
            )}
          </div>
          <Button
            variant="contained"
            component="label"
            className="uploadSection"
            sx={{ border: `2px dashed ${props.styleData.headerColor}`, backgroundColor: "white", "&:hover": { backgroundColor: props.styleData.bodyColor } }}
          >
            <span>
              <b style={{ color: "var(--primary-bg-color)" }}>Upload </b>
              <b style={{ color: "#9E9E9E" }}> browse file to upload </b></span>
            <input
              hidden
              accept="file/*"
              type="file"
              id="fileId"
              onChange={(e) => uploadImgHandler(e)}
            />
          </Button>
          <p className="docsupporttext">
            Supported file formats: Doc, Pdf, Docx
          </p>
          <div className="upcheckbox" >
            <Checkbox checked={checked} onChange={handleChange} className='checkbox' style={{ color: props.styleData.headerColor }} />
            <h5 className="txt">
              I agree to Terms And Conditions & Privacy Policy governing the use of Hirewing
            </h5>
          </div>
          <Button
            className={uploadFile && checked ? "applybtnupcss" : "applybtnupcss disableapplybtnup"}
            sx={{ background: 'var(--primary-bg-color)', color: 'var(--primary-background-text-color)' }}
            size="medium"
            onClick={() => submitHandler()
            }>Apply Now</Button>
        </>
      ) : ("")}

      {questionPage === true ? (
        <div>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 2, width: '100%', overflowY: "auto", height: "calc(100vh - 239px)" },
            }}
            noValidate
            autoComplete="off"
          >
            <div className="textup">
              <div className="" style={{ margin: "10px 0" }}>
                {getdetails?.length > 0 &&
                  getdetails.map((item, i) => {
                    if (item.type === QuestionTypes.LongText) {
                      return (
                        <div style={{ position: "relative" }}>
                          <TextField
                            className="boldlabel"
                            multiline
                            rows={4}
                            id="outlined-basic"
                            label={i + 1 + ') ' + item.question}
                            variant="outlined"
                            style={{ width: "100%", marginBottom: "30px" }}
                            name={item.question}
                            onChange={(e) => onQuestionHandler(e.target.value, item, QuestionTypes.LongText)}
                            value={item.value.toString()}
                          />
                        </div>
                      )
                    }
                    else if (item.type === QuestionTypes.ShortText) {
                      return (
                        <div style={{ position: "relative" }}>
                          <TextField
                            className="boldlabel"
                            id="outlined-basic"
                            autoComplete="off"
                            label={i + 1 + ') ' + item.question}
                            variant="outlined"
                            style={{ width: "100%", marginBottom: "30px" }}
                            name={item.question}
                            onChange={(e) => onQuestionHandler(e.target.value, item, QuestionTypes.ShortText)}
                            value={item.value.toString()}
                          />
                        </div>
                      )
                    }
                    else if (item.type === QuestionTypes.MultiSelect) {
                      let keys = Object.keys(item.subQuestion);
                      return (
                        <div style={{ position: "relative" }}>
                          <div className="QueOptionSection">
                            <h4 style={{ marginBottom: "15px" }}>{i + 1 + ') ' + item.question}</h4>
                            <br />
                            {keys.map((key, j) => (
                              <FormControl className="customFormGroup">
                                <FormControlLabel key={j} style={{ width: "fit-content" }}
                                  onChange={(e) => onQuestionHandler(item.subQuestion[key], item, QuestionTypes.MultiSelect)}
                                  control={<Checkbox size="small" checked={item.value.includes(item.subQuestion[key]) ? true : false} />}
                                />
                                <span>{item.subQuestion[key]}</span>
                              </FormControl>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    else if (item.type === QuestionTypes.SingleSelect) {
                      let keys = Object.keys(item.subQuestion);
                      return (
                        <div style={{ position: "relative" }}>
                          <div className="QueOptionSection">
                            <h4>{i + 1 + ') ' + item.question}</h4>
                            <RadioGroup name="radio-buttons-group" className="customRadioGroup"
                              value={item.value}
                              onChange={(e, value) => onQuestionHandler(value, item, QuestionTypes.SingleSelect)}
                            >
                              {keys.map((key, j) => (
                                <FormControlLabel
                                  key={j}
                                  value={item.subQuestion[key]}
                                  control={<Radio size="small" />}
                                  label={item.subQuestion[key]}
                                />
                              ))}
                            </RadioGroup>
                          </div>
                        </div>
                      )
                    }
                  })}
              </div>

            </div>
            <div style={{ display: "flex", justifyContent: "end", margin: "0px" }}>
              <Button
                variant=""
                className="applybtnupcsss"
                onClick={(e) => {
                  handleSubmit(e);
                }}
              >
                Submit
              </Button>
            </div>

          </Box>

        </div>
      ) : (
        ""
      )}

      {manualUpload === true ? (
        <>
          <div className="forms-fields-container">
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={4}>
                <Grid item md={6} sm={12} xs={12}>
                  <TextField
                    className="boldlabel"
                    id="outlined-basic"
                    autoComplete="off"
                    error={ formik.errors.firstName && formik.touched.firstName ? true : false }
                    helperText={formik.errors.firstName && formik.touched.firstName ? formik.errors.firstName : "" }
                    InputLabelProps={{ shrink: true }}
                    label="First Name*&nbsp;"
                    variant="outlined"
                    style={{ width: "100%" }}
                    name="firstName"
                    onChange={(e) => onChangeHandler(e.target.value, "firstName")}
                    value={resumeObj.firstName}
                    onBlur={formik.handleBlur}
                  />
                </Grid>
                <Grid item md={6} sm={12} xs={12}>
                  <TextField
                    className="boldlabel"
                    id="outlined-basic"
                    autoComplete="off"
                    error={ formik.errors.lastName && formik.touched.lastName ? true : false }
                    helperText={ formik.errors.lastName && formik.touched.lastName ? formik.errors.lastName : "" }
                    InputLabelProps={{ shrink: true }}
                    label="Last Name*&nbsp;"
                    variant="outlined"
                    style={{ width: "100%" }}
                    name="lastName"
                    onChange={(e) => onChangeHandler(e.target.value, "lastName")}
                    value={resumeObj.lastName}
                    onBlur={formik.handleBlur}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ flexGrow: 1 }} style={{ marginTop: "30px" }}>
              <Grid container spacing={4} style={{ height: "100px" }}>
                <Grid item md={6} sm={12} xs={12}>
                  <TextField
                    className="boldlabel"
                    onBlur={formik.handleBlur}
                    id="outlined-basic"
                    autoComplete="off"
                    error={ formik.errors.phone && formik.touched.phone ? true : false }
                    helperText={ formik.errors.phone && formik.touched.phone ? formik.errors.phone : "" }
                    InputLabelProps={{ shrink: true }}
                    label="Contact Number*&nbsp;"
                    variant="outlined"
                    style={{ width: "100%" }}
                    name="phone"
                    onChange={(e) => onChangeHandler(e.target.value, "phone")}
                    value={resumeObj.phone}
                  />
                </Grid>
                <Grid item md={6} sm={12} xs={12}>
                  <TextField
                    className="boldlabel"
                    id="outlined-basic"
                    autoComplete="off"
                    error={ formik.errors.emailId && formik.touched.emailId ? true : false}
                    helperText={ formik.errors.emailId && formik.touched.emailId ? formik.errors.emailId : ""}
                    InputLabelProps={{ shrink: true }}
                    label="E-mail*&nbsp;"
                    variant="outlined"
                    style={{ width: "100%" }}
                    name="emailId"
                    onChange={(e) => onChangeHandler(e.target.value, "emailId")}
                    value={resumeObj.emailId}
                    onBlur={formik.handleBlur}
                  />
                </Grid>
              </Grid>
            </Box>
          </div>

          <div style={{ height: "calc(100vh - 639px)", margin: "12px", display: "grid", alignItems: "center" }}>
            {uploadFile && (
              <ul className="listofUploads">
                <li>
                  <p>{uploadFile.name}</p>
                  <span className="closeImgbtn" onClick={() => setUploadFile('')}><DeleteOutlineIcon /></span>
                </li>
              </ul>
            )}
          </div>
          <Button
            variant="contained"
            component="label"
            className="uploadSection"
            sx={{ border: `2px dashed ${props.styleData.headerColor}`, backgroundColor: "white", "&:hover": { backgroundColor: props.styleData.bodyColor } }}
          >
            <span>
              <b style={{ color: props.styleData.headerColor ? props.styleData.headerColor : "#FFD800" }}>Upload </b>
              <b style={{ color: "#9E9E9E" }}> browse file to upload </b></span>
            <input
              hidden
              accept="file/*"
              type="file"
              id="fileId"
              onChange={(e) => uploadImgHandler(e)}
            />
          </Button>
          <p className="docsupporttext">
            Supported file formats: Doc, Pdf, Docx
          </p>
          <div className="upcheckbox">
            <Checkbox checked={checked} onChange={handleChange} className='checkbox' style={{ color: props.styleData.headerColor }} />
            <h5 className="txt" >
              I agree to Terms And Conditions & Privacy Policy governing the use of Hirewing
            </h5>
          </div>
          <Button
            className={uploadFile && checked ? "applybtnupcss" : "applybtnupcss disableapplybtnup"}
            sx={{ background: 'var(--primary-bg-color)', color: 'var(--primary-background-text-color)' }}
            size="medium"
            onClick={() => submitHandler()
            }>Apply Now</Button>
        </>
      ) : ("")}
    </>
  );
};