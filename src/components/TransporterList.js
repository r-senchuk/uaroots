import { useContext, useEffect } from "react";
import TransporterRow from "./TransporterRow";
import TransporterContext from "../context/transporter";

function TransporterList() {
  const { transportersList, fetchCall, setNavigationConf } =
    useContext(TransporterContext);

  useEffect(() => {
    fetchCall();
    setNavigationConf({
      title: "Пасажирські перевезення",
      subtl: "Список перевізників",
    });
  }, [fetchCall, setNavigationConf]);

  const renderedContext = transportersList.map((tp) => {
    return <TransporterRow key={tp.id} transporter={tp}></TransporterRow>;
  });
  return <div className="container">{renderedContext}</div>;
}

export default TransporterList;
