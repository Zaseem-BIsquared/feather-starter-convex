import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { navItems } from "@/shared/nav";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("command-palette");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSelect(to: string) {
    setOpen(false);
    navigate({ to });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Command dialog */}
      <div className="absolute left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2">
        <Command
          className="rounded-xl border border-border bg-card shadow-2xl"
          label={t("label")}
        >
          <Command.Input
            placeholder={t("placeholder")}
            className="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-primary outline-none placeholder:text-primary/40"
          />
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="px-4 py-6 text-center text-sm text-primary/60">
              {t("empty")}
            </Command.Empty>

            <Command.Group
              heading={t("navigation")}
              className="text-xs font-medium text-primary/40 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
            >
              {navItems.map((item) => (
                <Command.Item
                  key={item.to}
                  value={item.label}
                  onSelect={() => handleSelect(item.to)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary/80 aria-selected:bg-primary/5 aria-selected:text-primary"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary text-xs font-medium text-primary/60">
                    {item.label.charAt(0)}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-primary/40">{item.to}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <div className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-primary/60">
                Esc
              </kbd>
              <span className="text-xs text-primary/40">{t("close")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-primary/60">
                Enter
              </kbd>
              <span className="text-xs text-primary/40">{t("select")}</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
