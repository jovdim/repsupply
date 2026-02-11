"use client";

import { X } from "lucide-react";
import { LoginForm } from "./LoginForm";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-bg-card border border-white/10 rounded-3xl p-8 max-w-md w-full relative animate-scale-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Log in to continue</h2>
          <p className="text-text-secondary text-sm">
            You need to be logged in to perform this action.
          </p>
        </div>

        <LoginForm
          onSuccess={() => {
            if (onSuccess) onSuccess();
            onClose();
          }}
          hideTitle={true}
        />
      </div>
    </div>
  );
}
