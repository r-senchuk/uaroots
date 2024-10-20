import { useParams } from "react-router-dom";

export default function ArticlesPage() {
    const { article } = useParams();

    return (
      <section className="section">
        <h1>{article}</h1>
      </section>
    );
}
