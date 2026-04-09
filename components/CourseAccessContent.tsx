import Link from "next/link";
import { Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  COURSE_ACCESS_SECTIONS,
  tierUnlocksSection,
  type CourseTierId,
} from "@/lib/course";

const VALID_TIERS: CourseTierId[] = ["tier1", "tier2", "tier3"];

function isValidTier(tier: string | undefined): tier is CourseTierId {
  return tier != null && VALID_TIERS.includes(tier as CourseTierId);
}

export interface CourseAccessContentProps {
  /** Tier from URL (e.g. searchParams.tier). Determines which sections are unlocked. */
  tier?: string;
}

export function CourseAccessContent({ tier }: CourseAccessContentProps) {
  const purchasedTier = tier;
  const hasAccess = isValidTier(purchasedTier);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Workflow access</h1>
        <p className="text-muted-foreground mb-8">
          {hasAccess
            ? "Your unlocked content is below. Download each section you have access to."
            : "After you purchase on the Workflow page, you'll get a link to this page with your tier. Use that link to unlock your content."}
        </p>

        {!hasAccess && (
          <Card className="mb-8 border-secondary/50 bg-secondary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Don't have access yet? Purchase any tier on the Workflow page. You'll be redirected here with the right access.
              </p>
              <Button asChild>
                <Link href="/workflow">Go to Workflow page</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {COURSE_ACCESS_SECTIONS.map((section) => {
            const unlocked = hasAccess && tierUnlocksSection(purchasedTier as CourseTierId, section.id);
            return (
              <Card
                key={section.id}
                className={unlocked ? "border-secondary/50" : "opacity-90"}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                    {unlocked ? (
                      <span className="text-xs font-medium text-secondary shrink-0">Unlocked</span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground shrink-0 flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5" /> Locked
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                  {unlocked ? (
                    <Button asChild size="sm">
                      <a
                        href={section.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        {...(section.downloadUrl && section.downloadUrl !== "#"
                          ? { download: true }
                          : {})}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {section.downloadLabel ?? "Download"}
                      </a>
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Upgrade to a higher tier on the Workflow page to unlock this section.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/workflow" className="underline hover:text-foreground">
            ← Back to Workflow page
          </Link>
        </p>
      </div>
    </div>
  );
}
