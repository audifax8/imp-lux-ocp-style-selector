import type { Theme } from '../theme/darkMode'
import { useLabels } from '../labels/useLabels'

interface Props {
  theme: Theme
  onToggle: () => void
}

const DarkModeSwitch = ({ theme, onToggle }: Props) => {
  const labels = useLabels()
  return (
    <button
      className={`theme-switch${theme === 'dark' ? ' theme-switch--dark' : ''}`}
      onClick={onToggle}
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label={labels.darkMode.label}
      type="button"
    >
      <span className="theme-switch__icon" aria-hidden="true">☀</span>
      <span className="theme-switch__track">
        <span className="theme-switch__thumb" />
      </span>
      <span className="theme-switch__icon" aria-hidden="true">🌙</span>
    </button>
  )
}

export default DarkModeSwitch
