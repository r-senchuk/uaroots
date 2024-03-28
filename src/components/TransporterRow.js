function TransporterRow({ transporter }) {
  let className = "hero is-small";
  // if (isPrimary) {
  //   className += " is-primary";
  // }

  return (
    <section className={className} >
      <div className="hero-body ">
        <img src={transporter.logo} alt="перевізник" />
        <p className="subtitle">{transporter.name}</p>
        <p >{transporter.description}</p>
      </div>
      <div className="hero-foot">
        <p > До: {transporter.departure}</p>
        <p >Виїзд з м. {transporter.destination}</p>
        </div>
    </section>
  );
}

export default TransporterRow;
