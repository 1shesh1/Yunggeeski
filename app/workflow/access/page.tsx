import { CourseAccessContent } from "@/components/CourseAccessContent";

export const metadata = {
  title: "Workflow access — YungGeeski",
  description: "Access your workflow materials.",
};

export default function WorkflowAccessPage({
  searchParams,
}: {
  searchParams: { tier?: string };
}) {
  return <CourseAccessContent tier={searchParams.tier} />;
}
