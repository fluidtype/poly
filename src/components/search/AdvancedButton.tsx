"use client";

import { useState } from "react";

import AdvancedModal from "@/components/gdelt/AdvancedModal";
import { pill } from "@/components/search/pill";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdvancedButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className={cn(pill, "h-auto bg-transparent px-3 py-1.5 text-[13px]")}
        onClick={() => setOpen(true)}
      >
        Advanced
      </Button>
      <AdvancedModal open={open} onOpenChange={setOpen} />
    </>
  );
}
