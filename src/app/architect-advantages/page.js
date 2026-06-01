import ArchitectAdvantagesClient from "./ArchitectAdvantagesClient";

export const metadata = {
  title: "Architect Advantages | Smart Steel",
  description:
    "Architect-focused lightweight steel framing information from Smart Steel.",
  alternates: {
    canonical: "/architect-advantages",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <ArchitectAdvantagesClient />;
}
