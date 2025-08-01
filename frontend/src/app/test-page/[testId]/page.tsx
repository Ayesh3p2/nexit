// This is a minimal test page to isolate the dynamic route type issue

interface TestPageProps {
  params: {
    testId: string;
  };
}

export default function TestPage({ params }: TestPageProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1>Test Page - ID: {params.testId}</h1>
      <p>This is a minimal test page to isolate the dynamic route type issue.</p>
    </div>
  );
}
