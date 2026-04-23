import { CourseAccessPageWrapper } from "@/components/CourseAccessPageWrapper";

export const metadata = {
  title: "Course Access — YungGeeski",
  description: "Access your course materials and downloads.",
};

export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: { tier?: string; session_id?: string; error?: string };
}) {
  return (
    <CourseAccessPageWrapper searchParams={searchParams} heading="Course access" />
  );
}
