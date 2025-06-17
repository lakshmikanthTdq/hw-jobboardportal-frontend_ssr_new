//DynamicTable.jsx

import React, { useState, memo, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import SearchBar from "material-ui-search-bar";
import Pagination from "./Pagination";
import Button from "@mui/material/Button";
import { Encrypt } from "../../_utilities/GetSubPath";
import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { updateSnackbar } from "../../_redux/SnackbarSlice";
import "./DynamicTableStyle.css";
import Menu from "@mui/material/Menu";
import CardsView from "./CardsView";

// Icons
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";

import { useDispatch } from "react-redux";
import { updateJobCode } from "../../_redux/SeletedJobCodeSlice";

const DynamicTable = ({
  config,
  data,
  colmns,
  actionDropdown,
  filterValue,
  actions,
  noDataText,
  onReceiveActionProps,
  searchKeyWord,
  addModel
}) => {
  const [tableData, setTableData] = useState(data);
  console.log("in render:", tableData);
  const [checked, setChecked] = useState(false);
  const [action, setAction] = useState("All");
  const [deleteId, setDeleteId] = useState(null);
  const [searchValue, setSearchValue] = useState(filterValue);
  const [isInterminate, setIsInterminate] = useState(false);
  const tableRawData = JSON.stringify(data)
  const currentPage = config.currentPage

  const [open, setOpen] = useState(false);

  // for dynamicCards
  const [isTableView, setTsTableView] = useState(true);

  console.log(addModel);
  const handleClose = () => {
    setOpen(false);
    setDeleteId(null);
  };

  const usersPerPage = config.recordperPage;
  const totalRecords = config.totalRecords;
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const filteropen = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlefilterClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    console.log("searchValue", searchValue);
  }, [searchValue]);

  const onCheckedHandler = (e, displayUser) => {
    const data = JSON.parse(JSON.stringify(tableData));
    let index = data.findIndex((x) => x.id === displayUser.id);
    if (index !== -1) {
      data[index].isChecked = !data[index].isChecked;
      setTableData(data);
      isSelectAll("individual", e.target.checked, data);
    }
  };

  useEffect(() => {
    if (config.isPagingServer === false) {
      setTableData(data.slice(0, usersPerPage));
    }
  }, [config.isPagingServer]);

  useEffect(() => {
    console.log("checked", checked);
    isSelectAll("all", null, null);
  }, [checked]);

  useEffect(() => {
    console.log("tableData", tableData);
  }, [tableData]);

  const isSelectAll = (type, boolean, data) => {
    if (type === "all") {
      setIsInterminate(false);
    } else if (type === "individual") {
      setChecked(false);
    } else {
      let filterData = data.filter((x) => x.isChecked === boolean);
      if (filterData.length === data.length) {
        setIsInterminate(false);
      } else {
        setIsInterminate(true);
      }
    }
  };

  const handleChange = (event) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);
    let Data = tableData;
    Data.forEach((item) => {
      item.isChecked = isChecked;
      if (item.length <= 1) {
        setIsInterminate(false);
      }
    });
    setTableData(Data);
  };

  const onSearchhandler = (value, type) => {
    if (value !== "" && type !== "onChange") {
      value = value.trimStart();
      value = value.replace(/[^a-zA-Z0-9&%$/-_= ]/g, "");
      setSearchValue(value);
      if (config.isSearchServer === true) {
        if (value !== "" && value.length > 2) {
          let obj1 = {
            current:
              config.currentPage !== 1
                ? (config.currentPage - 1) * config.limitData + 1
                : config.currentPage,
            keyword: value,
          };
          onReceiveActionProps("searchResult", obj1);
        } else if (value === "") {
          onReceiveActionProps("cancelSearchResult", null);
        }
      } else {
        const rawData = JSON.parse(tableRawData);
        if (value.length > 2) {
          let data1 = rawData.filter((x) =>
            Object.keys(x).some((k) =>
              String(x[k]).toLowerCase().includes(value.toLowerCase())
            )
          );
          if (data1.length > 0) {
            setTableData(data1.slice(0,usersPerPage));
            config.currentPage = 1;
            config.totalCount = data1.length;
            config.totalRecords = data1.length;
          } else {
            setTableData("");
          }
        } else {
          setTableData(rawData);
        }
      }
    } else if (value === "" && config.isSearchServer === true) {
      onReceiveActionProps("cancelSearchResult", null);
    } else if (value === "" && config.isSearchServer === false) {
      setTableData(JSON.parse(tableRawData));
    }
  };

  const onSelectActionHandler = (type) => {
    setAction(type);
    if (type === "Delete") {
      setOpen(false);
      let getData = tableData.filter((user) => user.isChecked === true);
      if (getData.length > 0) {
        setOpen(true);
        setDeleteId(getData);
      } else {
        dispatch(
          updateSnackbar({ type: "error", message: "No Record Selected" })
        );
      }
      setTimeout(() => {
        setAction("All");
      }, 100);
    } else if (type === "Submitted" || type === "Rejected" || type === "All") {
      let initialTableData = JSON.parse(tableRawData);
      let getData = [];
      if (type !== "All") {
        getData = initialTableData.filter((user) => user.candiateStatus === type);
       
      } else { getData = initialTableData }
      setTableData(getData.slice(0,usersPerPage));
      config.currentPage = 1;
      config.totalCount = getData.length;
      config.totalRecords = getData.length;
    }
  };

  const handleActionClick = (obj, type) => {
    if (type === "edit") {
      dispatch(updateJobCode(obj));
      let Name = obj.jobTitle ? obj.jobTitle :
        obj.firstName ? obj.firstName :
          obj.clientName ? obj.clientName :
            obj.Title ? obj.Title : ''


      if (obj.nagigate !== 'detailspage') {
        Encrypt(Name);
        navigate(`${obj.nagigate}/${obj.id}`);
      } else {
        onReceiveActionProps("detailspage", obj);
      }
    } else if (type === "delete") {
      setOpen(true);
      setDeleteId(obj);
    } else if (type === "confirmDel" && deleteId !== null) {
      setOpen(false);
      onReceiveActionProps(type, deleteId);
    } else if (type === "download") {
      onReceiveActionProps(type, obj);
    } else if (type === "pagination" && config.isPagingServer === true) {
      let obj1 = {
        current: obj,
        offset: obj !== 1 ? (obj - 1) * config.limitData + 1 : config.limitData,  //obj
      };
      onReceiveActionProps(type, obj1);
    } else if (type === "pagination" && config.isPagingServer === false) {
      let DataNew = JSON.parse(tableRawData);
      // setTableData(DataNew.slice((((obj - 1) * usersPerPage) + ((obj === 1) ? 0 : 1)), ((obj * usersPerPage) + ((obj === 1) ? 0 : 1))));
      setTableData(DataNew.slice((obj - 1) * usersPerPage, obj * usersPerPage));
      config.currentPage = obj;
    }
  };


  const onCardviewHandler = {
    onCheckedHandler: onCheckedHandler,
    handleActionClick: handleActionClick,
    onSearchhandler: onSearchhandler,
  }

  return (
    <>
      {isTableView ?
        <>
          <div className="searchingkeyword"
            style={{
              display: "flex",
              justifyContent: "space-between",
              height: "100px",
              alignItems: "center",
              flexDirection: "row-reverse"
            }}
          >
            <FormControl style={{ textDecorationColor: "black", width: "32%", alignItems: "end" }}>
              {config.isDropdownActions ? (
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  autoComplete="off"
                  className="actionDropdown"
                  value={action}
                  label=""
                  style={{ paddingLeft: "20px", width: "242px" }}
                  onChange={(e) => onSelectActionHandler(e.target.value)}
                >
                  {actionDropdown.map((list, i) => (
                    <MenuItem
                      style={{
                        display: "grid",
                        justifyContent: "left",
                        padding: "6px 30px",
                        cursor: "pointer",
                        width: "242px",
                      }}
                      key={i}
                      value={list}
                    >
                      {list}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                ""
              )}
            </FormControl>
            <div style={{ height: "48px", marginTop: "5px", width: "32%", textAlign: "-webkit-left" }}>
              {config.isSearchbar ? (
                <SearchBar
                  className="SearchBar"
                  autoComplete="off"
                  autoFocus
                  onChange={(newValue) =>
                    onSearchhandler(newValue.slice(0, 20), "onChange")
                  }
                  onRequestSearch={(newValue) =>
                    onSearchhandler(newValue.slice(0, 20), "onRequestSearch")
                  }
                  onCancelSearch={() => onSearchhandler("", "onCancelSearch")}
                  placeholder=
                  {searchKeyWord}
                  value={searchValue}
                />
              ) : (
                ""
              )}
            </div>
            {/* <div style={{ width: "32%" }}></div> */}
            {/* <div>
          {config.isPaging && config.isPaginationTop ? (
            <Pagination
              className="pagination-bar"
              currentPage={currentPage}
              totalCount={totalRecords}
              pageSize={usersPerPage}
              onPageChange={(page) => handleActionClick(page, "pagination")}
            />
          ) : (
            ""
          )}
        </div> */}
            {/* <div style={{width: "250px", textAlign: "right", marginTop: "18px"}}>
          {addModel.displayName && (
            <div className="addicon" style={{ marginBottom: "15px" }}
              onClick={() => navigate(addModel.url)}>
              <img src="/assests/img/Group 2196.png" alt="" />
              <h4 style={{ marginLeft: "9px", marginLeft: "9px", fontFamily: "Roboto", fontWeight: "400", fontSize: "18px", color: "#3B4046" }} >
                {" "}
                {addModel.displayName}
              </h4>
            </div>
          )}
        </div> */}
          </div>
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 700 }}
              aria-label="customized table"
              className="customizedTable"
            >
              <TableHead>

                <TableRow>

                  {config.isCheckbox ? (

                    <StyledTableCell
                      style={{ width: 50 }}
                      className={config.ischeckAlignRight ? "col-align-right" : ""}
                    >

                      {tableData.length !== 0 && (
                        <Checkbox
                          checked={checked ? true : false}
                          onChange={handleChange}
                          indeterminate={isInterminate}
                        />
                      )}
                    </StyledTableCell>

                  ) : (
                    ""

                  )}
                  {colmns.map((list, k) => {
                    // eslint-disable-next-line
                    if (list.displayName !== "Action") {
                      return (
                        <StyledTableCell
                          key={k}
                          className={list.theadClass}
                          width={list.width}
                        >
                          {list.mappingName === " " ? (
                            <>

                              {" "}
                              {list.displayName}
                              <FilterListIcon
                                fontSize="small"
                                style={{
                                  verticalAlign: "text-top",
                                  marginLeft: "12px",
                                  cursor: "pointer",
                                }}
                                onClick={handleClick}
                              />
                              <Menu
                                anchorEl={anchorEl}
                                className="filterMenuList"
                                open={filteropen}
                                onClose={handlefilterClose}
                              >
                                <MenuItem
                                  onClick={(e) =>
                                    onSelectActionHandler("All Applicants")
                                  }
                                >
                                  All Applicants
                                </MenuItem>
                                <MenuItem
                                  onClick={(e) =>
                                    onSelectActionHandler("ATS Applicants")
                                  }
                                >
                                  ATS Applicants
                                </MenuItem>
                                <MenuItem
                                  onClick={(e) =>
                                    onSelectActionHandler("Job Portal Applicants")
                                  }
                                >
                                  Job Portal Applicants
                                </MenuItem>
                              </Menu>
                            </>
                          ) : (
                            list.displayName
                          )}
                        </StyledTableCell>
                      );
                    } else if (config.isActions && list.displayName === "Action") {
                      return (
                        <StyledTableCell key={k} className={list.theadClass}>
                          {list.displayName}
                        </StyledTableCell>
                      );
                    }
                  })}

                </TableRow>

              </TableHead>
              {typeof tableData !== "string" && tableData.length > 0 && (
                <TableBody>
                  {tableData.map((rowData, i) => (
                    <StyledTableRow key={i}>
                      {config.isCheckbox ? (
                        <StyledTableCell
                          component="th"
                          scope="row"
                          key={i}
                          className={
                            config.ischeckAlignRight ? "col-align-right" : ""
                          }
                        >
                          <Checkbox
                            checked={rowData.isChecked ? true : false}
                            onChange={(e) => onCheckedHandler(e, rowData)}
                          />
                        </StyledTableCell>
                      ) : (
                        ""
                      )}
                      {colmns.map((list, j) => {
                        if (list.displayName !== "Action" && list.isEdit === true) {
                          return (
                            <StyledTableCell
                              className={`${list.tbodyClass} activeRow`}
                              width={list.width}
                              key={j}
                            >
                              <span  onClick={() => handleActionClick({ ...list, ...rowData }, "edit")}>
                                {rowData[list.mappingName]}
                              </span>
                            </StyledTableCell>
                          );
                        } else if (
                          list.displayName !== "Action" &&
                          list.isEdit !== true
                        ) {
                          return (
                            <StyledTableCell
                              className={list.tbodyClass}
                              width={list.width}
                              key={j}
                              style={{ cursor: "pointer" }}
                            >
                              <span
                                className={rowData[list.mappingName] === "Submitted" ? "Success" : rowData[list.mappingName] === "Rejected" ? "Rejected" : rowData[list.mappingName] === "Approved" ? "Approved" : ""}
                              > {rowData[list.mappingName]}</span>
                            </StyledTableCell>
                          );
                        } else if (
                          config.isActions &&
                          list.displayName === "Action"
                        ) {
                          return (
                            <StyledTableCell
                              className={list.tbodyClass}
                              key={j}
                              width={list.width}
                            >
                              <div className="postingdocumentsicons">
                                {actions.isDownload ? (
                                  <Button
                                    variant="icon"
                                    className="downloadicon"
                                    style={{ marginRight: "10px" }}
                                    onClick={() =>
                                      handleActionClick(rowData, "download")
                                    }
                                  >
                                    <SaveAltIcon />
                                  </Button>
                                ) : (
                                  ""
                                )}
                                {actions.isDelete ? (
                                  <Button
                                    variant="icon"
                                    className="deleteicon"
                                    onClick={() =>
                                      handleActionClick(rowData.id, "delete")
                                    }
                                  >
                                    <DeleteIcon />
                                  </Button>
                                ) : (
                                  ""
                                )}
                              </div>
                            </StyledTableCell>
                          );
                        }
                      })}
                    </StyledTableRow>
                  ))}
                </TableBody>
              )}
              {typeof tableData === "string" && (
                <StyledTableRow>
                  <StyledTableCell
                    colSpan={config.isCheckbox ? colmns.length + 1 : colmns.length}
                  >
                    <div className="nodatasection">
                      {/* <img src={process.env.PUBLIC_URL + "/assests/img/NoResult.svg"} alt="noResult" /> */}
                      <img src={"/static/assests/img/NoResult.svg"} alt="noResult" />
                      No match Found
                    </div>
                  </StyledTableCell>
                </StyledTableRow>
              )}
              {typeof tableData !== "string" && tableData.length === 0 && (
                <StyledTableRow>
                  <StyledTableCell
                    colSpan={config.isCheckbox ? colmns.length + 1 : colmns.length}
                  >
                    <div className="nodatasection">
                      {/* <img src={process.env.PUBLIC_URL + "/assests/img/nodata.svg"} alt="noData" /> */}
                      <img src={"/static/assests/img/nodata.svg"} alt="noData" />
                      {noDataText}
                    </div>
                  </StyledTableCell>
                </StyledTableRow>
              )}
            </Table>
          </TableContainer>
          <div className="pagingRight">
            {/* {config.isPaging && !config.isPaginationTop ? (
          <Pagination
            className="pagination-bar"
            currentPage={currentPage}
            totalCount={totalRecords}
            pageSize={usersPerPage}
            onPageChange={(page) => handleActionClick(page, "pagination")}
          />
        ) : (
          ""
        )} */}
            <Pagination
              className="pagination-bar"
              currentPage={currentPage ? currentPage : 0}
              totalCount={totalRecords}
              pageSize={usersPerPage}
              onPageChange={(page) => handleActionClick(page, "pagination")}
            />
          </div>
        </> :
        <>
          <CardsView data={tableData}
            colmns={colmns}
            config={config}
            actions={actions}
            noDataText={noDataText}
            events={onCardviewHandler}
            searchKeyWord={searchKeyWord}
            searchValue={searchValue}
          />
        </>
      }

      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog"
        style={{ marginTop: "-26%" }}
      >
        <Box sx={{ width: "395px" }}>
          <DialogTitle className="diabtn">Confirm</DialogTitle>
          <DialogContent>
            <DialogContentText className="diabtnjob" id="alert-dialog">
              <p className="btntext">Are you sure you want to delete ?</p>
            </DialogContentText>
          </DialogContent>
          <DialogActions className="alert-actionbtns">
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={() => handleActionClick(null, "confirmDel")}>
              Delete
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default memo(DynamicTable);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    paddingTop: "14px",
    paddingBottom: "14px",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    paddingTop: "11px",
    paddingBottom: "11px",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));
