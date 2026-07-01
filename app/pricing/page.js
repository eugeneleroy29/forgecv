import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Pricing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-foreground/60 text-lg">
          Start for free. Upgrade when you need more.
        </p>

        {/* Monthly/Annual Toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className="text-sm font-medium">Monthly</span>
          <div className="w-12 h-6 bg-accent rounded-full relative cursor-pointer">
            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-all" />
          </div>
          <span className="text-sm font-medium">Annual</span>
          <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
            Save 17%
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Free */}
          <div className="border border-border rounded-xl p-8 flex flex-col">
            <h2 className="text-lg font-semibold mb-1">Free</h2>
            <p className="text-foreground/60 text-sm mb-6">Perfect for getting started</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">₱0</span>
              <span className="text-foreground/60 text-sm"> / forever</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {[
                '1 resume',
                'Basic ATS template',
                'Unlimited downloads',
                '1 portfolio (basic template)',
                '5 AI generations/month',
                'ATS Score Checker',
                'Skills Suggester',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <span className="text-accent">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full border border-border text-foreground py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors">
              Get Started Free
            </button>
          </div>

          {/* Starter */}
          <div className="border-2 border-accent rounded-xl p-8 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-full font-medium">
              Most Popular
            </div>
            <h2 className="text-lg font-semibold mb-1">Starter</h2>
            <p className="text-foreground/60 text-sm mb-6">For active job seekers</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">₱149</span>
              <span className="text-foreground/60 text-sm"> / month</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {[
                '3 resumes',
                'All resume templates',
                'Unlimited downloads',
                '1 portfolio (premium templates)',
                'Custom portfolio sections',
                'Unlimited AI generations',
                'Job Description Optimizer',
                'Portfolio Bio Generator',
                'ATS Score Checker',
                'Skills Suggester',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <span className="text-accent">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
              Get Started
            </button>
          </div>

          {/* Pro */}
          <div className="border border-border rounded-xl p-8 flex flex-col">
            <h2 className="text-lg font-semibold mb-1">Pro</h2>
            <p className="text-foreground/60 text-sm mb-6">For serious professionals</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">₱299</span>
              <span className="text-foreground/60 text-sm"> / month</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {[
                'Unlimited resumes',
                'All resume templates',
                'Unlimited downloads',
                '3 portfolios (premium templates)',
                'Custom portfolio sections',
                'Portfolio Analytics',
                'Unlimited AI generations',
                'Job Description Optimizer',
                'Portfolio Bio Generator',
                'ATS Score Checker',
                'Skills Suggester',
                'Priority Support',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <span className="text-accent">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full border border-border text-foreground py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors">
              Get Started
            </button>
          </div>

        </div>

        {/* One-time Payment Section */}
        <div className="mt-16 border border-border rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Just need a portfolio?</h2>
            <p className="text-foreground/60 text-sm">
              One-time payment. No subscription. Yours forever.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">

            <div className="border border-border rounded-xl p-6 text-center hover:border-accent transition-colors">
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="font-semibold mb-1">1 Portfolio</h3>
              <p className="text-foreground/60 text-sm mb-4">Premium template, live forever</p>
              <div className="text-3xl font-bold mb-4">₱499</div>
              <button className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
                Buy Now
              </button>
            </div>

            <div className="border border-border rounded-xl p-6 text-center hover:border-accent transition-colors">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold mb-1">3 Portfolios</h3>
              <p className="text-foreground/60 text-sm mb-4">Premium templates, live forever</p>
              <div className="text-3xl font-bold mb-4">₱999</div>
              <button className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
                Buy Now
              </button>
            </div>

          </div>
        </div>

      </section>

      <Footer />
    </main>
  )
}