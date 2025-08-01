// This is a direct route without dynamic parameters to test if the issue is specific to dynamic routes

export default function TestDirectRoute() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1>Direct Route Test</h1>
      <p>This is a direct route without any dynamic parameters.</p>
    </div>
  );
}
