import React, { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { vendorMenus, BreadCrumbObj } from './layoutdata';
import { useNavigate, useLocation } from 'react-router-dom';
import GetJobId from '../_utilities/GetJobId';

function NavSidebar({ drawerWidth, menuList, menuType }) {
    const [activeMenu, setActiveMenu] = useState(null)
    const location = useLocation();
    const navigate = useNavigate();
    const getJobId = GetJobId();


    const onNavigateHandle = (item) => {
        setActiveMenu(item.menuName);
        navigate(`${item.url}/${getJobId}`);
    }

    useEffect(() => {
        const url = location.pathname;
        let comparePath = removelastSlash(url);
        let filteredData = vendorMenus.filter(x => x.url === comparePath || x.urls === comparePath);

        if(filteredData.length > 0){
            setActiveMenu(filteredData[0].menuName);
        } else{
            setActiveMenu(null);
        }
    }, [location])

    const removelastSlash = (str) => {
        let path = str.replace("/jobboardportal/jobfeed", "");
        return path.slice(0, path.lastIndexOf('/'));
    }

    return (
        <>
            {menuList !== null ?
                <Drawer variant="permanent" className="navbarSection" sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', top: "70px", width: drawerWidth, boxShadow: "0px 3px 6px #00000029" } }} open >
                    {menuType === 'jobfeed' ?
                        <div className="navbarHedding">
                            <img src={"/static/assests/img/suitcase.svg"} alt="suitcase" className="postingSuitcase" />Admin Panel
                        </div>
                       : ''
                    }
                    <List>
                        {menuList && menuList.map((item, index) => (
                            <ListItem key={index} onClick={() => onNavigateHandle(item)} className={(activeMenu === item.menuName) ? 'active navbarList' : 'navbarList'}>
                                <ListItemButton>
                                    <img src={(activeMenu === item.menuName) ? item.activeImg : item.img} alt={item.menuName} />
                                    <ListItemText primary={item.menuName} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Drawer> : null
            }
        </>
    );
}

export default NavSidebar;