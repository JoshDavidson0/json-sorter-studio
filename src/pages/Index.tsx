import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Play, Download, ArrowLeft, AlertCircle, Braces, ArrowUpDown } from "lucide-react";
import SortableKeyCard from "@/components/SortableKeyCard";
import JsonHighlighter from "@/components/JsonHighlighter";

const SAMPLE_JSON = JSON.stringify(
  [
    { Year: 2020, Make: "Toyota", Model: "Camry", Price: 24000 },
    { Year: 2019, Make: "Honda", Model: "Civic", Price: 22000 },
    { Year: 2020, Make: "Honda", Model: "Accord", Price: 26000 },
    { Year: 2019, Make: "Toyota", Model: "Corolla", Price: 20000 },
  ],
  null,
  2
);

const Index = () => {
  const [input, setInput] = useState("");
  const [sortedResult, setSortedResult] = useState<string | null>(null);
  const [keys, setKeys] = useState<string[]>([]);

  const parsedData = useMemo(() => {
    if (!input.trim()) return { valid: false, data: null, error: "" };
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) return { valid: false, data: null, error: "Input must be a JSON array" };
      if (parsed.length === 0) return { valid: false, data: null, error: "Array is empty" };
      if (!parsed.every((item) => typeof item === "object" && item !== null && !Array.isArray(item)))
        return { valid: false, data: null, error: "All array items must be objects" };
      return { valid: true, data: parsed, error: "" };
    } catch {
      return { valid: false, data: null, error: "Invalid JSON syntax" };
    }
  }, [input]);

  // Extract keys when data changes
  useMemo(() => {
    if (parsedData.valid && parsedData.data) {
      const allKeys = new Set<string>();
      parsedData.data.forEach((obj: Record<string, unknown>) =>
        Object.keys(obj).forEach((k) => allKeys.add(k))
      );
      setKeys((prev) => {
        const newKeys = Array.from(allKeys);
        // Keep existing order for keys that still exist, append new ones
        const kept = prev.filter((k) => newKeys.includes(k));
        const added = newKeys.filter((k) => !prev.includes(k));
        return [...kept, ...added];
      });
    }
  }, [parsedData.valid, parsedData.data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setKeys((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handleSort = () => {
    if (!parsedData.valid || !parsedData.data) return;
    const sorted = [...parsedData.data].sort((a, b) => {
      for (const key of keys) {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal === bVal) continue;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "number" && typeof bVal === "number") {
          return aVal - bVal;
        }
        return String(aVal).localeCompare(String(bVal));
      }
      return 0;
    });
    setSortedResult(JSON.stringify(sorted, null, 2));
  };

  const handleDownload = () => {
    if (!sortedResult) return;
    const blob = new Blob([sortedResult], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sorted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const showingResult = sortedResult !== null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Braces className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">JSON Sort</h1>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground font-mono">
            v1.0
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr,auto,1fr] items-start">
          {/* Left: Input */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Braces className="h-4 w-4 text-muted-foreground" />
                JSON Input
              </label>
              <button
                onClick={() => setInput(SAMPLE_JSON)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Load sample
              </button>
            </div>
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setSortedResult(null);
                }}
                placeholder='Paste a JSON array here...\n[\n  { "Year": 2020, "Make": "Toyota" },\n  ...\n]'
                className="h-[520px] w-full resize-none rounded-lg border border-border bg-card p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                spellCheck={false}
              />
              {input.trim() && !parsedData.valid && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <span className="text-xs text-destructive">{parsedData.error}</span>
                </div>
              )}
              {parsedData.valid && (
                <div className="absolute bottom-3 right-3 rounded-md bg-primary/10 border border-primary/20 px-3 py-1.5">
                  <span className="text-xs text-primary font-mono">
                    ✓ {parsedData.data!.length} objects
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Center: Play button */}
          <div className="flex items-center justify-center lg:pt-64">
            <button
              onClick={handleSort}
              disabled={!parsedData.valid}
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 enabled:animate-pulse-glow"
              title="Sort JSON"
            >
              <Play className="h-6 w-6 ml-0.5" />
            </button>
          </div>

          {/* Right: Keys or Result */}
          <div className="flex flex-col gap-3">
            {!showingResult ? (
              <>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-foreground">
                    Sort Priority
                  </label>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Drag to reorder
                  </span>
                </div>
                {keys.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={keys} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 min-h-[520px]">
                        {keys.map((key, i) => (
                          <SortableKeyCard key={key} id={key} index={i} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 min-h-[520px] text-center">
                    <ArrowUpDown className="h-10 w-10 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Paste valid JSON to extract sortable keys
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSortedResult(null)}
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to keys
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download JSON
                  </button>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 min-h-[520px] max-h-[520px] overflow-auto">
                  <JsonHighlighter json={sortedResult} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
