import { useContext, useEffect } from "react";
import ContactUs from "../components/ContactUs";
import TransporterContext from "../context/transporter";

function ContactPage() {
  const { setNavigationConf } = useContext(TransporterContext);
  const navigationConf = {
    title: "Про нас",
    subtl: `Якщо ви хочете додати свою компанію до нашого каталогу, або у вас є
          інші питання, будь ласка, заповніть форму нижче. Ми відповімо вам`,
  };

  useEffect(() => {
    setNavigationConf(navigationConf);
  }, [setNavigationConf]);


  return <ContactUs></ContactUs>;
}

export default ContactPage;
