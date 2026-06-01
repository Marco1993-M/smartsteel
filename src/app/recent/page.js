import RecentProjectsClient from "./RecentProjectsClient";

export const metadata = {
  title: "Recent Projects | Smart Steel",
  description:
    "A gallery of recent Smart Steel projects and installation examples.",
  alternates: {
    canonical: "/recent",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <RecentProjectsClient />;
}
