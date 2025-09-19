import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VersionContextType {
  availableVersions: string[];
  setAvailableVersions: (versions: string[]) => void;
  currentVersion: string;
  setCurrentVersion: (version: string) => void;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export const VersionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('');

  useEffect(() => {
    if (availableVersions.length > 0 && !currentVersion) {
      setCurrentVersion(availableVersions[availableVersions.length - 1]);
    }
  }, [availableVersions, currentVersion]);

  const value = { availableVersions, setAvailableVersions, currentVersion, setCurrentVersion };
  return <VersionContext.Provider value={value}>{children}</VersionContext.Provider>;
};

export const useVersion = (): VersionContextType => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
};
