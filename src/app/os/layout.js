import OsShellLayout from "../../components/os/OsShellLayout"

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function SmartSteelOsLayout({ children }) {
  return <OsShellLayout>{children}</OsShellLayout>
}
