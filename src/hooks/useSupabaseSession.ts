import { useEffect } from "react"
import { supabase } from "../lib/supabase"
import type { Session } from "@supabase/supabase-js";
import { useAppDispatch } from "../store/hooks";
import { setAuthStatus } from "../store/authSlice";

export function useSupabaseSession(
    onSessionChange?: (session: Session | null) => void
) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        let active = true;

        supabase.auth.getSession().then(({ data, error}) => {
            if(error) {
                console.error("Cannot get token!",error);
            }

            if(active) {
                dispatch(setAuthStatus(data.session ? "authenticated" : "unauthenticated"));
            }
        })

        const {data} = supabase.auth.onAuthStateChange((_event, nextSession) => {
            dispatch(setAuthStatus(nextSession ? "authenticated" : "unauthenticated"));
            onSessionChange?.(nextSession);
        })

        return () => {
            active = false;
            data.subscription.unsubscribe();
        }
    }, [dispatch, onSessionChange])
}