// src/components/StatsCard.tsx
type Props = {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
};

export default function StatsCard({ icon, title, value, subtitle, trend }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-dark-200 to-dark-300 border border-secondary-800/40 p-6 hover:border-secondary-600/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-secondary-900/30">
      {/* Glacier ice crystal pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l4 8h8l-6.5 6.5L28 24l-8-4-8 4 2.5-9.5L8 8h8l4-8zm0 0' fill='%233b82f6' fill-opacity='0.3'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px'
      }} />
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary-600/15 via-primary-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-600/30 to-secondary-600/30 flex items-center justify-center text-2xl border border-primary-500/40 shadow-lg shadow-primary-900/20">
            {icon}
          </div>
          {trend && (
            <span className="text-xs text-primary-400 font-semibold bg-primary-500/20 px-2 py-1 rounded-full border border-primary-500/30">
              {trend}
            </span>
          )}
        </div>
        
        <h3 className="text-sm font-medium text-white/70 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">{value}</p>
        <p className="text-xs text-white/50">{subtitle}</p>
      </div>
    </div>
  );
}
