import "./TransporterRow.css";
function TransporterRow({ transporter }) {
  return (
    <a href="https://www.4k-koval.com/" title="сайт компанії">
      <div className="box">
        <div className="level">
          <div className="level-left">
            <figure className="image is-64x64">
              <img src={transporter.logo} alt="перевізник" />
            </figure>
            <div className="level-item">
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
    </a>
  );
}

export default TransporterRow;
