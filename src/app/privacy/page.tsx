"use client";



export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-[var(--font-poetsen-one)] mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-text-secondary">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">1. Data Collection</h2>
            <p>We do not collect personal usage data beyond standard analytics. Account information is used solely for the functionality of the "Saved Finds" feature.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">2. Cookies</h2>
            <p>We use cookies to remember your preferences (e.g., Grid View vs. List View settings).</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">3. Third-Party Links</h2>
            <p>Clicking affiliate links directs you to external sites. We are not responsible for privacy practices on those platforms.</p>
          </section>
        </div>
      </div>
      <div className="mt-20">
      </div>
    </div>
  );
}
