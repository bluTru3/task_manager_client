import { useEffect, useMemo, useState } from 'react'
import TaskFilters from '../components/TaskFilters.jsx'
import { useAuth } from '../auth/authContext.js'

const DEFAULT_FILTERS = {
  status: '',
  priority: '',
  search: '',
  ordering: '-created_at',
}

export function TaskListPage() {
  const { listTasks } = useAuth()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const queryFilters = useMemo(() => {
    return {
      status: filters.status,
      priority: filters.priority,
      search: filters.search,
      ordering: filters.ordering,
    }
  }, [filters.ordering, filters.priority, filters.search, filters.status])

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const response = await listTasks(queryFilters)
        setTasks(response.items)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Could not load tasks.')
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [listTasks, queryFilters])

  return (
    <div className="task-page">
      <section className="auth-card task-list-card">
        <p className="eyebrow">Task board</p>
        <h2>Filter and search your tasks.</h2>
        <p>
          Filters are applied as backend query params, so status, priority, search,
          and ordering all stay server-driven.
        </p>

        <TaskFilters onFilterChange={handleFilterChange} />

        {error ? <div className="form-alert">{error}</div> : null}

        {loading ? <p className="task-state">Loading tasks...</p> : null}

        {!loading && tasks.length === 0 ? (
          <p className="task-state">No tasks matched your filters.</p>
        ) : null}

        {!loading && tasks.length > 0 ? (
          <ul className="task-list" aria-live="polite">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <div className="task-item__header">
                  <h3>{task.title}</h3>
                  <span className={`status status-${task.status.toLowerCase()}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                {task.description ? <p>{task.description}</p> : null}
                <div className="task-item__meta">
                  <span>Priority: {task.priority}</span>
                  <span>
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <aside className="auth-side">
        <h3>Active query</h3>
        <p>These values are sent as request params to your tasks endpoint.</p>
        <div className="profile-summary">
          <dl className="meta-list">
            <div className="meta-item">
              <dt>Status</dt>
              <dd>{filters.status || 'All'}</dd>
            </div>
            <div className="meta-item">
              <dt>Priority</dt>
              <dd>{filters.priority || 'All'}</dd>
            </div>
            <div className="meta-item">
              <dt>Search</dt>
              <dd>{filters.search || 'None'}</dd>
            </div>
            <div className="meta-item">
              <dt>Ordering</dt>
              <dd>{filters.ordering}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  )
}