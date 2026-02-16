import React, { createContext, useContext, useState, ReactNode } from "react";

type ProModalContextType = "general" | "nutrition_photo" | "routine_generation" | "unlimited_usage" | "stats" | "ai_coach";

interface ProUpgradeContextValue {
  showProModal: boolean;
  proModalContext: ProModalContextType;
  proModalTitle?: string;
  proModalDescription?: string;
  openProUpgradeModal: (context?: ProModalContextType, title?: string, description?: string) => void;
  closeProUpgradeModal: () => void;
}

const ProUpgradeContext = createContext<ProUpgradeContextValue | null>(null);

export const ProUpgradeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showProModal, setShowProModal] = useState(false);
  const [proModalContext, setProModalContext] = useState<ProModalContextType>("general");
  const [proModalTitle, setProModalTitle] = useState<string>();
  const [proModalDescription, setProModalDescription] = useState<string>();

  const openProUpgradeModal = (
    context: ProModalContextType = "general",
    title?: string,
    description?: string,
  ) => {
    setProModalContext(context);
    setProModalTitle(title);
    setProModalDescription(description);
    setShowProModal(true);
  };

  const closeProUpgradeModal = () => {
    setShowProModal(false);
  };

  return (
    <ProUpgradeContext.Provider
      value={{
        showProModal,
        proModalContext,
        proModalTitle,
        proModalDescription,
        openProUpgradeModal,
        closeProUpgradeModal,
      }}
    >
      {children}
    </ProUpgradeContext.Provider>
  );
};

export const useProUpgrade = () => {
  const context = useContext(ProUpgradeContext);
  if (!context) {
    throw new Error("useProUpgrade must be used within ProUpgradeProvider");
  }
  return context;
};
