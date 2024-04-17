import "./Footer.css";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="level">
        <div className="level-item">
          <p className="has-text-grey">
            {" "}
            © 2024, UARoute or its affiliates. All rights reserved.
          </p>
        </div>
        <div className="level-item">
          <span className="has-text-grey">
            Developed in&nbsp;collaboration&nbsp;with
          </span>
          <a
            href="https://crewbravo.com/"
            title="Software Development"
            className="px-2"
          >
            <img
              src="https://crewbravo.com/images/logo.svg"
              className="h30"
              alt="Crew Bravo"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
