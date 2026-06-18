import { useEffect, useMemo, useState } from 'react';
import { getCurrentUserRole } from '../lib/profile';
import { AuthContext } from './authContext';

export function AuthProvider({ session, children }) {
  const userId = session?.user?.id ?? null;
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setRoleLoading(true);

    getCurrentUserRole().then((fetchedRole) => {
      if (!cancelled) {
        console.log('[auth] resolved role:', fetchedRole, 'isGuest:', fetchedRole === 'guest');
        setRole(fetchedRole);
        setRoleLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const value = useMemo(() => {
    if (!session) {
      return {
        role: null,
        isGuest: false,
        isReadOnly: false,
        roleLoading: false,
      };
    }

    return {
      role,
      isGuest: role === 'guest',
      isReadOnly: role === 'guest',
      roleLoading,
    };
  }, [session, role, roleLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
