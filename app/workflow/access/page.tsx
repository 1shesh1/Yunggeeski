import { CourseAccessPageWrapper } from "@/components/CourseAccessPageWrapper";

export const metadata = {
  title: "Workflow access — YungGeeski",
  description: "Access your workflow materials.",
};

export default async function WorkflowAccessPage({
  searchParams,
}: {
  searchParams: { tier?: string; session_id?: string; error?: string };
}) {
  return <CourseAccessPageWrapper searchParams={searchParams} />;
}
