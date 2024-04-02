import "bulma/css/bulma.css";
import "./App.css";
import SearchBar from "./components/SearchBar";
import TransporterList from "./components/TransporterList";

function App() {
  return (
    <div>
      <section className="hero is-primary is-medium">
        <div className="hero-head">
          <nav className="navbar">
            <div className="container">
              <div className="navbar-brand">
                <SearchBar></SearchBar>
                <a href="/index.html" className="navbar-item title">
                  UAROUTE
                </a>
                <span className="navbar-burger" data-target="navbarMenuHeroA">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
              <div id="navbarMenuHeroA" className="navbar-menu">
                <div className="navbar-end">
                  <a href="/index.html" className="navbar-item is-active">
                    Головна
                  </a>
                  <a href="/index.html" className="navbar-item">
                    Про нас
                  </a>
                  <span className="navbar-item">
                    <a
                      href="/index.html"
                      className="button is-primary is-inverted"
                    >
                      <span className="icon">
                        <i className="fa fa-bus"></i>
                      </span>
                      <span>Зв'язатись</span>
                    </a>
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
                  <a href="/index.html">Список перевізників</a>
                </li>
                <li>
                  <a href="/index.html">Перевізникам</a>
                </li>
                <li>
                  <a href="/index.html">Умови</a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </section>
      <section className="section">
        <TransporterList></TransporterList>
      </section>
    </div>
  );
}

export default App;
