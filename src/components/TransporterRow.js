function TransporterRow({ isPrimary }) {
  let className = "hero is-small";
  if (isPrimary) {
    className += " is-primary";
  }

  return (
    <section className={className}>
      <div class="hero-body ">
        <p class="subtitle">4k-koval</p>
        <p >Приватний перевізник</p>
      </div>
    </section>
  );
}

export default TransporterRow;
