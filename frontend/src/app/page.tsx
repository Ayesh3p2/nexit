import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Modern IT Service Management
                <span className="text-primary"> Powered by AI</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Streamline your IT operations, automate workflows, and deliver exceptional service with our AI-powered ITSM platform.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
              <Link href="/dashboard">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">
                  <Icons.play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Everything You Need in One Platform
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Our comprehensive suite of tools helps IT teams work smarter, not harder.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Icons.incident className="h-8 w-8 text-primary" />,
                title: 'Incident Management',
                description: 'Quickly resolve IT issues with AI-powered ticket routing and resolution suggestions.'
              },
              {
                icon: <Icons.problem className="h-8 w-8 text-primary" />,
                title: 'Problem Management',
                description: 'Identify root causes and prevent recurring incidents with advanced analytics.'
              },
              {
                icon: <Icons.change className="h-8 w-8 text-primary" />,
                title: 'Change Management',
                description: 'Plan and implement changes with minimal disruption to your business.'
              },
              {
                icon: <Icons.asset className="h-8 w-8 text-primary" />,
                title: 'Asset Management',
                description: 'Track and manage your IT assets throughout their entire lifecycle.'
              },
              {
                icon: <Icons.saas className="h-8 w-8 text-primary" />,
                title: 'SaaS Management',
                description: 'Gain visibility and control over your SaaS applications and licenses.'
              },
              {
                icon: <Icons.cmdb className="h-8 w-8 text-primary" />,
                title: 'CMDB',
                description: 'Maintain an accurate and up-to-date configuration management database.'
              }
            ].map((feature, index) => (
              <div key={index} className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-4xl flex-col items-center space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to transform your IT operations?
            </h2>
            <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
              Join thousands of IT professionals who trust our platform to deliver exceptional service.
            </p>
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg">Start Free Trial</Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
