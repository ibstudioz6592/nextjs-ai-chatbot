"use client";

import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto",
        // Heading styles - bold and prominent
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4",
        "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-3",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3",
        // Subheading and paragraph styles - lighter
        "[&_h4]:text-base [&_h4]:font-medium [&_h4]:mb-1.5 [&_h4]:mt-2 [&_h4]:text-muted-foreground",
        "[&_h5]:text-sm [&_h5]:font-medium [&_h5]:mb-1 [&_h5]:mt-2 [&_h5]:text-muted-foreground",
        "[&_p]:mb-2 [&_p]:leading-relaxed",
        // List styles
        "[&_ul]:mb-3 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1",
        "[&_ol]:mb-3 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:space-y-1",
        "[&_li]:leading-relaxed",
        // Strong and emphasis
        "[&_strong]:font-bold [&_strong]:text-foreground",
        "[&_em]:italic [&_em]:text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
