// SPEC: SPEC-PAGES > /portal/login > Magic link form
// DEP-MAP: Auth > CLIENT > MagicLinkForm
"use client";

import { useActionState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPortalMagicLink } from "@/lib/actions/auth";
import type { AuthResult } from "@/lib/types/auth";

export function MagicLinkForm() {
  const [state, action, isPending] = useActionState<AuthResult<null> | null, FormData>(
    sendPortalMagicLink,
    null
  );

  // Show success state after magic link sent
  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#03FF00]/10">
          <Mail className="h-6 w-6 text-[#03FF00]" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-[#033457]">Check your email</p>
          <p className="text-sm text-muted-foreground">
            We sent a login link to your email address. Click the link to sign
            in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state && !state.success && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
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
            Sending link...
          </>
        ) : (
          "Send Login Link"
        )}
      </Button>
    </form>
  );
}
