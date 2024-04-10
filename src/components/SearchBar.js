import "./SearchBar.css";
import { useState, useContext } from "react";
import TransporterContext from "../context/transporter";
export default function SearchBar({ onSubmit }) {
  const [term, setTerm] = useState("");
  const { transporters, setTransporterList } = useContext(TransporterContext);
  const handleChange = (e) => {
    setTerm(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setTransporterList(transporters.filter((tp) => tp.name.includes(term)));
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleFormSubmit}>
        <div className="field has-addons">
          <div className="control">
            <input
              className="input"
              value={term}
              onChange={handleChange}
              type="text"
              placeholder="Пошук перевізника"
            />
          </div>
          <div className="control">
            <button type="submit" className="button is-primary">
              Знайти
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
