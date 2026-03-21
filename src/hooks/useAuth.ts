"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getUserRole } from "@/lib/supabase/queries";
import type { UserRole } from "@/types/database";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    isLoading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    // onAuthStateChange fires immediately with INITIAL_SESSION —
    // no need for a separate init() call, which would cause a race condition.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = await getUserRole(supabase, session.user.id);
        setState({ user: session.user, role, isLoading: false });
      } else {
        setState({ user: null, role: null, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
