"use client";

import { useEffect, useState } from "react";

type ToastVariant = "default" | "success" | "destructive";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
};

type ToastState = {
  toasts: ToastItem[];
};

const listeners = new Set<(state: ToastState) => void>();
const timeoutMap = new Map<string, ReturnType<typeof setTimeout>>();

let memoryState: ToastState = {
  toasts: [],
};

function emit() {
  for (const listener of listeners) {
    listener(memoryState);
  }
}

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}

export function dismissToast(id: string) {
  const existingTimeout = timeoutMap.get(id);

  if (existingTimeout) {
    clearTimeout(existingTimeout);
    timeoutMap.delete(id);
  }

  memoryState = {
    toasts: memoryState.toasts.filter((toast) => toast.id !== id),
  };
  emit();
}

export function toast(input: Omit<ToastItem, "id">) {
  const id = createToastId();
  const nextToast: ToastItem = {
    id,
    duration: 4200,
    variant: "default",
    ...input,
  };

  memoryState = {
    toasts: [nextToast, ...memoryState.toasts].slice(0, 4),
  };
  emit();

  const timeoutId = setTimeout(() => {
    dismissToast(id);
  }, nextToast.duration);

  timeoutMap.set(id, timeoutId);

  return {
    id,
    dismiss: () => dismissToast(id),
  };
}

export function useToast() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    toast,
    dismissToast,
  };
}
