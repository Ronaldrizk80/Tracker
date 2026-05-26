import { useState, useEffect } from 'react'
import { ENTITIES, TYPES, STATUSES } from '../lib/supabase'

export default function TaskForm({ task, onSave, onCancel, onDelete }) {
  const isEdit = !!task?.id

  const [form, setForm] = useState({
    title: '',
    notes: '',
    type: 'delegated',
    entity: 'Cocoa Capital',
    counterparty: '',
    due_date: '',
    status: 'open',
    snooze_until: '',
  })

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        notes: task.notes || '',
        type: task.type || 'delegated',
        entity: task.entity || 'Cocoa Capital',
        counterparty: task.counterparty || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        status: task.status || 'open',
        snooze_until: task.snooze_until ? task.snooze_until.split('T')[0] : '',
      })
    }
  }, [task])

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({
      ...form,
      due_date: form.due_date || null,
      snooze_until: form.snooze_until || null,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit item' : 'New follow-up'}</h2>
          <button className="btn-icon" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="field">
              <label className="field-label">Title</label>
              <input
                className="field-input"
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="What are you waiting on?"
                autoFocus={!isEdit}
                required
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Type</label>
                <select
                  className="field-select"
                  value={form.type}
                  onChange={(e) => update('type', e.target.value)}
                >
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="field">
                <label className="field-label">Entity</label>
                <select
                  className="field-select"
                  value={form.entity}
                  onChange={(e) => update('entity', e.target.value)}
                >
                  {ENTITIES.map(en => <option key={en} value={en}>{en}</option>)}
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Waiting on</label>
                <input
                  className="field-input"
                  type="text"
                  value={form.counterparty}
                  onChange={(e) => update('counterparty', e.target.value)}
                  placeholder="Name"
                />
              </div>

              <div className="field">
                <label className="field-label">Due date</label>
                <input
                  className="field-input"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => update('due_date', e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Status</label>
              <select
                className="field-select"
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
              >
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {form.status === 'snoozed' && (
              <div className="field">
                <label className="field-label">Snooze until</label>
                <input
                  className="field-input"
                  type="date"
                  value={form.snooze_until}
                  onChange={(e) => update('snooze_until', e.target.value)}
                />
              </div>
            )}

            <div className="field">
              <label className="field-label">Notes</label>
              <textarea
                className="field-textarea"
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Context, last action, next step…"
              />
            </div>
          </div>

          <div className="modal-footer">
            {isEdit && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (confirm('Delete this item?')) onDelete(task.id)
                }}
                style={{ flex: '0 0 auto', color: 'var(--accent-rust)' }}
              >
                Delete
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
