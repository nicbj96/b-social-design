import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#060a0f" }}
    >
      <div className="text-center space-y-6 max-w-sm px-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-[#4ECDC4]/10 flex items-center justify-center mx-auto">
          <AlertTriangle size={36} className="text-[#4ECDC4]" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <p className="text-[#4ECDC4] text-sm font-semibold tracking-widest uppercase">404</p>
          <h1 className="text-white text-2xl font-bold">Siden blev ikke fundet</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Den side, du leder efter, eksisterer ikke eller er blevet flyttet.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/feed"
          className="mt-2 px-6 py-3 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] text-sm font-semibold hover:bg-[#3dbdb5] active:scale-[0.98] transition-all inline-block"
        >
          Gå til forsiden
        </Link>
      </div>
    </div>
  );
}
