export default function AboutUs({ content, mission }) {
  const text = mission.map((p, i) => {
    return (
      <p key={i} >
        {p}
      </p>
    );
  });

  return (
    <div className="section" style={{ maxWidth: '90%', margin: 'auto' }}>
      <div className="box subtitle"> {content}</div>
      <div className="content">{text}</div>
    </div>
  );
}
