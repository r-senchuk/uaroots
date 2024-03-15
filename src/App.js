import "bulma/css/bulma.css";
import "./App.css";
// import TransporterRow from "./components/TransporterRow";
// import HeaderRow from "./components/HeaderRow";
import SearchBar from "./components/SearchBar";
import searchImages from "./api";

function App() {

  const handleSearchSubmit = async (term) => {
    const result = await searchImages(term);

    console.log(result);
  }

  return (
    <div className="container">
      <SearchBar onSubmit={handleSearchSubmit}></SearchBar>
      {/* <HeaderRow></HeaderRow>
      <TransporterRow isPrimary={true}></TransporterRow>
      <TransporterRow></TransporterRow>
      <TransporterRow isPrimary={true}></TransporterRow>
      <TransporterRow></TransporterRow> */}
    </div>
  );
}

export default App;
