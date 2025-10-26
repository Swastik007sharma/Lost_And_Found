/**
 * Loader Component - Modern loading indicators
 * 
 * Variants:
 * - spinner (default): Spinning circle loader
 * - dots: Three bouncing dots
 * - pulse: Pulsing circle
 * - bars: Three vertical bars
 * 
 * Sizes: xs, sm, md (default), lg, xl, full
 * 
 * @param {string} variant - Loading animation variant
 * @param {string} size - Size of the loader
 * @param {string} text - Optional loading text
 * @param {boolean} fullscreen - If true, covers entire viewport
 * @param {string} className - Additional CSS classes
 */
function Loader({
	variant = 'spinner',
	size = 'md',
	text = '',
	fullscreen = false,
	className = ''
}) {
	// Size mapping
	const sizeMap = {
		xs: 'h-4 w-4',
		sm: 'h-6 w-6',
		md: 'h-12 w-12',
		lg: 'h-16 w-16',
		xl: 'h-24 w-24',
		full: 'h-32 w-32'
	};

	const containerSizeMap = {
		xs: 'h-12',
		sm: 'h-16',
		md: 'h-64',
		lg: 'h-96',
		xl: 'h-screen',
		full: 'h-screen'
	};

	const spinnerSize = sizeMap[size] || sizeMap.md;
	const containerHeight = fullscreen ? 'h-screen' : containerSizeMap[size] || containerSizeMap.md;

	// Spinner variant (default)
	const SpinnerLoader = () => (
		<svg
			className={`animate-spin ${spinnerSize} ${className}`}
			style={{ color: 'var(--color-primary)' }}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);

	// Dots variant
	const DotsLoader = () => {
		const dotSize = size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : size === 'xl' ? 'w-6 h-6' : 'w-4 h-4';

		return (
			<div className={`flex space-x-2 ${className}`}>
				<div
					className={`${dotSize} rounded-full animate-bounce`}
					style={{
						backgroundColor: 'var(--color-primary)',
						animationDelay: '0ms'
					}}
				/>
				<div
					className={`${dotSize} rounded-full animate-bounce`}
					style={{
						backgroundColor: 'var(--color-primary)',
						animationDelay: '150ms'
					}}
				/>
				<div
					className={`${dotSize} rounded-full animate-bounce`}
					style={{
						backgroundColor: 'var(--color-primary)',
						animationDelay: '300ms'
					}}
				/>
			</div>
		);
	};

	// Pulse variant
	const PulseLoader = () => (
		<div className={`relative ${spinnerSize} ${className}`}>
			<div
				className="absolute inset-0 rounded-full animate-ping opacity-75"
				style={{ backgroundColor: 'var(--color-primary)' }}
			/>
			<div
				className="relative rounded-full w-full h-full"
				style={{ backgroundColor: 'var(--color-primary)' }}
			/>
		</div>
	);

	// Bars variant
	const BarsLoader = () => {
		const barHeight = size === 'xs' ? 'h-6' : size === 'sm' ? 'h-8' : size === 'lg' ? 'h-16' : size === 'xl' ? 'h-20' : 'h-12';
		const barWidth = size === 'xs' ? 'w-1' : size === 'sm' ? 'w-1.5' : size === 'lg' ? 'w-3' : size === 'xl' ? 'w-4' : 'w-2';

		return (
			<div className={`flex items-end space-x-1 ${barHeight} ${className}`}>
				<div
					className={`${barWidth} rounded-full animate-pulse`}
					style={{
						backgroundColor: 'var(--color-primary)',
						animationDuration: '0.6s'
					}}
				/>
				<div
					className={`${barWidth} rounded-full animate-pulse`}
					style={{
						backgroundColor: 'var(--color-primary)',
						animationDuration: '0.8s'
					}}
				/>
				<div
					className={`${barWidth} rounded-full animate-pulse`}
					style={{
						backgroundColor: 'var(--color-primary)',
						animationDuration: '1s'
					}}
				/>
			</div>
		);
	};

	// Select loader based on variant
	const LoaderComponent = () => {
		switch (variant) {
			case 'dots':
				return <DotsLoader />;
			case 'pulse':
				return <PulseLoader />;
			case 'bars':
				return <BarsLoader />;
			case 'spinner':
			default:
				return <SpinnerLoader />;
		}
	};

	return (
		<div
			className={`flex flex-col justify-center items-center ${containerHeight} ${fullscreen ? 'fixed inset-0 z-50 bg-black/20 dark:bg-black/40 backdrop-blur-sm' : ''}`}
			style={fullscreen ? {} : { color: 'var(--color-text)' }}
		>
			<LoaderComponent />
			{text && (
				<p
					className={`mt-4 font-medium ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : size === 'xl' ? 'text-xl' : 'text-base'}`}
					style={{ color: 'var(--color-text)' }}
				>
					{text}
				</p>
			)}
		</div>
	);
}

export default Loader;
