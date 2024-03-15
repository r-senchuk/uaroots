import { useState } from "react";
export default function SearchBar({onSubmit}) {

  const [term, setTerm] = useState('');
  const handleChange = (e) => {
    setTerm(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(term);
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <input value={term} type="text" onChange={handleChange} />
      </form>
    </div>
  );

}
