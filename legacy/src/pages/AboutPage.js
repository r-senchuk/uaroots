import { useContext, useEffect } from "react";
import TransporterContext from "../context/transporter";
import content from "../json/content.json";
import AboutUs from "../components/about/AboutUs";

function AboutPage() {
  const { setNavigationConf } = useContext(TransporterContext);

  useEffect(() => {
    const title = content.pages.about.title,
      subtl = content.pages.about.subtitle;
    setNavigationConf({
      title,
      subtl,
    });
  }, [setNavigationConf]);

  return <AboutUs content={content.pages.about.content} mission={content.pages.about.mission}></AboutUs>;
}

export default AboutPage;
