import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PARTNERSHIPS_EMAIL } from "@/lib/site";

export const metadata = {
  title: "About — YungGeeski",
  description: "About YungGeeski.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-6">About</h1>
        <div className="text-muted-foreground space-y-4 text-left">
          <p>
            Yung Geeski is a financial data visualization brand specializing in high-impact market charts designed for reach, credibility, and conversion.
          </p>
          <p>
            Data has a huge role in society, as it brings light to real problems, and strengthens arguments. But most times, creators and businesses struggle to display data in a way that keeps it relevant and digestible to the general public, while pushing a strong narrative. Yung Geeski works to rectify this problem by creating clear, provocative, and engaging charts displaying data for the general public, as well as both private and public companies and brands.
          </p>
          <p>
            His work generates tens of millions of monthly views across short-form platforms, establishing authority while delivering measurable value to client partners such as Astral, Wall St. Rank, and Bloom.
          </p>
          <p>
            Yung Geeski believes that the truth commonly hides behind data, and that everyone has the right to understand the world with a background of hard information. Yung Geeski approaches data from the lens of narrative architecture: identifying the hidden tension, or contrast, within a dataset and structuring visuals that guide audiences to a clear, data-based conclusion.
          </p>
          <p>
            Yung Geeski understands that data wins arguments…
            <br />
            <span className="font-medium text-foreground">Make sure it wins yours</span>
          </p>
        </div>
        <div className="mt-8 flex flex-col items-center gap-6">
          <Button asChild size="lg">
            <Link href="/">Let&apos;s Make an Impact</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Interested in brand partnerships? Contact{" "}
            <a href={`mailto:${PARTNERSHIPS_EMAIL}`} className="underline hover:text-foreground transition-colors">
              {PARTNERSHIPS_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
