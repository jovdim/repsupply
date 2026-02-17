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
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { convertLink, type AgentLink } from "@/lib/linkConverter";

const supportedPlatforms = [
  { name: "AllChinaBuy", desc: "Agent links", logo: "/agent-images/allchinabuy.webp" },
  { name: "CNFans", desc: "Agent links", logo: "/agent-images/cnfans.webp" },
  { name: "Mulebuy", desc: "Agent links", logo: "/agent-images/mulebuy.webp" },
  { name: "AcBuy", desc: "Agent links", logo: "/agent-images/acbuy.webp" },
  { name: "Superbuy", desc: "Agent links", logo: "/agent-images/superbuy.webp" },
  { name: "Sugargoo", desc: "Agent links", logo: "/agent-images/sugargoo.webp" },
  { name: "OrientDig", desc: "Agent links", logo: "/agent-images/orientdig.webp" },
  { name: "Hoobuy", desc: "Agent links", logo: "/agent-images/hoobuy.webp" },
  { name: "Oopbuy", desc: "Agent links", logo: "/agent-images/oopbuy.webp" },
  { name: "Kakobuy", desc: "Agent links", logo: "/agent-images/kakobuy.webp" },
  { name: "Taobao", desc: "Raw & agent links", logo: null },
  { name: "Weidian", desc: "Raw & agent links", logo: null },
  { name: "1688", desc: "Raw & agent links", logo: null },
  { name: "TMall", desc: "Raw links", logo: null },
];

export default function ConverterPage() {
  const router = useRouter();
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
    <div className="min-h-screen pt-24  pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">

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
                className="group bg-bg-card border border-white/5 hover:border-white/15 rounded-xl p-3 flex items-center gap-4 transition-all duration-200 hover:bg-white/[0.02]"
              >
                {/* Agent Logo */}
                {agent.logo ? (
                  <div className="w-12 h-12 rounded-lg bg-bg-hover border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    <Image
                      src={agent.logo}
                      alt={agent.name}
                      width={48}
                      height={48}
                      quality={85}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white tracking-wider">
                      RAW
                    </span>
                  </div>
                )}

                {/* Agent Name */}
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-text-primary mb-0.5 group-hover:text-white transition-colors">
                    {agent.name}
                  </span>
                  <span className="text-xs text-text-muted hidden sm:block">
                    {agent.name === "Raw Link" ? "Direct product link" : "Agent functionality supported"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleCopy(agent.link, index)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-hover hover:bg-white/10 border border-white/5 transition-colors text-xs font-medium text-text-secondary hover:text-white"
                    title="Copy link"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-success" />
                        <span className="text-success">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <a
                    href={agent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-bg-hover hover:bg-white/10 border border-white/5 transition-colors text-text-secondary hover:text-white"
                    title="Open link"
                  >
                    <ExternalLink className="w-4 h-4" />
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
                className="bg-bg-card border border-white/5 rounded-xl p-4 text-center hover:border-white/10 transition-colors group flex flex-col items-center gap-3"
              >
                {platform.logo ? (
                  <div className="relative w-10 h-10 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300">
                    <Image
                      src={platform.logo}
                      alt={platform.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/80 transition-colors">
                     <span className="text-xs font-bold">{platform.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <span className="block text-text-primary text-sm font-medium mb-1 group-hover:text-white transition-colors">
                    {platform.name}
                  </span>
                  <span className="text-text-muted text-[10px] block">
                    {platform.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliate Notice */}
        {/* <div className="mt-8 text-center">
          <p className="text-xs text-text-muted">
            Links contain affiliate codes. Thank you for supporting RepSupply!
          </p>
        </div> */}
      </div>
    </div>
  );
}
