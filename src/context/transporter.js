import { useState, createContext } from "react";

const TransporterContext = createContext();

function Provider({ children }) {
  const [transporter, setTransporter] = useState([]);

  const fetchTransporters = () => {
    console.log("fetchTransporters");
    setTransporter([]);
  };

  const editTransporters = () => {
    console.log("editTransporters");
    setTransporter([]);
  };

  const createTransporters = () => {
    console.log("createTransporters");
    setTransporter([]);
  };

  return (
    <TransporterContext.Provider
      value={{
        transporter,
        fetchTransporters,
        editTransporters,
        createTransporters,
      }}
    >
      {" "}
      {children}{" "}
    </TransporterContext.Provider>
  );
}

export { Provider };
export default TransporterContext;
