import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "FAQ — YungGeeski",
  description: "Frequently asked questions.",
};

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-6">FAQ</h1>
        <div className="space-y-4 max-w-2xl mx-auto">
          <Card className="text-left">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">How does the order process work?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Choose your tier, complete checkout, then fill out the mandatory order form with your chart specs. Delivery timeline starts after your form is submitted. You’ll get revisions per your tier before final delivery.
            </CardContent>
          </Card>
          <Card className="text-left">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">How will a moving chart help my business?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Moving charts help to display data more elegantly and eye catching than traditional data display methods. They have the power to reach more people through attention grabbing short form content, and articulate an idea more efficiently than raw data or lectures ever can.
            </CardContent>
          </Card>
          <Card className="text-left">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">What file formats do I get?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You receive 4K 60 fps MP4 (and optionally CSV export as an add-on).
            </CardContent>
          </Card>
          <Card className="text-left">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Can I request a rush delivery?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Yes. Add the 24h rush add-on at checkout. Premium tier already includes 24h priority turnaround.
            </CardContent>
          </Card>
          <Card className="text-left">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">What if I need more revisions?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Each tier includes a set number of revisions. You can add the “Additional revision” add-on at checkout if you need more.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
