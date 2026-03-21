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

    async function fetchRole(userId: string): Promise<UserRole | null> {
      return getUserRole(supabase, userId);
    }

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const role = await fetchRole(user.id);
        setState({ user, role, isLoading: false });
      } else {
        setState({ user: null, role: null, isLoading: false });
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = await fetchRole(session.user.id);
        setState({ user: session.user, role, isLoading: false });
      } else {
        setState({ user: null, role: null, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
