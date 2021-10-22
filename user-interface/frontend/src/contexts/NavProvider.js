import React, { useContext, useState } from "react";
import { useWindowWidth } from "@react-hook/window-size";

const NavContext = React.createContext();

export function useNav() {
  return useContext(NavContext);
}

export function NavProvider({ children }) {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <NavContext.Provider
      value={{
        isNavOpen,
        isMobile,
        setIsNavOpen,
      }}
    >
      {children}
    </NavContext.Provider>
  );
}
