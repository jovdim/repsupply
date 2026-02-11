"use client";

import { useState } from "react";
import {
  Link2,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Globe,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { convertLink, type AgentLink } from "@/lib/linkConverter";

const supportedPlatforms = [
  { name: "Taobao", desc: "Raw & agent links" },
  { name: "TMall", desc: "Raw links" },
  { name: "Weidian", desc: "Raw & agent links" },
  { name: "1688", desc: "Raw & agent links" },
  { name: "AllChinaBuy", desc: "Agent links" },
  { name: "AcBuy", desc: "Agent links" },
  { name: "CNFans", desc: "Agent links" },
  { name: "OrientDig", desc: "Agent links" },
  { name: "Sugargoo", desc: "Agent links" },
  { name: "Superbuy", desc: "Agent links" },
  { name: "Mulebuy", desc: "Agent links" },
  { name: "Hoobuy", desc: "Agent links" },
  { name: "Oopbuy", desc: "Agent links" },
  { name: "Kakobuy", desc: "Agent links" },
];

export default function ConverterPage() {
  const [inputUrl, setInputUrl] = useState("");
  const [results, setResults] = useState<AgentLink[]>([]);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleConvert = () => {
    setError("");
    setResults([]);
    setDetectedPlatform(null);

    const result = convertLink(inputUrl);

    if (!result.success) {
      setError(result.error || "Something went wrong.");
      return;
    }

    setResults(result.results || []);
    setDetectedPlatform(result.platform || null);
  };

  const handleCopy = async (link: string, index: number) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConvert();
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-bg-card border border-white/10 flex items-center justify-center">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-poetsen-one)] mb-3 text-text-primary">
            Link Converter
          </h1>
          <p className="text-text-secondary text-base max-w-lg mx-auto leading-relaxed">
            Convert any shopping agent or raw product link to all supported
            agents instantly. Supports Taobao, Weidian, 1688, TMall, and 10+
            agents.
          </p>
        </div>

        {/* Converter Card */}
        <div className="bg-bg-card border border-white/5 rounded-2xl p-6 md:p-8 mb-6">
          {/* Input */}
          <div className="space-y-2 mb-5">
            <label className="text-sm text-text-muted font-medium">
              Paste your link
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste a raw or agent link here..."
              className="w-full bg-bg-primary border border-white/10 text-text-primary rounded-xl py-3.5 px-4 outline-none focus:border-white/25 transition-colors placeholder:text-text-muted text-sm"
            />
          </div>

          {/* Convert Button */}
          <Button
            onClick={handleConvert}
            size="lg"
            className="w-full rounded-xl"
          >
            Convert Link
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3.5 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Detected Platform Badge */}
          {detectedPlatform && (
            <div className="mt-4 flex items-center gap-2 animate-fade-in">
              <Globe className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-xs text-text-muted">Detected platform:</span>
              <span className="text-xs font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full capitalize">
                {detectedPlatform}
              </span>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 animate-fade-in mb-10">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Sparkles className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-medium text-text-secondary">
                {results.length} links generated
              </span>
            </div>

            {results.map((agent, index) => (
              <div
                key={agent.name}
                className="group bg-bg-card border border-white/5 hover:border-white/15 rounded-xl p-3.5 flex items-center gap-3 transition-all duration-200"
              >
                {/* Agent Logo */}
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

                {/* Agent Name & Link */}
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-text-primary mb-0.5">
                    {agent.name}
                  </span>
                  <a
                    href={agent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-text-muted truncate hover:text-text-secondary transition-colors"
                    title={agent.link}
                  >
                    {agent.link}
                  </a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleCopy(agent.link, index)}
                    className="p-2 rounded-lg bg-bg-hover hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copy link"
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
                    className="p-2 rounded-lg bg-bg-hover hover:bg-white/10 transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Supported Platforms */}
        <div className="mt-10">
          <h3 className="text-center text-text-muted text-xs uppercase tracking-widest mb-5 font-medium">
            Supported Platforms
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {supportedPlatforms.map((platform) => (
              <div
                key={platform.name}
                className="bg-bg-card border border-white/5 rounded-xl p-3 text-center hover:border-white/10 transition-colors"
              >
                <span className="block text-text-primary text-sm font-medium mb-0.5">
                  {platform.name}
                </span>
                <span className="text-text-muted text-[10px]">
                  {platform.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliate Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-muted">
            Links contain affiliate codes. Thank you for supporting RepSupply!
          </p>
        </div>
      </div>
    </div>
  );
}
