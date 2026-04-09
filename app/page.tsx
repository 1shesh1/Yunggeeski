import { PricingCards } from "@/components/PricingCards";

/** Add your sample videos to public/videos/ or set full URLs here. Empty = placeholder. */
const SAMPLE_VIDEOS: { tier: string; src: string }[] = [
  { tier: "Basic", src: "/videos/basic-sample.mp4" },
  { tier: "Standard", src: "/videos/standard-sample.mp4" },
  { tier: "Premium", src: "/videos/premium-sample.mp4" },
];

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-secondary">Data-Driven</span> Financial Charts
          <br />
          Built for Engagement
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Fixed pricing. Clear scope. Professional delivery.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-1 text-center">Choose your package</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">(Collaboration posts now available)</p>
        <PricingCards />
      </section>

      <section className="mt-20">
        <div className="grid gap-10 md:grid-cols-3">
          {SAMPLE_VIDEOS.map(({ tier, src }) => (
            <div key={tier}>
              <h3 className="text-lg font-semibold mb-3">{tier}</h3>
              <div className="rounded-lg border bg-muted/30 aspect-[4/5] overflow-hidden flex items-center justify-center">
                {src ? (
                  <video
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">Sample chart</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
