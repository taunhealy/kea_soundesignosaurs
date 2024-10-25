import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import VehicleList from "@/app/components/VehicleList";
import DriverNavigation from "@/app/components/DriverNavigation";
import AddVehicleButton from "@/app/components/AddVehicleButton";
async function getDriverVehicles(userId: string) {
  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: { vehicles: true },
  });
  return driver?.vehicles || [];
}

export default async function DriverDashboardPage() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const vehicles = await getDriverVehicles(userId);

  return (
    <div>
      <DriverNavigation />
      <h1 className="text-2xl font-bold mb-4">Your Vehicles</h1>
      <AddVehicleButton onAddVehicle={() => {}} />
      <VehicleList vehicles={vehicles} />
    </div>
  );
}
