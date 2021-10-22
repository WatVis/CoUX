import React from "react";
import { Input } from "antd";
import "../styles/components/search.scss";

const { Search } = Input;

export const SearchBox = ({ width }) => (
  <Search
    placeholder="input search text"
    onSearch={(value) => console.log(value)}
    className="search-box"
    style={{ width }}
  />
);

SearchBox.defaultProps = {
  width: "300px",
};

export default SearchBox;
