import { Link } from "react-router-dom";
import "./TransporterRow.css";
function TransporterRow({ transporter }) {
  return (
    <Link to={transporter.url} className="w90 my-2" title="сайт компанії">
      <div className="box">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <div className="level-item">
                <figure className="image is-64x64">
                  <img src={transporter.logo} alt="перевізник" />
                </figure>
              </div>
              <div className="level-item">
                <p className="block subtitle px-2 has-text-primary">
                  {transporter.name}
                </p>
              </div>
            </div>
          </div>
          <div className="level-item">
            <p className="px-3 is-italic wrap">{transporter.description}</p>
          </div>
          <div className="level-right">
            <div className="content">
              <p>
                Виїзд з <br />
                <span className="tag is-dark">{transporter.departure}</span>
              </p>
              <p>
                Прямує до <br />
                <span className="tag is-dark">{transporter.destination}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default TransporterRow;
