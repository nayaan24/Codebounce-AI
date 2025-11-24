import { stackServerApp } from "@/auth/stack-auth";
import { StackHandler } from "@stackframe/stack";
import { AccountSettingsHomeButton } from "@/components/account-settings-home-button";

export default function Handler(props: unknown) {
  return (
    <div className="relative min-h-screen">
      <AccountSettingsHomeButton />
      <StackHandler fullPage app={stackServerApp} routeProps={props} />
    </div>
  );
}
