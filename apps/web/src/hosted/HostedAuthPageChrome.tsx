import type { ReactNode } from "react";

export function HostedAuthPageChrome(props: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-12 font-sans">
        <header className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-white">{props.title}</h1>
        </header>
        <div className="space-y-4 text-sm text-[#9CA3AF]">{props.children}</div>
      </div>
    </div>
  );
}
