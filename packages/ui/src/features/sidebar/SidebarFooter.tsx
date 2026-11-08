/**
 * The bottom bar of the sidebar containing the user name and the Settings button.
 */

import { Button, ChartArea, Settings, UserAvatar } from "@openbot/ui";
import { Show } from "solid-js";
import { useText } from "../../text";
import { useSidebarScope } from "./sidebar-scope";

export function SidebarFooter() {
  const { props } = useSidebarScope();
  const { t } = useText();

  const userName = () =>
    props.userName || props.user?.name?.trim() || (props.user?.email ? props.user.email.split("@")[0] : "") || "";

  return (
    <div class="sidebar-footer">
      <div class="sidebar-user-info">
        <Show when={props.user}>{(user) => <UserAvatar user={user()} class="sidebar-user-avatar" decorative />}</Show>
        <Show when={userName()}>
          <span class="sidebar-user-name" title={userName()}>
            {userName()}
          </span>
        </Show>
      </div>
      <div class="sidebar-footer-actions">
        <Show when={props.onOpenUsage}>
          <Button
            variant="ghost"
            type="button"
            class="sidebar-icon-button sidebar-usage-button no-drag"
            onClick={(event) => props.onOpenUsage?.(event.currentTarget)}
            aria-label={t("app.rail.usage")}
            title={t("app.rail.usage")}
          >
            <ChartArea class="sidebar-usage-icon" aria-hidden="true" />
          </Button>
        </Show>
        <Show when={props.onOpenSettings}>
          <Button
            variant="ghost"
            type="button"
            class="sidebar-icon-button sidebar-settings-button no-drag"
            onClick={(event) => props.onOpenSettings?.(event.currentTarget)}
            aria-label={t("app.rail.settings")}
            title={t("app.rail.settings")}
          >
            <Settings class="sidebar-settings-icon" aria-hidden="true" />
          </Button>
        </Show>
      </div>
    </div>
  );
}
