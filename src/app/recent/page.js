import RecentProjectsClient from "./RecentProjectsClient";

export const metadata = {
  title: "Recent Steel Structure Projects | Smart Steel South Africa",
  description:
    "Explore completed Smart Steel projects, including Atlas solar carports, commercial steel structures, lightweight steel framing, and installation examples across South Africa.",
  alternates: {
    canonical: "/recent",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <RecentProjectsClient />;
}
