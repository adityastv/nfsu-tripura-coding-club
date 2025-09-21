import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UrlTextProps {
  text: string;
  className?: string;
}

/**
 * Component that renders text with clickable, copyable URLs
 * Allows copying of URLs while respecting overall copy protection
 */
export function UrlText({ text, className }: UrlTextProps) {
  const { toast } = useToast();
  
  // URL regex pattern to detect URLs in text
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "The URL has been copied to your clipboard.",
      });
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast({
          title: "Link Copied",
          description: "The URL has been copied to your clipboard.",
        });
      } catch (fallbackErr) {
        toast({
          title: "Copy Failed",
          description: "Unable to copy the link. Please try selecting and copying manually.",
          variant: "destructive",
        });
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderTextWithUrls = (text: string) => {
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // This part is a URL
        return (
          <div key={index} className="inline-flex items-center gap-2 my-2 p-2 bg-muted rounded-md">
            <span className="text-sm font-mono text-primary break-all">{part}</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(part)}
                className="h-6 w-6 p-0 hover:bg-primary/10"
                title="Copy link"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openInNewTab(part)}
                className="h-6 w-6 p-0 hover:bg-primary/10"
                title="Open in new tab"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      } else {
        // This part is regular text
        return <span key={index}>{part}</span>;
      }
    });
  };

  return (
    <div className={cn("text-sm text-foreground whitespace-pre-wrap", className)}>
      {renderTextWithUrls(text)}
    </div>
  );
}