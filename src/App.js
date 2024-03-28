import "bulma/css/bulma.css";
import "./App.css";
import SearchBar from "./components/SearchBar";
import TransporterList from "./components/TransporterList";

function App() {

  return (
    <div className="container">
      <SearchBar></SearchBar>
      <TransporterList></TransporterList>
    </div>
  );
}

export default App;
