"use client";

import { useState } from "react";
import { X, ExternalLink, Copy, Check } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { convertLink } from "@/lib/linkConverter";

interface AgentSelectorProps {
  productUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AgentSelector = ({
  productUrl,
  isOpen,
  onClose,
}: AgentSelectorProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // Use real conversion logic
  const result = convertLink(productUrl);
  const agentLinks = result.success && result.results ? result.results : [];

  const handleCopy = async (link: string, index: number) => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-bg-card border border-white/10 rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-bold text-text-primary text-base">
              Buy with Agent
            </h3>
            {result.platform && (
              <span className="text-xs text-text-muted capitalize">
                Platform: {result.platform}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-bg-hover hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Agent Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {agentLinks.length > 0 ? (
            agentLinks.map((agent, index) => (
              <div
                key={agent.name}
                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-bg-hover transition-colors"
              >
                {/* Logo */}
                {agent.logo ? (
                  <div className="w-9 h-9 rounded-lg bg-bg-hover border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={agent.logo}
                      alt={agent.name}
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white tracking-wider">
                      RAW
                    </span>
                  </div>
                )}

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-text-primary">
                    {agent.name}
                  </span>
                  <span className="block text-[11px] text-text-muted truncate">
                    {agent.link}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleCopy(agent.link, index)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copy"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-text-muted" />
                    )}
                  </button>
                  <a
                    href={agent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title="Open"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-text-muted text-sm">
                Could not generate agent links for this URL.
              </p>
              <p className="text-text-muted text-xs mt-1">
                Try using the Link Converter for more options.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 bg-bg-primary/50 text-center flex-shrink-0">
          <p className="text-[11px] text-text-muted">
            Links are affiliated. Thank you for supporting RepSupply!
          </p>
        </div>
      </div>
    </div>
  );
};
