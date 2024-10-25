import Link from "next/link";

const SeekerNavigation: React.FC = () => {
  return (
    <nav className="flex items-center space-x-4">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/dashboard/profile">Profile</Link>
      <Link href="/dashboard/favorites">Favorite Photographers</Link>
      <Link href="/dashboard/wedding-plan">Wedding Plan</Link>
    </nav>
  );
};

export default SeekerNavigation;
