import Link from "next/link";

export default function PhotographerNavigation() {
  return (
    <nav className="flex items-center space-x-4">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/dashboard/profile">Profile</Link>
      <Link href="/dashboard/portfolio">Portfolio</Link>
      <Link href="/dashboard/packages">Packages</Link>
    </nav>
  );
}
