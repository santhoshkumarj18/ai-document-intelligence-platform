// src/components/common/Button.jsx
function Button({ variant = 'primary', iconOnly = false, className = '', children, ...props }) {
  const base = 'font-ui font-semibold rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover h-10 px-4',
    secondary: 'bg-transparent border border-border-strong text-ink hover:bg-surface-sunken h-10 px-4',
    destructive: 'bg-transparent border border-status-error text-status-error hover:bg-status-error hover:text-white h-10 px-4',
  }

  const iconOnlyClasses = 'w-8 h-8 flex items-center justify-center border border-transparent hover:bg-surface-sunken hover:border-transparent rounded-sm'

  const classes = iconOnly
    ? `${base} ${iconOnlyClasses} ${className}`
    : `${base} ${variants[variant]} ${className}`

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button