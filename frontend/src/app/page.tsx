'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

const features = [
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
];

export default function Home() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    isAuthenticated().then((auth) => {
      if (auth) {
        router.replace('/dashboard');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100">
      {/* Hero Section */}
      <section className="relative w-full flex items-center justify-center min-h-[70vh] py-20 md:py-32 lg:py-40 overflow-hidden">
        {/* Creative floating shapes */}
        <div className="absolute top-0 left-0 w-56 h-56 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-float-slow z-0" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-fuchsia-200 rounded-full blur-3xl opacity-20 animate-float-reverse z-0" />
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Headline & CTA */}
            <div className="space-y-8 z-10 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <h1 className="text-left text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-indigo-600 via-blue-700 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-md">
                The Future of ITSM
                <span className="block text-4xl md:text-5xl font-bold text-indigo-700 dark:text-indigo-300">AI-Driven. Effortless. Beautiful.</span>
              </h1>
              <p className="text-left text-xl md:text-2xl max-w-xl text-gray-700 dark:text-gray-300">
                NexIT empowers IT teams to automate, resolve, and delight—faster than ever. Experience a platform that feels as modern as your ambitions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 py-4 shadow-lg bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600">Start Free Trial</Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-indigo-400 hover:border-indigo-600">
                    <Icons.play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </Link>
              </div>
              <div className="pt-6 flex flex-wrap items-center gap-4">
                <span className="uppercase text-xs font-semibold tracking-widest text-gray-400">Trusted by leading enterprises</span>
                <img src="/logo-placeholder.svg" alt="Enterprise Logo" className="h-8 opacity-70" />
                <img src="/logo-placeholder.svg" alt="Enterprise Logo" className="h-8 opacity-70" />
                <img src="/logo-placeholder.svg" alt="Enterprise Logo" className="h-8 opacity-70" />
              </div>
            </div>
            {/* Right: Hero Illustration */}
            <div className="relative flex justify-center md:justify-end z-0">
              <img
                src="/hero-itsm.svg"
                alt="AI ITSM Platform Illustration"
                className="w-[90%] max-w-2xl drop-shadow-2xl rounded-3xl border border-indigo-100 bg-white/60"
                draggable="false"
              />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-40 z-[-1]" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-fuchsia-200 rounded-full blur-3xl opacity-30 z-[-1]" />
            </div>
          </div>
        </div>
      </section>

      {/* Creative Divider */}
      <div className="w-full overflow-hidden -mt-2">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 md:h-24">
          <path fill="#EEF2FF" d="M0,96L48,85.3C96,75,192,53,288,42.7C384,32,480,32,576,42.7C672,53,768,75,864,80C960,85,1056,75,1152,58.7C1248,43,1344,21,1392,10.7L1440,0V100H1392C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100H0Z" />
        </svg>
      </div>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
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
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md animate-fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.08}s`, animationFillMode: 'both' }}
              >
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

      {/* Testimonials Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-white to-indigo-50 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <div className="container px-4 md:px-8">
          <h2 className="text-center text-4xl md:text-5xl font-extrabold mb-12 bg-gradient-to-br from-indigo-700 to-blue-500 bg-clip-text text-transparent">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Priya Sharma',
                title: 'Head of IT, Acme Corp',
                avatar: '/avatar1.png',
                quote: 'NexIT transformed our IT operations. The AI-driven automation is a game-changer, and the UI is the best in the industry.'
              },
              {
                name: 'James Lee',
                title: 'ITSM Lead, FinTechX',
                avatar: '/avatar2.png',
                quote: 'We resolved incidents 40% faster and our team loves the intuitive, modern interface. Nothing else comes close.'
              },
              {
                name: 'Elena Petrova',
                title: 'CIO, HealthPlus',
                avatar: '/avatar3.png',
                quote: 'The onboarding was seamless and the support is world-class. NexIT sets a new standard for ITSM platforms.'
              }
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white shadow-xl p-8 flex flex-col items-center text-center hover:scale-[1.03] transition-transform duration-200 animate-fade-in-up"
                style={{ animationDelay: `${0.15 + i * 0.1}s`, animationFillMode: 'both' }}
              >
                <img src={t.avatar} alt={t.name} className="w-20 h-20 rounded-full border-4 border-indigo-100 mb-4 shadow-lg" />
                <blockquote className="text-lg italic text-gray-700 mb-4">“{t.quote}”</blockquote>
                <div className="font-bold text-indigo-700">{t.name}</div>
                <div className="text-sm text-gray-400">{t.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="w-full py-20 md:py-32 bg-white animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
        <div className="container px-4 md:px-8">
          <h2 className="text-center text-4xl md:text-5xl font-extrabold mb-12 bg-gradient-to-br from-indigo-700 to-blue-500 bg-clip-text text-transparent">Why NexIT Beats the Competition</h2>
          <div className="overflow-x-auto rounded-2xl shadow-2xl">
            <table className="min-w-full bg-white border border-gray-200 text-center">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-blue-100">
                  <th className="p-4 text-lg font-bold text-gray-700">Feature</th>
                  <th className="p-4 text-lg font-bold text-indigo-700">NexIT</th>
                  <th className="p-4 text-lg font-bold text-gray-600">ServiceNow</th>
                  <th className="p-4 text-lg font-bold text-gray-600">Jira Service Mgmt</th>
                  <th className="p-4 text-lg font-bold text-gray-600">Freshservice</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {[
                  { label: 'AI-Powered Automation', nex: true, sn: false, jira: false, fresh: false },
                  { label: 'Modern, Intuitive UI', nex: true, sn: false, jira: false, fresh: true },
                  { label: 'No-Code Workflow Builder', nex: true, sn: true, jira: false, fresh: true },
                  { label: 'Real-Time Analytics', nex: true, sn: true, jira: true, fresh: true },
                  { label: 'Lightning Fast Search', nex: true, sn: false, jira: false, fresh: false },
                  { label: 'Transparent Pricing', nex: true, sn: false, jira: false, fresh: true },
                  { label: 'Enterprise Integrations', nex: true, sn: true, jira: true, fresh: true },
                  { label: '24/7 Human Support', nex: true, sn: true, jira: false, fresh: true },
                  { label: 'SOC2/ISO Compliance', nex: true, sn: true, jira: true, fresh: true },
                  { label: 'Onboarding in <1 Day', nex: true, sn: false, jira: false, fresh: false },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-indigo-50'}>
                    <td className="p-4 font-semibold text-left">{row.label}</td>
                    <td className="p-4">
                      {row.nex ? <span className="inline-block text-green-600 font-bold">✓</span> : <span className="inline-block text-gray-300">—</span>}
                    </td>
                    <td className="p-4">
                      {row.sn ? <span className="inline-block text-green-600 font-bold">✓</span> : <span className="inline-block text-gray-300">—</span>}
                    </td>
                    <td className="p-4">
                      {row.jira ? <span className="inline-block text-green-600 font-bold">✓</span> : <span className="inline-block text-gray-300">—</span>}
                    </td>
                    <td className="p-4">
                      {row.fresh ? <span className="inline-block text-green-600 font-bold">✓</span> : <span className="inline-block text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
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

/* Tailwind CSS Animations (add to global styles if not present):
.animate-fade-in-up {
  @apply opacity-0 translate-y-8;
  animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: none;
  }
}
.animate-float-slow {
  animation: floatSlow 8s ease-in-out infinite alternate;
}
@keyframes floatSlow {
  from { transform: translateY(0); }
  to { transform: translateY(-20px); }
}
.animate-float-reverse {
  animation: floatReverse 10s ease-in-out infinite alternate;
}
@keyframes floatReverse {
  from { transform: translateY(0); }
  to { transform: translateY(24px); }
}
*/
}
