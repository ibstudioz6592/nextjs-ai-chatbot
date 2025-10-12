'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidRendererProps {
  chart: string;
  id?: string;
}

export function MermaidRenderer({ chart, id = 'mermaid-' + Math.random().toString(36).substr(2, 9) }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const renderMermaid = async () => {
      if (!containerRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import to avoid SSR issues
        const mermaid = (await import('mermaid')).default;

        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
        });

        // Render the diagram
        const { svg } = await mermaid.render(id, chart);

        if (mounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        if (mounted) {
          setError('Failed to render diagram');
          setIsLoading(false);
        }
      }
    };

    renderMermaid();

    return () => {
      mounted = false;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
        <p className="text-sm font-medium">⚠️ Diagram Error</p>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/50 p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Rendering diagram...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container my-4 flex justify-center overflow-x-auto rounded-lg border border-border bg-background p-4"
      style={{ minHeight: '100px' }}
    />
  );
}
