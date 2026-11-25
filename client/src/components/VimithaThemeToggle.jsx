import { useState } from "react";
import { Button, Switch, Tooltip } from "@heroui/react";
import { RefreshCw } from "lucide-react";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import { useToast } from "./ToastProvider";

export function VimithaThemeToggle() {
  const { data, loading, error, refresh } = useApi("/appearance");
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  async function change(enabled) {
    if (saving || loading || !data || error) return;
    setSaving(true);
    try {
      await api.post("/appearance", { vimithaThemeEnabled: enabled });
      refresh();
      push({
        type: "success",
        title: enabled ? "Vimitha theme enabled" : "Vimitha theme disabled",
        description:
          "Her hidden menus and community privacy stay unchanged. Open sessions update within a few seconds.",
      });
    } catch (err) {
      push({
        type: "error",
        title: "Could not update Vimitha theme",
        description: err.message,
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Tooltip
        content={
          error
            ? "Could not load theme setting. Retry to continue."
            : "Vimitha’s custom appearance only. Hidden menus and privacy stay unchanged."
        }
      >
        <div>
          <Switch
            size="sm"
            color="secondary"
            aria-label="Vimitha custom theme"
            isSelected={data?.vimithaThemeEnabled === true}
            isDisabled={loading || saving || !data || !!error}
            onValueChange={change}
            classNames={{ base: "gap-1", label: "text-xs", wrapper: "mr-1" }}
          >
            Vimitha
          </Switch>
        </div>
      </Tooltip>
      {error ? (
        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label="Retry Vimitha theme setting"
          onPress={refresh}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      ) : null}
    </div>
  );
}
