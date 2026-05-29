const TaskFilters = ({ onFilterChange }) => {
  return (
    <div className="filters">
      <select onChange={(e) => onFilterChange('status', e.target.value)}>
        <option value="">All Status</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      <select onChange={(e) => onFilterChange('priority', e.target.value)}>
        <option value="">All Priority</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <input
        type="search"
        placeholder="Search tasks..."
        onChange={(e) => onFilterChange('search', e.target.value)}
      />

      <select onChange={(e) => onFilterChange('ordering', e.target.value)}>
        <option value="-created_at">Newest First</option>
        <option value="created_at">Oldest First</option>
        <option value="due_date">Due Date (Earliest)</option>
        <option value="-due_date">Due Date (Latest)</option>
        <option value="priority">Priority (Low to High)</option>
        <option value="-priority">Priority (High to Low)</option>
      </select>
    </div>
  )
}

export default TaskFilters