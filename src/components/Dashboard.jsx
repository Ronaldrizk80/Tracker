import { useMemo } from 'react'
import TaskCard from './TaskCard'
import { ENTITIES, TYPES } from '../lib/supabase'
import { getAgingBucket } from '../lib/aging'

const BUCKETS = [
  { key: '0-3', label: '0–3 days', cls: '' },
  { key: '4-7', label: '4–7 days', cls: '' },
  { key: '8-14', label: '8–14 days', cls: 'bucket-warn' },
  { key: '15+', label: '15+ days', cls: 'bucket-overdue' },
]

export default function Dashboard({
  tasks,
  filters,
  setFilters,
  onEdit,
  onQuickAction,
  onSignOut,
  onNewTask,
}) {
  const visibleTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filters.bucket && getAgingBucket(t) !== filters.bucket) return false
      if (filters.type && t.type !== filters.type) return false
      if (filters.entity && t.entity !== filters.entity) return false
      if (filters.showDone) {
        if (t.status !== 'done') return false
      } else {
        if (t.status === 'done') return false
      }
      return true
    })
  }, [tasks, filters])

  const bucketCounts = useMemo(() => {
    const counts = { '0-3': 0, '4-7': 0, '8-14': 0, '15+': 0 }
    tasks.forEach(t => {
      if (t.status === 'done' || t.status === 'snoozed') return
      const b = getAgingBucket(t)
      if (counts[b] !== undefined) counts[b]++
    })
    return counts
  }, [tasks])

  // Group by entity for section headers
  const grouped = useMemo(() => {
    const out = {}
    visibleTasks.forEach(t => {
      if (!out[t.entity]) out[t.entity] = []
      out[t.entity].push(t)
    })
    // Sort each group: overdue first, then by age desc
    Object.keys(out).forEach(k => {
      out[k].sort((a, b) => {
        const order = { '15+': 0, '8-14': 1, '4-7': 2, '0-3': 3, 'snoozed': 4, 'done': 5 }
        const ba = order[getAgingBucket(a)] ?? 6
        const bb = order[getAgingBucket(b)] ?? 6
        if (ba !== bb) return ba - bb
        return new Date(b.created_at) - new Date(a.created_at)
      })
    })
    return out
  }, [visibleTasks])

  const toggleFilter = (k, v) => {
    setFilters(f => ({ ...f, [k]: f[k] === v ? null : v }))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          Follow-Up <em>tracker</em>
        </h1>
        <div className="app-actions">
          <button
            className="btn-icon"
            onClick={() => setFilters(f => ({ ...f, showDone: !f.showDone }))}
            title={filters.showDone ? 'Show open' : 'Show done'}
          >
            {filters.showDone ? '○' : '●'}
          </button>
          <button className="btn-icon" onClick={onSignOut} title="Sign out">⎋</button>
        </div>
      </header>

      {!filters.showDone && (
        <div className="aging-summary">
          {BUCKETS.map(b => {
            const count = bucketCounts[b.key]
            const has = count > 0
            return (
              <button
                key={b.key}
                className={`aging-bucket ${b.cls} ${has ? 'has-items' : ''} ${filters.bucket === b.key ? 'active' : ''}`}
                onClick={() => toggleFilter('bucket', b.key)}
              >
                <div className="aging-bucket-label">{b.label}</div>
                <div className="aging-bucket-count">{count}</div>
              </button>
            )
          })}
        </div>
      )}

      <div className="filters">
        <button
          className={`chip ${!filters.type ? 'active' : ''}`}
          onClick={() => setFilters(f => ({ ...f, type: null }))}
        >All types</button>
        {TYPES.map(t => (
          <button
            key={t.value}
            className={`chip ${filters.type === t.value ? 'active' : ''}`}
            onClick={() => toggleFilter('type', t.value)}
          >{t.label}</button>
        ))}
      </div>

      <div className="filters">
        <button
          className={`chip ${!filters.entity ? 'active' : ''}`}
          onClick={() => setFilters(f => ({ ...f, entity: null }))}
        >All entities</button>
        {ENTITIES.map(en => (
          <button
            key={en}
            className={`chip ${filters.entity === en ? 'active' : ''}`}
            onClick={() => toggleFilter('entity', en)}
          >{en}</button>
        ))}
      </div>

      {visibleTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">Nothing pending here.</div>
          <p>{filters.bucket || filters.type || filters.entity
            ? 'Try clearing filters.'
            : 'Tap + to add your first follow-up.'}</p>
        </div>
      ) : (
        Object.keys(grouped).sort().map(entity => (
          <div key={entity}>
            <div className="section-header">
              <span className="section-title">{entity}</span>
              <span className="section-title" style={{ color: 'var(--muted-soft)' }}>
                {grouped[entity].length}
              </span>
            </div>
            <div className="task-list">
              {grouped[entity].map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onQuickAction={onQuickAction}
                />
              ))}
            </div>
          </div>
        ))
      )}

      <button className="fab" onClick={onNewTask} aria-label="Add new follow-up">+</button>
    </div>
  )
}
