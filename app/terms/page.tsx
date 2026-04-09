export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Scope</h2>
          <p>
            Scope is defined by the order form you submit after payment. What you include in that form (chart title,
            series, date range, resolution, branding, etc.) constitutes the agreed scope of work.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Revisions</h2>
          <p>
            Revisions are limited per tier: Basic (1), Standard (2), Premium (3). Additional revisions may be purchased
            as an add-on. Revisions are provided within the stated delivery timeline after each round of feedback.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Research & data</h2>
          <p>
            Research and data sourcing are included only in certain tiers (Standard and Premium). Basic tier requires
            the client to provide exact comparison, title, and color/background specifications. Full research concept
            is available as an add-on.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Refunds</h2>
          <p>
            No refunds after work begins. Work is considered begun once you have submitted the mandatory order form and
            scope is locked. Refunds are not available after form submission.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Delivery timeline</h2>
          <p>
            The delivery timeline begins after full submission of the order form (including all required fields and
            assets). If the form is incomplete or submitted late, the timeline may shift accordingly. Rush delivery
            (24h) applies when that add-on is purchased and form is submitted promptly.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Rush fee</h2>
          <p>
            The 24h rush add-on entitles you to priority turnaround (24-hour delivery) subject to scope being clearly
            defined in the order form. Rush applies from the time the order form is fully submitted.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Usage rights</h2>
          <p>
            Upon delivery, you receive a license to use the delivered chart(s) for your stated purpose (e.g. social
            media, report, presentation). We do not claim ownership of your data or branding; we claim ownership of the
            design and chart creation. Usage rights are granted for the delivered assets only.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Payment</h2>
          <p>
            Payment is due upfront at checkout. Your order is confirmed only after successful payment. The mandatory
            order form must be completed after payment to lock scope and begin production.
          </p>
        </section>
      </div>
    </div>
  );
}
