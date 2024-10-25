"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GearForm } from "@/app/components/GearForm";
import { Gear } from "@prisma/client";

// Assume these functions exist to interact with your API
const fetchGear = async (): Promise<Gear[]> => {
  const response = await fetch('/api/gear');
  if (!response.ok) throw new Error('Failed to fetch gear');
  return response.json();
};

const addGearToDatabase = async (newGear: Gear): Promise<Gear> => {
  const response = await fetch('/api/gear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newGear),
  });
  if (!response.ok) throw new Error('Failed to add gear');
  return response.json();
};

export default function GearPage() {
  const queryClient = useQueryClient();

  const { data: gear = [], isLoading, error } = useQuery({
    queryKey: ['gear'],
    queryFn: fetchGear,
  });

  const addGearMutation = useMutation({
    mutationFn: addGearToDatabase,
    onSuccess: (newGear) => {
      queryClient.setQueryData(['gear'], (oldData: Gear[] | undefined) => 
        oldData ? [...oldData, newGear] : [newGear]
      );
    },
  });

  const handleAddGear = async (newGear: Gear) => {
    addGearMutation.mutate(newGear);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div>
      <GearForm onAddGear={handleAddGear} />
      <ul>
        {gear.map((item) => (
          <li key={item.id}>
            {item.name} - {item.category}
          </li>
        ))}
      </ul>
    </div>
  );
}
