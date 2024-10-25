"use client";

import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext<
  { activeTab: string; setActiveTab: (tab: string) => void } | undefined
>(undefined);

export function Tabs({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="flex space-x-2 mb-4">{children}</div>;
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");
  const { activeTab, setActiveTab } = context;
  return (
    <button
      className={`px-4 py-2 rounded-lg ${
        activeTab === value ? "bg-blue-500 text-white" : "bg-gray-200"
      }`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");
  const { activeTab } = context;
  if (activeTab !== value) return null;
  return <div>{children}</div>;
}
