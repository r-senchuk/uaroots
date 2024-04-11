import { Link } from "react-router-dom";
import "./TransporterRow.css";
function TransporterRow({ transporter }) {
  return (
    <Link to={transporter.url} title="сайт компанії">
      <div className="box">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <figure className="image is-64x64">
                <img src={transporter.logo} alt="перевізник" />
              </figure>
              <p className="block subtitle px-3 has-text-primary">
                {transporter.name}
              </p>
              <p>{transporter.description}</p>
            </div>
          </div>
          <div className="level-item">
            <div className="content">
              <p>Виїзд з м. {transporter.departure}</p>
              <p>Прямує до {transporter.destination}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default TransporterRow;
