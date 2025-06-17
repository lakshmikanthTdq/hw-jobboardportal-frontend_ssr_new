import React, { useState, useEffect } from 'react'
import './RightSideBar.css'



const RightSideBar = (props) => {

  const { componentLayout } = props
  const [styleData, setStyleData] = useState(JSON.parse(localStorage.getItem("styleData")));

  useEffect(() => {
    if (props.onReceivechildProps !== undefined) {
      console.log(props.onReceivechildProps);
    }
  }, [props.onReceivechildProps])

  return (
    <>
      <section className="sidebarBg">
        <div className='sidebar'>
          <div className='headertext'>
            <p className={componentLayout.pageName === "vendorportal" ? "heading1" : ""}>{componentLayout.title}</p>
            <img src={"/static/assests/img/close.svg"} alt="" className='closeicon' onClick={() => props.onReceiveProps(false, "close")} />
          </div>

          <div className="contentSection">
            {componentLayout.description.length > 0 && <h6>{componentLayout.description}</h6>}
            <article>
              {props.componentData}
            </article>
          </div>

          <footer>
            <div className={componentLayout.pageName === "vendorportal" ? "bottomBox" : ""} />
            <img src={componentLayout.bgImage} alt={componentLayout.bgImage} />
          </footer>
        </div>
      </section>
    </>
  )
}

export default RightSideBar;