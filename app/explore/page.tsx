import { ExploreGrid } from "../components/ExploreGrid";
import { SearchSidebar } from "../components/SearchSidebar";

export default function ExplorePage() {
  return (
    <div className="flex">
      <SearchSidebar />
      <ExploreGrid />
    </div>
  );
}
