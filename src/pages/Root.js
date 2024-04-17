import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/footer/Footer";

export default function Root() {
  return (
    <div>
      <Navigation />
      <Outlet />
      <Footer></Footer>
    </div>
  );
}
