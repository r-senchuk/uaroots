import "bulma/css/bulma.css";
import "./App.css";
import TransporterList from "./components/TransporterList";
import BookCreate from "./components/BookCreate";
import SearchBar from "./components/SearchBar";
import TransporterContext from "./context/transporter";
import searchImages from "./api";
import { useState, useEffect, useContext } from "react";

function App() {
  const { fetchTransporters } = useContext(TransporterContext);

  useEffect(() => {
    fetchTransporters();
  }, []);

  const [images, setImage] = useState();

  const createBook = (title) => {
    console.log("create book:", title);
  };

  const handleSearchSubmit = async (term) => {
    const result = await searchImages(term);

    setImage(result);
  };

  return (
    <div className="container">
      <SearchBar onSubmit={handleSearchSubmit}></SearchBar>
      <TransporterList></TransporterList>
      <BookCreate></BookCreate>
    </div>
  );
}

export default App;
