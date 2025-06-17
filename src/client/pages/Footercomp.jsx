
import React, { useEffect,useState } from 'react'
import  {Dummy,Dummy1}  from '../pages/JobFeedPage/jobsData';
import { Link } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";




function Footercomp() {
  const [styleData, setStyleData] = useState("");
  const userDetails = useSelector((state) => state.Auth);

  useEffect(()=>{

    
    if(userDetails && userDetails.layoutStyleData !== "" && userDetails.headerPreviewImg !== ""){
      let adminData = JSON.parse(userDetails.layoutStyleData);
      let adminImage = JSON.parse(userDetails.headerPreviewImg);

      if(adminData && adminImage){

   let styleObj = {
    headerColor : adminData.primaryData[0].value,
    bodyColor : adminData.primaryData[1].value,
    typographyMain : adminData.typography[0], 
    typographyBody : adminData.typography[0], 
  }
  setStyleData(styleObj)
}
}
  },[userDetails])

  return (
    <div className="footercomp" style={{background: styleData.bodyColor ? styleData.bodyColor: "#3B4046"}}>
    <ul>
      {Dummy.map((item) => {
        return (
          <li>
            <Link style={{ color: "white",fontSize: 20, font: "roboto", fontWeight: 400  }} href={item.url}>{item.name}</Link>

          </li>
        );
      })}
    </ul>
    <div className='yellowbottom' style={{background: styleData.headerColor ? styleData.headerColor: "#FFD800"}} >
    © 2022 HireWing
    </div>
  
  </div>
  )
}

export default Footercomp
