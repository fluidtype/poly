"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useGlobalFilters } from "@/stores/useGlobalFilters";
import {
  BbvaParams,
  BilateralParams,
  ContextParams,
  CountryParams,
  GdeltMode,
  useGdeltMode,
} from "@/stores/useGdeltMode";

const MAX_RANGE_DAYS = 365;

type AdvancedModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CountryOption = {
  value: string;
  label: string;
};

function parseYYYYMMDD(value: string): Date {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  return new Date(Date.UTC(year, month - 1, day));
}

function differenceInDays(start: Date, end: Date): number {
  const normalizedStart = start.getTime();
  const normalizedEnd = end.getTime();
  return Math.floor(Math.abs(normalizedEnd - normalizedStart) / (24 * 60 * 60 * 1000)) + 1;
}

function formatRange(start: string, end: string) {
  const toDisplay = (value: string) =>
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  return `${toDisplay(start)} → ${toDisplay(end)}`;
}

export default function AdvancedModal({ open, onOpenChange }: AdvancedModalProps) {
  const { toast } = useToast();
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);
  const keywords = useGlobalFilters((state) => state.keywords);

  const { mode, params, setMode } = useGdeltMode();

  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<GdeltMode>(mode);
  const [contextParams, setContextParams] = useState<ContextParams>(() => ({
    includeInsights: params.context?.includeInsights ?? true,
    limit: params.context?.limit ?? 500,
  }));
  const [countryParams, setCountryParams] = useState<CountryParams>(() => ({
    country: params.country?.country ?? "USA",
  }));
  const [bilateralParams, setBilateralParams] = useState<BilateralParams>(() => ({
    country1: params.bilateral?.country1 ?? "USA",
    country2: params.bilateral?.country2 ?? "CHN",
  }));
  const [bbvaParams, setBbvaParams] = useState<BbvaParams>(() => ({
    actor1: params.bbva?.actor1 ?? "USA",
    actor2: params.bbva?.actor2 ?? "CHN",
    includeTotal: params.bbva?.includeTotal ?? false,
    cameoCodes: params.bbva?.cameoCodes ?? "",
  }));

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveTab(mode);
    setContextParams({
      includeInsights: params.context?.includeInsights ?? true,
      limit: params.context?.limit ?? 500,
    });
    setCountryParams({ country: params.country?.country ?? "USA" });
    setBilateralParams({
      country1: params.bilateral?.country1 ?? "USA",
      country2: params.bilateral?.country2 ?? "CHN",
    });
    setBbvaParams({
      actor1: params.bbva?.actor1 ?? "USA",
      actor2: params.bbva?.actor2 ?? "CHN",
      includeTotal: params.bbva?.includeTotal ?? false,
      cameoCodes: params.bbva?.cameoCodes ?? "",
    });
  }, [mode, open, params.bbva, params.bilateral, params.context, params.country]);

  const countryOptions = useMemo<CountryOption[]>(
    () => [
      { value: "USA", label: "United States" },
      { value: "CHN", label: "China" },
      { value: "RUS", label: "Russia" },
      { value: "UKR", label: "Ukraine" },
      { value: "ISR", label: "Israel" },
      { value: "IRN", label: "Iran" },
      { value: "DEU", label: "Germany" },
      { value: "FRA", label: "France" },
      { value: "GBR", label: "United Kingdom" },
      { value: "TUR", label: "Turkey" },
      { value: "IND", label: "India" },
      { value: "PAK", label: "Pakistan" },
      { value: "SAU", label: "Saudi Arabia" },
      { value: "BRA", label: "Brazil" },
      { value: "ZAF", label: "South Africa" },
      { value: "AUS", label: "Australia" },
      { value: "CAN", label: "Canada" },
      { value: "JPN", label: "Japan" },
    ],
    []
  );

  const applyContext = () => {
    const limit = Number.isFinite(Number(contextParams.limit))
      ? Math.max(1, Math.min(1000, Number(contextParams.limit)))
      : 500;

    setMode("context", { includeInsights: contextParams.includeInsights, limit });
    return true;
  };

  const applyCountry = () => {
    if (!countryParams.country) {
      toast({
        title: "Select a country",
        description: "Choose a country to run a country-level query.",
      });
      return false;
    }

    setMode("country", { country: countryParams.country });
    return true;
  };

  const applyBilateral = () => {
    if (!bilateralParams.country1 || !bilateralParams.country2) {
      toast({
        title: "Missing countries",
        description: "Select both countries to run a bilateral query.",
      });
      return false;
    }

    if (bilateralParams.country1 === bilateralParams.country2) {
      toast({
        title: "Distinct countries required",
        description: "Choose two different countries for bilateral coverage.",
      });
      return false;
    }

    setMode("bilateral", {
      country1: bilateralParams.country1,
      country2: bilateralParams.country2,
    });
    return true;
  };

  const applyBbva = () => {
    if (!bbvaParams.actor1 || !bbvaParams.actor2) {
      toast({
        title: "Missing actors",
        description: "Select both actors to compare conflict coverage.",
      });
      return false;
    }

    setMode("bbva", {
      actor1: bbvaParams.actor1,
      actor2: bbvaParams.actor2,
      includeTotal: bbvaParams.includeTotal,
      cameoCodes: bbvaParams.cameoCodes?.trim() || undefined,
    });
    return true;
  };

  const handleApply = () => {
    const start = parseYYYYMMDD(dateStart);
    const end = parseYYYYMMDD(dateEnd);
    const days = differenceInDays(start, end);

    if (days > MAX_RANGE_DAYS) {
      toast({
        title: "Range too large",
        description: "Advanced queries are limited to 365 days.",
      });
      return;
    }

    let applied = true;

    switch (activeTab) {
      case "context":
        applied = applyContext();
        break;
      case "country":
        applied = applyCountry();
        break;
      case "bilateral":
        applied = applyBilateral();
        break;
      case "bbva":
        applied = applyBbva();
        break;
      default:
        applied = false;
        break;
    }

    if (applied) {
      toast({
        title: "Advanced mode applied",
        description: `Running ${activeTab} mode for ${formatRange(dateStart, dateEnd)}${
          keywords.length ? ` • ${keywords.join(", ")}` : ""
        }`,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[color:var(--surface-3)]/95">
        <DialogHeader className="space-y-2">
          <DialogTitle>Advanced GDELT modes</DialogTitle>
          <DialogDescription className="text-[color:var(--muted)]">
            Tailor the request type for the active date range {formatRange(dateStart, dateEnd)}.
          </DialogDescription>
        </DialogHeader>

        {!hydrated ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 rounded-2xl bg-gradient-to-r from-[color:var(--surface-2)] to-[color:var(--surface)]/60 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GdeltMode)} className="space-y-5">
            <TabsList className="relative flex w-full flex-wrap justify-start gap-2 rounded-2xl bg-[color:var(--surface-2)]/60 p-1">
              <TabsTrigger value="context" className="px-4 py-1.5">
                Context
              </TabsTrigger>
              <TabsTrigger value="country" className="px-4 py-1.5">
                Country
              </TabsTrigger>
              <TabsTrigger value="bilateral" className="px-4 py-1.5">
                Bilateral
              </TabsTrigger>
              <TabsTrigger value="bbva" className="px-4 py-1.5">
                BBVA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="context" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--border)]/50 bg-[color:var(--surface-2)]/60 p-4">
                  <h3 className="text-sm font-semibold text-[color:var(--text)]">Insights</h3>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    Include aggregated insights alongside the event series response.
                  </p>
                  <label className="mt-3 flex items-center gap-3 text-sm text-[color:var(--text)]">
                    <Checkbox
                      checked={contextParams.includeInsights}
                      onCheckedChange={(checked) =>
                        setContextParams((prev) => ({
                          ...prev,
                          includeInsights: Boolean(checked),
                        }))
                      }
                    />
                    Include insights panel data
                  </label>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)]/50 bg-[color:var(--surface-2)]/60 p-4">
                  <h3 className="text-sm font-semibold text-[color:var(--text)]">Result window</h3>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    Limit the maximum number of timeline rows returned from the proxy.
                  </p>
                  <div className="mt-3">
                    <label className="text-xs uppercase tracking-wide text-[color:var(--muted)]">
                      Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={contextParams.limit}
                      onChange={(event) =>
                        setContextParams((prev) => ({
                          ...prev,
                          limit: Number(event.target.value),
                        }))
                      }
                      className="mt-1 w-full rounded-2xl border border-[color:var(--border)]/60 bg-[color:var(--surface)]/70 px-3 py-2 text-sm text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/45"
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-[color:var(--border)]/60 bg-[color:var(--surface-2)]/40 p-4 text-xs text-[color:var(--muted)]">
                Keywords in play: {keywords.length ? keywords.join(", ") : "None"}
              </div>
            </TabsContent>

            <TabsContent value="country" className="space-y-4">
              <div className="rounded-2xl border border-[color:var(--border)]/50 bg-[color:var(--surface-2)]/60 p-4">
                <label className="text-xs uppercase tracking-wide text-[color:var(--muted)]">
                  Country
                </label>
                <Select
                  value={countryParams.country}
                  onValueChange={(value) => setCountryParams({ country: value })}
                >
                  <SelectTrigger className="mt-2" aria-label="Select country">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="bilateral" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {["country1", "country2"].map((field, index) => (
                  <div
                    key={field}
                    className="rounded-2xl border border-[color:var(--border)]/50 bg-[color:var(--surface-2)]/60 p-4"
                  >
                    <label className="text-xs uppercase tracking-wide text-[color:var(--muted)]">
                      {index === 0 ? "Primary country" : "Counterparty"}
                    </label>
                    <Select
                      value={(bilateralParams as Record<string, string>)[field]}
                      onValueChange={(value) =>
                        setBilateralParams((prev) => ({
                          ...prev,
                          [field]: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2" aria-label={index === 0 ? "Primary country" : "Counterparty"}>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[color:var(--muted)]">
                Compare bilateral coverage between two actors. Daily timeline is returned when available.
              </p>
            </TabsContent>

            <TabsContent value="bbva" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {["actor1", "actor2"].map((field, index) => (
                  <div
                    key={field}
                    className="rounded-2xl border border-[color:var(--border)]/50 bg-[color:var(--surface-2)]/60 p-4"
                  >
                    <label className="text-xs uppercase tracking-wide text-[color:var(--muted)]">
                      {index === 0 ? "Actor 1" : "Actor 2"}
                    </label>
                    <Select
                      value={(bbvaParams as Record<string, string | boolean>)[field] as string}
                      onValueChange={(value) =>
                        setBbvaParams((prev) => ({
                          ...prev,
                          [field]: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2" aria-label={index === 0 ? "Actor 1" : "Actor 2"}>
                        <SelectValue placeholder="Select an actor" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-[color:var(--border)]/50 bg-[color:var(--surface-2)]/60 p-4">
                <label className="flex items-center gap-3 text-sm text-[color:var(--text)]">
                  <Checkbox
                    checked={bbvaParams.includeTotal}
                    onCheckedChange={(checked) =>
                      setBbvaParams((prev) => ({
                        ...prev,
                        includeTotal: Boolean(checked),
                      }))
                    }
                  />
                  Include total conflict coverage
                </label>
                <div className="mt-4">
                  <label className="text-xs uppercase tracking-wide text-[color:var(--muted)]">
                    CAMEO codes (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 141,142"
                    value={bbvaParams.cameoCodes}
                    onChange={(event) =>
                      setBbvaParams((prev) => ({
                        ...prev,
                        cameoCodes: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-2xl border border-[color:var(--border)]/60 bg-[color:var(--surface)]/70 px-3 py-2 text-sm text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/45"
                  />
                </div>
              </div>
              <p className="text-xs text-[color:var(--muted)]">
                Use BBVA conflict coverage mode for specialized bilateral analysis filters.
              </p>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply mode</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
