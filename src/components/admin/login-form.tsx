// SPEC: SPEC-PAGES > /admin/login > Login form
// DEP-MAP: Auth > CLIENT > LoginForm
"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginTeam } from "@/lib/actions/auth";
import type { AuthResult } from "@/lib/types/auth";

export function LoginForm() {
  const [state, action, isPending] = useActionState<AuthResult<null> | null, FormData>(
    loginTeam,
    null
  );

  return (
    <form action={action} className="space-y-4">
      {state && !state.success && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-red-300">
          {state.error.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-200">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@botmakers.ai"
          className="border-white/20 bg-white/10 text-white placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-200">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Enter your password"
          className="border-white/20 bg-white/10 text-white placeholder:text-gray-400"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
