"use client";



export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-[var(--font-poetsen-one)] mb-8">Terms of Service</h1>
        <div className="space-y-6 text-text-secondary">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">1. Acceptance of Terms</h2>
            <p>By accessing RepSupply, you agree to these terms. We serve as an affiliate platform indexing products from authorized third-party agents.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">2. Affiliate Disclaimer</h2>
            <p>RepSupply does not sell products directly. We provide links to third-party agents (CNFans, ACBuy, etc.). We are not responsible for shipping, quality, or fulfillment of orders.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">3. User Conduct</h2>
            <p>You agree not to use our platform for illegal purposes. All product links are user-generated or curated for informational purposes.</p>
          </section>
        </div>
      </div>
      <div className="mt-20">
      </div>
    </div>
  );
}
