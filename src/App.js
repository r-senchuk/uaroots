import "bulma/css/bulma.css";
import "./App.css";
import TransporterList from "./components/TransporterList";
// import HeaderRow from "./components/HeaderRow";
import SearchBar from "./components/SearchBar";
import searchImages from "./api";
import { useState } from "react";

function App() {
  const [images, setImage] = useState();

  const handleSearchSubmit = async (term) => {
    const result = await searchImages(term);

    setImage(result);
  }

  return (
    <div className="container">
      <SearchBar onSubmit={handleSearchSubmit}></SearchBar>
      {/* {/* <HeaderRow></HeaderRow> */}
      <TransporterList images={images}></TransporterList>
    </div>
  );
}

export default App;
