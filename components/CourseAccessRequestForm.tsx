"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CourseAccessRequestForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/course/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Request failed");
      }
      setStatus("done");
      setMessage(typeof data.message === "string" ? data.message : "Check your inbox.");
      if (typeof data.mockMagicLink === "string") {
        console.info("[MOCK_MODE] Magic link (also in response):", data.mockMagicLink);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="course-access-email">Email address</Label>
        <Input
          id="course-access-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="Same email you used at checkout"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? "Sending…" : "Send access link"}
      </Button>
      {(status === "done" || status === "error") && message && (
        <p className={status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
          {message}
        </p>
      )}
      <p className="text-xs text-muted-foreground leading-relaxed">
        The link expires in about an hour. After you open it, this browser stays signed in for up to 14 days.
      </p>
    </form>
  );
}
