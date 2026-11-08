/**
 * The brand name, and window controls - plus the window drag region.
 */

import { Bot, Button, DropdownMenu, FolderPlus, Hash, House, ListChecks, Store, Workflow } from "@openbot/ui";
import { Show } from "solid-js";
import { useText } from "../../text";
import { PlusIcon, SidebarToggleIcon } from "./SidebarIcons";
import { useSidebarScope } from "./sidebar-scope";

const BRAND_NAME = "Element";

export function normalizeServerDisplayName(name: string): { label: string; isLocal: boolean } {
  if (!name || name.startsWith("OpenBot") || name.toLowerCase().includes("local dev")) {
    return { label: BRAND_NAME, isLocal: true };
  }
  return { label: name, isLocal: false };
}

export function SidebarTopbar() {
  const { layoutMutable, props, startCreateSection } = useSidebarScope();
  const { t } = useText();
  const brandTitle = () => BRAND_NAME;
  return (
    <div class="window-drag sidebar-topbar">
      <button
        type="button"
        class="sidebar-server-name sidebar-brand-name sidebar-brand-button no-drag"
        aria-hidden={props.compact ? "true" : undefined}
        onClick={() => props.onOpenHome?.()}
        title={t("sitePage.report.home")}
      >
        <span class="sidebar-server-name-label" dir="auto">
          {brandTitle()}
        </span>
      </button>
      <div class="sidebar-topbar-actions">
        <Show when={props.onOpenHome && !props.compact}>
          <Button
            variant="ghost"
            type="button"
            class="sidebar-icon-button sidebar-home-button no-drag"
            onClick={() => props.onOpenHome?.()}
            data-cuelume-tap="navigate"
            aria-label={t("sitePage.report.home")}
            title={t("sitePage.report.home")}
          >
            <House aria-hidden="true" />
          </Button>
        </Show>
        <Show when={props.onOpenTasks && !props.compact}>
          <Button
            variant="ghost"
            type="button"
            class="sidebar-icon-button sidebar-tasks-button no-drag"
            onClick={() => props.onOpenTasks?.()}
            data-cuelume-tap="navigate"
            aria-label={t("app.rail.tasks")}
            title={t("app.rail.tasks")}
          >
            <ListChecks aria-hidden="true" />
          </Button>
        </Show>
        <Show when={props.onOpenWorkflows && !props.compact}>
          <Button
            variant="ghost"
            type="button"
            class="sidebar-icon-button sidebar-workflows-button no-drag"
            onClick={() => props.onOpenWorkflows?.()}
            data-cuelume-tap="navigate"
            aria-label={t("app.rail.workflows")}
            title={t("app.rail.workflows")}
          >
            <Workflow aria-hidden="true" />
          </Button>
        </Show>
        <Show when={!props.compact && props.marketplaceSupported !== false}>
          <Button
            variant="ghost"
            type="button"
            class="sidebar-icon-button sidebar-marketplace-button no-drag"
            onClick={() => props.onOpenMarketplace()}
            data-cuelume-tap="navigate"
            aria-label={t("sidebar.topbar.openMarketplace")}
            title={t("sidebar.topbar.marketplace")}
          >
            <Store aria-hidden="true" />
          </Button>
        </Show>
        <Show when={props.createSupported !== false || props.onCreateChannel || layoutMutable()}>
          <DropdownMenu.Root placement="bottom-end" gutter={4}>
            <DropdownMenu.Trigger
              class="sidebar-icon-button sidebar-new-button no-drag"
              aria-label={props.onCreateChannel ? t("sidebar.new.menuWithChannel") : t("sidebar.new.menu")}
              aria-hidden={props.compact ? "true" : undefined}
              tabindex={props.compact ? -1 : 0}
              title={t("sidebar.new.agent")}
            >
              <PlusIcon />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content>
                <Show when={props.createSupported !== false}>
                  <DropdownMenu.Item onSelectAfterClose={props.onCreateAgent}>
                    <Bot aria-hidden="true" />
                    {t("sidebar.new.agent")}
                  </DropdownMenu.Item>
                </Show>
                <Show when={props.onCreateChannel}>
                  <DropdownMenu.Item onSelectAfterClose={() => props.onCreateChannel?.()}>
                    <Hash aria-hidden="true" />
                    {t("sidebar.new.channel")}
                  </DropdownMenu.Item>
                </Show>
                <Show when={layoutMutable()}>
                  <DropdownMenu.Item onSelectAfterClose={() => startCreateSection()}>
                    <FolderPlus aria-hidden="true" />
                    {t("sidebar.new.section")}
                  </DropdownMenu.Item>
                </Show>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </Show>
        <Show
          when={props.compact}
          fallback={
            <Show when={props.onCollapse}>
              <Button
                variant="ghost"
                type="button"
                class="sidebar-icon-button sidebar-toggle-button no-drag"
                onClick={() => props.onCollapse?.()}
                data-cuelume-tap="open"
                aria-label={t("conversation.sidePanel.close")}
                aria-controls="agent-sidebar"
                aria-expanded="true"
                title={t("conversation.sidePanel.close")}
              >
                <SidebarToggleIcon />
              </Button>
            </Show>
          }
        >
          <Button
            variant="ghost"
            type="button"
            class="sidebar-icon-button sidebar-toggle-button no-drag"
            onClick={() => props.onExpand()}
            data-cuelume-tap="open"
            aria-label={t("sidebar.topbar.expand")}
            aria-controls="agent-sidebar"
            aria-expanded="false"
            title={t("sidebar.topbar.expand")}
          >
            <SidebarToggleIcon />
          </Button>
        </Show>
      </div>
    </div>
  );
}
