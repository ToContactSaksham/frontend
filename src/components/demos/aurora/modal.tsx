"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  description: string;
  trigger: string;
  onConfirm: (value: string) => void;
}

/**
 * Modal on the native <dialog>: focus is trapped and restored by the
 * browser, Escape closes, and clicking the backdrop dismisses.
 */
export function Modal({ title, description, trigger, onConfirm }: Props) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onConfirm(value.trim() || "(empty)");
    setOpen(false);
    setValue("");
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {trigger}
      </Button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        className="fixed left-1/2 top-1/2 m-0 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-0 bg-transparent p-0 text-fg outline-none open:animate-fade-up"
      >
        <form onSubmit={submit} className="card p-6">
          <h3 id={`${id}-title`} className="text-lg font-semibold">
            {title}
          </h3>
          <p id={`${id}-desc`} className="mt-1 text-sm text-fg-muted">
            {description}
          </p>
          <label htmlFor={`${id}-input`} className="mt-5 block text-sm font-medium">
            Project name
          </label>
          <input
            id={`${id}-input`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className="mt-1.5 h-10 w-full rounded-xl border border-border bg-bg px-3 text-sm outline-none focus:border-accent"
            placeholder="aurora-ui"
          />
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Create
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
