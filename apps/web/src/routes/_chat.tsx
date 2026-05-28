import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";

import { useCommandPaletteStore } from "../commandPaletteStore";
import { useHandleNewThread } from "../hooks/useHandleNewThread";
import {
  startNewLocalThreadFromContext,
  startNewThreadFromContext,
} from "../lib/chatThreadActions";
import { isTerminalFocused } from "../lib/terminalFocus";
import { resolveShortcutCommand } from "../keybindings";
import { selectThreadTerminalState, useTerminalStateStore } from "../terminalStateStore";
import { useThreadSelectionStore } from "../threadSelectionStore";
import { resolveSidebarNewThreadEnvMode } from "~/components/Sidebar.logic";
import { useSettings } from "~/hooks/useSettings";
import { useServerKeybindings } from "~/rpc/serverState";
import { fetchHostedSession } from "../hosted/apiClient";
import { assertSessionMayEnterApp } from "../hosted/checkHostedAccess";
import { getSupabaseBrowserClient } from "../hosted/supabaseClient";
import {
  isHostedAuthConfigured,
  isHostedControlPlaneConfigured,
  isSupabaseHostedAuthConfigured,
} from "../hosted/config";
import { readHostedCodexConnected } from "../hosted/hostedCodexConnection";
import { readHostedProfileComplete } from "../hosted/onboardingStorage";

function ChatRouteGlobalShortcuts() {
  const clearSelection = useThreadSelectionStore((state) => state.clearSelection);
  const selectedThreadKeysSize = useThreadSelectionStore((state) => state.selectedThreadKeys.size);
  const { activeDraftThread, activeThread, defaultProjectRef, handleNewThread, routeThreadRef } =
    useHandleNewThread();
  const keybindings = useServerKeybindings();
  const terminalOpen = useTerminalStateStore((state) =>
    routeThreadRef
      ? selectThreadTerminalState(state.terminalStateByThreadKey, routeThreadRef).terminalOpen
      : false,
  );
  const appSettings = useSettings();

  useEffect(() => {
    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const command = resolveShortcutCommand(event, keybindings, {
        context: {
          terminalFocus: isTerminalFocused(),
          terminalOpen,
        },
      });

      if (useCommandPaletteStore.getState().open) {
        return;
      }

      if (event.key === "Escape" && selectedThreadKeysSize > 0) {
        event.preventDefault();
        clearSelection();
        return;
      }

      if (command === "chat.newLocal") {
        event.preventDefault();
        event.stopPropagation();
        void startNewLocalThreadFromContext({
          activeDraftThread,
          activeThread,
          defaultProjectRef,
          defaultThreadEnvMode: resolveSidebarNewThreadEnvMode({
            defaultEnvMode: appSettings.defaultThreadEnvMode,
          }),
          handleNewThread,
        });
        return;
      }

      if (command === "chat.new") {
        event.preventDefault();
        event.stopPropagation();
        void startNewThreadFromContext({
          activeDraftThread,
          activeThread,
          defaultProjectRef,
          defaultThreadEnvMode: resolveSidebarNewThreadEnvMode({
            defaultEnvMode: appSettings.defaultThreadEnvMode,
          }),
          handleNewThread,
        });
      }
    };

    window.addEventListener("keydown", onWindowKeyDown);
    return () => {
      window.removeEventListener("keydown", onWindowKeyDown);
    };
  }, [
    activeDraftThread,
    activeThread,
    clearSelection,
    handleNewThread,
    keybindings,
    defaultProjectRef,
    selectedThreadKeysSize,
    terminalOpen,
    appSettings.defaultThreadEnvMode,
  ]);

  return null;
}

function ChatRouteLayout() {
  return (
    <>
      <ChatRouteGlobalShortcuts />
      <Outlet />
    </>
  );
}

export const Route = createFileRoute("/_chat")({
  beforeLoad: async ({ context }) => {
    if (context.authGateState.status !== "authenticated") {
      throw redirect({
        to: isHostedAuthConfigured() ? "/welcome" : "/pair",
        replace: true,
      });
    }

    if (isHostedAuthConfigured()) {
      let hostedEmail: string | undefined;
      if (isHostedControlPlaneConfigured()) {
        const hostedSession = await fetchHostedSession();
        hostedEmail = hostedSession.user?.email;
        if (hostedSession.authenticated && hostedEmail) {
          const access = await assertSessionMayEnterApp(hostedEmail);
          if (!access.ok) {
            throw redirect({
              to: "/access-denied",
              search: { message: access.userMessage },
              replace: true,
            });
          }
        }
        if (hostedSession.authenticated && !readHostedProfileComplete()) {
          throw redirect({ to: "/onboarding", replace: true });
        }
        if (
          hostedSession.authenticated &&
          readHostedProfileComplete() &&
          !readHostedCodexConnected()
        ) {
          throw redirect({ to: "/connect-provider", replace: true });
        }
      } else if (isSupabaseHostedAuthConfigured()) {
        let session: Session | null = null;
        let supabase: ReturnType<typeof getSupabaseBrowserClient> | null = null;
        try {
          supabase = getSupabaseBrowserClient();
          session = (await supabase.auth.getSession()).data.session ?? null;
        } catch {
          session = null;
        }
        if (session) {
          const access = await assertSessionMayEnterApp(session.user.email);
          if (!access.ok) {
            if (supabase) {
              await supabase.auth.signOut();
            }
            throw redirect({
              to: "/access-denied",
              search: { message: access.userMessage },
              replace: true,
            });
          }
        }
        if (session && !readHostedProfileComplete()) {
          throw redirect({ to: "/onboarding", replace: true });
        }
        if (session && readHostedProfileComplete() && !readHostedCodexConnected()) {
          throw redirect({ to: "/connect-provider", replace: true });
        }
      }
    }
  },
  component: ChatRouteLayout,
});
