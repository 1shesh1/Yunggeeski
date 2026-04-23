"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CourseAccessRequestForm } from "@/components/CourseAccessRequestForm";

export function CourseAccessLoginGate({
  signedIn,
  invalidLink,
  children,
}: {
  signedIn: boolean;
  invalidLink?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!signedIn);

  useEffect(() => {
    if (signedIn) setOpen(false);
  }, [signedIn]);

  useEffect(() => {
    if (invalidLink) setOpen(true);
  }, [invalidLink]);

  if (signedIn) {
    return <>{children}</>;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to view your courses</DialogTitle>
          </DialogHeader>
          {invalidLink && (
            <p className="text-sm text-destructive">
              That sign-in link has expired or is invalid. Request a new link below.
            </p>
          )}
          <CourseAccessRequestForm />
          <p className="text-sm text-muted-foreground pt-2 border-t border-border">
            Don&apos;t have access yet?{" "}
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/workflow">Purchase on the Workflow page</Link>
            </Button>
            .
          </p>
        </DialogContent>
      </Dialog>

      {!open && (
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 shadow-lg"
          onClick={() => setOpen(true)}
        >
          Sign in to unlock downloads
        </Button>
      )}

      {children}
    </>
  );
}
