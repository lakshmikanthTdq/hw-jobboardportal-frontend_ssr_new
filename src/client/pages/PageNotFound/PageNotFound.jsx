import React from 'react';
import './PageNotFound.css'
import { Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

const PageNotFound = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();
  console.log(error);
  return (
    <div className='pageNotfound'>
      <div className="pageNotfoundContent">
        <img src={"/static/assests/img/pagenotfound.png"} width="800px" />
        <h1>Page Not Found</h1>
        <p>{error?.message ? error.message : ''}</p>
        <Button variant="contained" className="saveerror"
          onClick={() => {
            navigate('/jobboardportal/jobfeed');
            // window.location.reload();
          }} >
          Home
        </Button>
      </div>
      <div className="corners"></div>
    </div>
  )
}

export default PageNotFound