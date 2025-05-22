import React, { useState, useContext, createContext } from "react";

const TabsContext = createContext();

export function Tabs({ defaultValue, children }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }) {
  return <div className="flex space-x-4 border-b mb-4">{children}</div>;
}

export function TabsTrigger({ value, children }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within <Tabs>");

  const { activeTab, setActiveTab } = context;

  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 font-semibold ${
        isActive
          ? "border-b-2 border-blue-600 text-blue-600"
          : "text-gray-600 hover:text-blue-500"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within <Tabs>");

  return context.activeTab === value ? <div>{children}</div> : null;
}
