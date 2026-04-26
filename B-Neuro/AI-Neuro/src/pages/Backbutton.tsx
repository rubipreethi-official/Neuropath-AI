import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onBack: () => void;
}

/**
 * Drop <BackButton /> on any page — no props needed.
 * It automatically goes back in browser history.
 * Pass `to="/some-path"` to override the destination.
 */
export function BackButton({ onBack }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors group mb-6"
    >
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-purple-600/50 bg-purple-800/40 group-hover:bg-purple-700/60 transition-colors">
        <ArrowLeft size={16} />
      </span>
      <span className="text-sm font-medium">Back</span>
    </button>
  );
}