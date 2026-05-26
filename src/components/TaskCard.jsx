import { TYPES } from '../lib/supabase'
import {
  getStatusClass,
  getAgeClass,
  formatAge,
  formatDate,
} from '../lib/aging'

const typeLabel = (v) => TYPES.find(t => t.value === v)?.label || v

export default function TaskCard({ task, onEdit, onQuickAction }) {
  return (
    <div className={`task-card ${getStatusClass(task)}`} onClick={() => onEdit(task)}>
      <div className="task-row-top">
        <div className="task-title">{task.title}</div>
        <div className={`task-age ${getAgeClass(task)}`}>{formatAge(task)}</div>
      </div>

      <div className="task-meta">
        <span className="type-badge">{typeLabel(task.type)}</span>
        <span className="task-meta-item">{task.entity}</span>
        {task.counterparty && (
          <span className="task-meta-item">→ <strong>{task.counterparty}</strong></span>
        )}
        {task.due_date && (
          <span className="task-meta-item">due {formatDate(task.due_date)}</span>
        )}
      </div>

      {task.notes && <div className="task-notes">{task.notes}</div>}

      <div className="task-actions" onClick={(e) => e.stopPropagation()}>
        {task.status !== 'done' && (
          <button
            className="btn-ghost"
            onClick={() => onQuickAction(task, 'done')}
          >
            ✓ Done
          </button>
        )}
        {task.status !== 'snoozed' && task.status !== 'done' && (
          <button
            className="btn-ghost"
            onClick={() => onQuickAction(task, 'snooze')}
          >
            ⏱ Snooze 3d
          </button>
        )}
        {task.status !== 'done' && (
          <button
            className="btn-ghost"
            onClick={() => onQuickAction(task, 'nudge')}
          >
            ↻ Nudged today
          </button>
        )}
        {task.status === 'done' && (
          <button
            className="btn-ghost"
            onClick={() => onQuickAction(task, 'reopen')}
          >
            ↶ Reopen
          </button>
        )}
      </div>
    </div>
  )
}
