export default function TestRoutePage({ params }: { params: { testId: string } }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1>Test Route - ID: {params.testId}</h1>
    </div>
  );
}
