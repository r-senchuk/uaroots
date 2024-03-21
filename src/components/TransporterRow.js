function TransporterRow({ image }) {
  let className = "hero is-small";
  // if (isPrimary) {
  //   className += " is-primary";
  // }

  return (
    <section className={className} key={image.id}>
      <div className="hero-body ">
        <p className="subtitle">{image.id}</p>
        <p >Приватний перевізник</p>
      </div>
    </section>
  );
}

export default TransporterRow;
