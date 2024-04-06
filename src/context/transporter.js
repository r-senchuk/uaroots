import { useState, createContext, useCallback } from "react";
import data from "transporters.json";

// const TRANSPORTERS_ADDRESS = "https://s3.eu-central-1.amazonaws.com/uaroute.com/transporter.json";
const NAV_SETUP_DEFAULT = {
  title: "Пасажирські перевезення",
  subtl: "Список перевізників",
};

const TransporterContext = createContext();

function Provider({ children }) {
  const [transporters, setTransporter] = useState([]);
  const [transportersList, setTransporterList] = useState(transporters);
  const [navigationConf, setNavigationConf] = useState(NAV_SETUP_DEFAULT);

  const fetchTransporters = () => {
    // const resp = fetch(TRANSPORTERS_ADDRESS)
    setTransporter(data);
    setTransporterList(data);
  };
  const fetchCall = useCallback(() => fetchTransporters(), []);

  const createTransporters = (transporterObj) => {
    console.log("createTransporters");
    console.log(transporterObj);
    setTransporter([...transporters, transporterObj]);
  };

  return (
    <TransporterContext.Provider
      value={{
        transporters,
        transportersList,
        fetchCall,
        setTransporterList,
        createTransporters,
        navigationConf,
        setNavigationConf,
      }}
    >
      {" "}
      {children}{" "}
    </TransporterContext.Provider>
  );
}

export { Provider };
export default TransporterContext;
