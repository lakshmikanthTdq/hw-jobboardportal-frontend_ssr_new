import { React, useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { Outlet } from "react-router-dom";
import Loader from '../components/Loader/Loader';
import MessageBar from '../components/SnackBar/MessageBar';
import Header from "./Header";
import PageNotFound from '../pages/PageNotFound/PageNotFound';
import { decryptParams, parseParamsString } from '../_utilities/Encrypt_decrypt';
import {  useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateLoader } from "../_redux/LoaderSlice";
import { initUserSession } from "../_utilities/Cognito";

function Layout() {

  const [isJobPortal, setIsJobPortal] = useState(false);

  const showLoader = useSelector((state) => state.Loader.value);
  const showMessage = useSelector((state) => state.Snackbar.message);
  const showMsgType = useSelector((state) => state.Snackbar.type);

  const { key: paramsKey } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    initUserSession();
  }, []);

  useEffect(() => {
      if (paramsKey) {
        const decryptedValue = decryptParams(paramsKey);
        const parsedParams = parseParamsString(decryptedValue);
        if(parsedParams) {
          getData(parsedParams.customerId, parsedParams.segmentId);
          
        }
      }
    }, [paramsKey]);

  const getData = async (id, segmentId) => {
    dispatch(updateLoader(true));
    const res = await fetch(`${process.env.REACT_APP_BASEURL3}/mgmt/customers/jobBoard`, {
      method: "GET",
      headers: { 'Content-Type': 'Application/json', "customerId": id },
    });
    const jsonData = await res.json();
    if (jsonData?.Data?.jobBoard.length > 0) {
      let newData = jsonData.Data.jobBoard.filter(x => x.segmentId === segmentId);
      setIsJobPortal(newData?.length > 0 && newData[0]?.isJobPortal ? newData[0].isJobPortal : false);
    }
    dispatch(updateLoader(false));
  };

  return (
    <>
     { isJobPortal ? (
    <div>
      <Header />
      {showMessage !== "" ? <MessageBar message={showMessage} type={showMsgType} /> : ''}
      {showLoader ? <Loader /> : ''}
      <div style={{ maxHeight: "calc(100vh - 1px)", overflow: "auto", flexDirection: "column"}}>
        <div style={{ minWidth: "90%", boxSizing: "border-box" }}>
          <div style={{ minHeight: "auto", position: "relative", overflow: "auto", overflowX: "hidden" }}>
            <div style={{ minHeight: "calc(100vh - 231px)" }}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
     ) : <PageNotFound/> }
    </>
  );
}

export default Layout;

