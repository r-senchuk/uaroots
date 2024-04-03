import { Link } from "react-router-dom";
import { useRef } from "react";
import SearchBar from "./SearchBar";

function Navigation() {
  const navBarRef = useRef();
  const navMenuRef = useRef();

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
              <SearchBar></SearchBar>
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
                <Link to="/" className="navbar-item is-active">
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
          <p className="title">Пасажирські перевезення</p>
          <p className="subtitle">Список перевізників</p>
        </div>
      </div>

      <div className="hero-foot">
        <nav className="tabs">
          <div className="container">
            <ul>
              <li className="is-active">
                <Link to="/">Список перевізників</Link>
              </li>
              <li>
                <Link to="/contact">Перевізникам</Link>
              </li>
              <li>
                <Link to="/contact">Умови</Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </section>
  );
}

export default Navigation;
