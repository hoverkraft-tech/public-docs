import type { PropsWithChildren } from "react";
import React from "react";

export default function Layout({
  children,
  description,
  title,
}: PropsWithChildren<{ description?: string; title?: string }>) {
  return (
    <div data-description={description} data-testid="layout" data-title={title}>
      {children}
    </div>
  );
}
