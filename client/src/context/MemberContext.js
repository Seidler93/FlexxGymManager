// MemberContext.js
import { createContext, useContext, useState } from 'react';

// Create the context
export const MemberContext = createContext();

// Provider component
export function MemberProvider({ children }) {
  const [member, setMember] = useState(null);
  const [searchedMember, setSearchedMember] = useState(null);

  return (
    <MemberContext.Provider value={{ member, setMember, searchedMember, setSearchedMember }}>
      {children}
    </MemberContext.Provider>
  );
}

// Optional convenience hook
export const useMember = () => useContext(MemberContext);
