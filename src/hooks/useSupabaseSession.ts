import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import type { Session } from "@supabase/supabase-js";

export function useSupabaseSession(
    onSessionChange?: (session: Session | null) => void
) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        supabase.auth.getSession().then(({ data, error}) => {
            if(error) {
                console.error("Cannot get token!",error);
            }

            if(active) {
                setSession(data.session);
                setLoading(false)
            }
        })

        const {data} = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setLoading(false);
            onSessionChange?.(nextSession);
        })

        return () => {
            active = false;
            data.subscription.unsubscribe();
        }
    }, [onSessionChange])

    return {session, loading};
}