export default function HomePage() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
      {/* Placeholder tiles for upcoming dashboard sections */}
      <div className="card md:col-span-8">Block A1</div>
      <div className="card md:col-span-4">Block A2</div>
      <div className="card md:col-span-6">Block B1</div>
      <div className="card md:col-span-6">Block B2</div>
      <div className="card md:col-span-12">Block C</div>
    </div>
  );
}
