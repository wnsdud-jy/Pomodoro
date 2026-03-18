"use client";

import { Toast, ToastDescription, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { dismissToast, useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastViewport>
      {toasts.map((item) => (
        <Toast
          key={item.id}
          onDismiss={() => dismissToast(item.id)}
          variant={item.variant}
        >
          <ToastTitle>{item.title}</ToastTitle>
          {item.description ? (
            <ToastDescription>{item.description}</ToastDescription>
          ) : null}
        </Toast>
      ))}
    </ToastViewport>
  );
}
