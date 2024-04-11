import { Link } from "react-router-dom";
import { useContext, useRef } from "react";
import TransporterContext from "../context/transporter";

function Navigation() {
  const navBarRef = useRef();
  const navMenuRef = useRef();
  const { navigationConf } = useContext(TransporterContext);

  const handleNavBarClick = () => {
    navBarRef.current.classList.toggle("is-active");
    navMenuRef.current.classList.toggle("is-active");
  };

  return (
    <section className="hero is-primary is-medium">
      <div className="hero-head">
        <nav className="navbar">
          <div className="container">
            <div className="navbar-brand">
              <Link to="/" className="navbar-item title">
                UAROUTE
              </Link>
              <span
                onClick={handleNavBarClick}
                className="navbar-burger"
                ref={navBarRef}
                data-target="navbarMenuHeroA"
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
            <div id="navbarMenuHeroA" ref={navMenuRef} className="navbar-menu">
              <div className="navbar-end">
                <Link to="/" className="navbar-item">
                  Головна
                </Link>
                <Link to="/contact" className="navbar-item">
                  Про нас
                </Link>
                <span className="navbar-item">
                  <Link to="/contact" className="button is-primary is-inverted">
                    <span className="icon">
                      <i className="fa fa-bus"></i>
                    </span>
                    <span>Зв'язатись</span>
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="hero-body">
        <div className="container has-text-centered">
          <p className="title">{navigationConf.title}</p>
          <p className="subtitle">{navigationConf.subtl}</p>
        </div>
      </div>

      <div className="hero-foot">
        <nav className="tabs">
          <div className="container">
            {/* <ul>
              <li className="is-active">
                <Link to="/">Список перевізників</Link>
              </li>
              
              <li>
                <Link to="/contact">Перевізникам</Link>
              </li>
              <li>
                <Link to="/contact">Умови</Link>
              </li>
            </ul> */}
          </div>
        </nav>
      </div>
    </section>
  );
}

export default Navigation;
