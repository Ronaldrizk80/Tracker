import { useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import TaskForm from './components/TaskForm'
import { addDays, formatISO } from 'date-fns'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [editing, setEditing] = useState(null)  // task object or { new: true }
  const [filters, setFilters] = useState({
    bucket: null,
    type: null,
    entity: null,
    showDone: false,
  })

  // ---- Auth bootstrap ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ---- Fetch + realtime ----
  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error('Fetch error', error)
    else setTasks(data || [])
  }, [])

  useEffect(() => {
    if (!session) return
    fetchTasks()

    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => fetchTasks()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session, fetchTasks])

  // ---- CRUD ----
  const handleSave = async (data) => {
    if (editing?.id) {
      const { error } = await supabase
        .from('tasks')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', editing.id)
      if (error) console.error(error)
    } else {
      const { error } = await supabase
        .from('tasks')
        .insert({ ...data, user_id: session.user.id })
      if (error) console.error(error)
    }
    setEditing(null)
    fetchTasks()
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) console.error(error)
    setEditing(null)
    fetchTasks()
  }

  const handleQuickAction = async (task, action) => {
    const now = new Date().toISOString()
    let patch = { updated_at: now }
    if (action === 'done') patch.status = 'done'
    if (action === 'reopen') patch.status = 'open'
    if (action === 'snooze') {
      patch.status = 'snoozed'
      patch.snooze_until = formatISO(addDays(new Date(), 3), { representation: 'date' })
    }
    if (action === 'nudge') patch.last_nudge_at = now

    const { error } = await supabase.from('tasks').update(patch).eq('id', task.id)
    if (error) console.error(error)
    fetchTasks()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setTasks([])
  }

  // ---- Render ----
  if (loading) return <div className="loading">Loading…</div>
  if (!session) return <Auth />

  return (
    <>
      <Dashboard
        tasks={tasks}
        filters={filters}
        setFilters={setFilters}
        onEdit={setEditing}
        onQuickAction={handleQuickAction}
        onSignOut={handleSignOut}
        onNewTask={() => setEditing({ new: true })}
      />
      {editing && (
        <TaskForm
          task={editing.new ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
