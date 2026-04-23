import Link from "next/link";
import { Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseAccessLoginGate } from "@/components/CourseAccessLoginGate";
import {
  COURSE_ACCESS_SECTIONS,
  tierUnlocksSection,
  type CourseTierId,
} from "@/lib/course";

export interface CourseAccessContentProps {
  /** Resolved from httpOnly session cookie on the server. */
  initialTier: CourseTierId | null;
  invalidLink?: boolean;
  heading?: string;
}

export function CourseAccessContent({
  initialTier,
  invalidLink,
  heading = "Workflow access",
}: CourseAccessContentProps) {
  const hasAccess = initialTier != null;

  return (
    <div className="container mx-auto px-4 py-12">
      <CourseAccessLoginGate signedIn={hasAccess} invalidLink={invalidLink}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{heading}</h1>
          <p className="text-muted-foreground mb-8">
            {hasAccess
              ? "Your unlocked content is below. Download each section you have access to."
              : 'A sign-in window should appear automatically. You can close it to browse what each tier includes, then use the bottom button when you are ready to sign in.'}
          </p>

          <div className="space-y-4">
            {COURSE_ACCESS_SECTIONS.map((section) => {
              const unlocked = hasAccess && tierUnlocksSection(initialTier as CourseTierId, section.id);
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

          {hasAccess && (
            <p className="mt-6 text-xs text-muted-foreground">
              Signed in on this browser for up to 14 days. Use &quot;Send access link&quot; again if you switch devices
              or clear cookies.
            </p>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link href="/workflow" className="underline hover:text-foreground">
              ← Back to Workflow page
            </Link>
          </p>
        </div>
      </CourseAccessLoginGate>
    </div>
  );
}
