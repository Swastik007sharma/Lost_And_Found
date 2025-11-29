import { useTheme } from '../../context/ThemeContext';

/**
 * Reusable StatsCard Component
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string|number} props.value - The stat value to display
 * @param {string} props.label - Label for the stat
 * @param {string} props.bgColor - Background color for the icon (e.g., 'blue', 'green', 'purple')
 * @param {string} props.iconColorLight - Icon color in light mode (e.g., 'text-blue-600')
 * @param {string} props.iconColorDark - Icon color in dark mode (e.g., 'text-blue-400')
 * @param {boolean} props.showLiveBadge - Whether to show the "Live" badge on hover
 * @param {string} props.className - Additional classes for the card
 */
function StatsCard({
  icon,
  value,
  label,
  bgColor = 'blue',
  iconColorLight = 'text-blue-600',
  iconColorDark = 'text-blue-400',
  showLiveBadge = false,
  className = ''
}) {
  const { theme } = useTheme();

  // Color mapping for background and hover effects
  const bgColorMap = {
    blue: 'bg-blue-100 dark:bg-blue-900',
    green: 'bg-green-100 dark:bg-green-900',
    purple: 'bg-purple-100 dark:bg-purple-900',
    red: 'bg-red-100 dark:bg-red-900',
    orange: 'bg-orange-100 dark:bg-orange-900',
    emerald: 'bg-emerald-100 dark:bg-emerald-900',
    teal: 'bg-teal-100 dark:bg-teal-900',
    pink: 'bg-pink-100 dark:bg-pink-900',
    yellow: 'bg-yellow-100 dark:bg-yellow-900',
    indigo: 'bg-indigo-100 dark:bg-indigo-900',
  };

  return (
    <div
      className={`group p-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${className}`}
      style={{ background: 'var(--color-secondary)' }}
    >
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${bgColorMap[bgColor] || bgColorMap.blue} group-hover:scale-110 transition-transform duration-300`}>
          <div className={`text-2xl ${theme === 'dark' ? iconColorDark : iconColorLight}`}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {value}
          </p>
          <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
            {label}
          </p>
        </div>
        {showLiveBadge && (
          <div className="flex items-center gap-1 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
