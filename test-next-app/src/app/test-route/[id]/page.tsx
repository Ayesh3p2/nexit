export default function TestRoutePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1>Test Route - ID: {params.id}</h1>
      <p>This is a test dynamic route in a fresh Next.js app.</p>
    </div>
  );
}
