import Image from "next/image";
import { Timer, Cookie } from "lucide-react";

// This is a static component for visual representation on the pack.
export function PackRecipeCard() {
  return (
    // Layer 1: Metallic "Border" (Gradient Background with Padding)
    <div className="relative w-full h-full rounded-lg p-1.5 bg-gradient-to-br from-gold-light via-gold to-gold-dark">
      {/* Layer 2: Category "Border" (Gradient Background with Padding) */}
      <div
        className={`w-full h-full rounded-md p-1.5 flex flex-col gap-1.5 bg-vegetarian-gradient`}
      >
        {/* Layer 3: Content */}
        {/* Image Container */}
        <div className="relative w-full h-1/2 rounded-sm overflow-hidden bg-white/50">
          <div className="flex items-center justify-center h-full">
            <Cookie className="w-10 h-10 text-slate-500" />
          </div>
        </div>

        {/* Text content container */}
        <div className="flex flex-col flex-grow justify-between p-2 bg-[#FDFBF4] rounded-sm">
          <div>
            <h3 className="text-xs font-bold text-slate-800">Palak Paneer</h3>
            <p className="mt-1 text-[10px] leading-tight text-slate-600">
              Spinach and cottage cheese...
            </p>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <Timer className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] font-medium text-slate-600">
              40 min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
