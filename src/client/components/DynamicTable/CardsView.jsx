import React, { memo, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchBar from "material-ui-search-bar";

import "./CardsView.css";

const CardsView = ({ data, config, events, colmns, actions, noDataText, searchKeyWord, searchValue }) => {

    const [tableData, setTableData] = useState(data);

    return (
        <>
            <div style={{ height: "65px", marginTop: "5px", width: "28%", textAlign: "-webkit-center" }}>
                {config.isSearchbar ? (
                    <SearchBar
                        className="SearchBar"
                        autoComplete="off"
                        autoFocus
                        onChange={(newValue) => events.onSearchhandler(newValue.slice(0, 20), "onChange")}
                        onRequestSearch={(newValue) => events.onSearchhandler(newValue.slice(0, 20), "onRequestSearch")}
                        onCancelSearch={() => events.onSearchhandler("", "onCancelSearch")}
                        placeholder={searchKeyWord}
                        value={searchValue}
                    />
                ) : (
                    ""
                )}
            </div>
            {typeof tableData !== "string" && tableData.length > 0 && (
                <>
                    {tableData.map((rowData, i) => (
                        <div className="tableCards">
                            <ul key={i}>
                                {config.isCheckbox ? (
                                    <Checkbox
                                        checked={rowData.isChecked ? true : false}
                                        onChange={(e) => events.onCheckedHandler(e, rowData)}
                                    />
                                ) : ("")}
                                {colmns.map((list, j) => {
                                    if (list.displayName !== "Action" && list.isEdit === true) {
                                        return (
                                            <li key={j}
                                                onClick={() =>
                                                    events.handleActionClick({ ...list, ...rowData }, "edit")
                                                }
                                            >
                                                <label>{list.mappingName}</label> {rowData[list.mappingName]}
                                            </li>
                                        );
                                    } else if (
                                        list.displayName !== "Action" &&
                                        list.isEdit !== true
                                    ) {
                                        return (
                                            <li key={j}><label>{list.mappingName}</label>
                                                <span
                                                    className={rowData[list.mappingName] === "Submitted" ? "Success" : rowData[list.mappingName] === "Rejected" ? "Rejected" : ''}
                                                > {rowData[list.mappingName]}</span>
                                            </li>
                                        );
                                    } else if (
                                        config.isActions &&
                                        list.displayName === "Action"
                                    ) {
                                        return (
                                            <li className={list.tbodyClass}
                                                key={j}><label>{list.mappingName}</label>
                                                <div className="postingdocumentsicons">
                                                    {actions.isDownload ? (
                                                        <Button
                                                            variant="icon"
                                                            className="downloadicon"
                                                            style={{ marginRight: "10px" }}
                                                            onClick={() =>
                                                                events.handleActionClick(rowData, "download")
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
                                                                events.handleActionClick(rowData.id, "delete")
                                                            }
                                                        >
                                                            <DeleteIcon />
                                                        </Button>
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    }
                                })
                                }
                                {typeof tableData === "string" && (
                                    <li><div className="nodatasection">
                                        {/* <img src={process.env.PUBLIC_URL + "/assests/NoResult.svg"} alt="noResult" /> */}
                                        <img src={"/static/assests/NoResult.svg"} alt="noResult" />
                                        No match Found
                                    </div></li>
                                )}
                                {typeof tableData !== "string" && tableData.length === 0 && (
                                    <li>
                                        <div className="nodatasection">
                                            {/* <img src={process.env.PUBLIC_URL + "/assests/nodata.svg"} alt="noData" /> */}
                                            <img src={"/static/assests/nodata.svg"} alt="noData" />
                                            {noDataText}
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                    ))}
                </>
            )
            }
        </>
    )
}

export default memo(CardsView);