// eslint-disable-next-line
import React, { useState, useEffect } from "react";

import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateJobCode } from '../_redux/SeletedJobCodeSlice.js';


const GetJobId = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const [id, setId] = useState(null);
  const JobId = useSelector((state) => state.SeletedJobCode.value);


  useEffect(() => {
    let path = location.pathname;
    let params = JobId ? JobId : parseInt(path.substring(path.lastIndexOf('/') + 1));
    // eslint-disable-next-line
    dispatch(updateJobCode(params));
    setId(params)
  }, [location]);
  return id;
};

export default GetJobId;