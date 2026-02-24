import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableKeyCardProps {
  id: string;
  index: number;
}

const SortableKeyCard = ({ id, index }: SortableKeyCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border bg-secondary px-4 py-3 transition-colors ${
        isDragging
          ? "border-primary/50 bg-muted shadow-lg shadow-primary/10 z-50"
          : "border-border hover:border-muted-foreground/30"
      }`}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground font-mono">{id}</span>
      <span className="ml-auto rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
        #{index + 1}
      </span>
    </div>
  );
};

export default SortableKeyCard;
