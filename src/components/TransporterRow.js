function TransporterRow({ image }) {
  let className = "hero is-small";
  // if (isPrimary) {
  //   className += " is-primary";
  // }

  return (
    <section className={className} >
      <div className="hero-body ">
        <img src={image.urls.small} alt={image.alt_description} />
        <p className="subtitle">{image.description}</p>
        <p >Приватний перевізник</p>
      </div>
    </section>
  );
}

export default TransporterRow;
