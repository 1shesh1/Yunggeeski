import { CourseAccessContent } from "@/components/CourseAccessContent";

export const metadata = {
  title: "Course Access — YungGeeski",
  description: "Access your course materials and downloads.",
};

export default function DownloadsPage({
  searchParams,
}: {
  searchParams: { tier?: string };
}) {
  return <CourseAccessContent tier={searchParams.tier} />;
}
