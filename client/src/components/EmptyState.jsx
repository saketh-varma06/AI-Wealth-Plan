export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="text-5xl text-gray-600 mb-4" />}
      <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs mb-5">{description}</p>}
      {action && actionLabel && (
        <button onClick={action} className="btn-primary">{actionLabel}</button>
      )}
    </div>
  )
}
