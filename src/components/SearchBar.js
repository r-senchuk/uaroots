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
    setTransporterList(
      transporters.filter((tp) => tp.name.includes(term))
    );
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleFormSubmit}>
        <label>Пошук перевізника</label>
        <input value={term} type="text" onChange={handleChange} />
        <button type="submit">Знайти</button>
      </form>
    </div>
  );
}
