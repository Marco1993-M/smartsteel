'use client'

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function UpcomingTasks() {
  const [tasks, setTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDue, setNewTaskDue] = useState("")
  const [newTaskAssignee, setNewTaskAssignee] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState("Medium")
  const [filter, setFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [showCompleted, setShowCompleted] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  const assignees = ["Niel", "Stefan", "Marco"]
  const priorities = ["High", "Medium", "Low"]

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("due_date", { ascending: true })
    if (!error) {
      setTasks(data.filter(t => !t.completed))
      setCompletedTasks(data.filter(t => t.completed))
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const addTask = async () => {
    if (!newTaskTitle) return
    const newTask = {
      title: newTaskTitle,
      due_date: newTaskDue || null,
      assignee: newTaskAssignee || null,
      priority: newTaskPriority,
      completed: false,
      created_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from("tasks").insert(newTask).select()
    if (!error) {
      setTasks(prev => [...prev, data[0]])
      setNewTaskTitle("")
      setNewTaskDue("")
      setNewTaskAssignee("")
      setNewTaskPriority("Medium")
    }
  }

  const markCompleted = async (id) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", id)
    if (!error) {
      const completedTask = tasks.find(t => t.id === id)
      setTasks(prev => prev.filter(t => t.id !== id))
      setCompletedTasks(prev => [completedTask, ...prev])
    }
  }

  const deleteTask = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id))
      setCompletedTasks(prev => prev.filter(t => t.id !== id))
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTask()
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === "today" && task.due_date !== today) return false
    if (assigneeFilter !== "all" && task.assignee !== assigneeFilter) return false
    return true
  })

  const getBadgeColor = (due_date) => {
    if (!due_date) return "bg-gray-200 text-gray-700"
    if (due_date < today) return "bg-red-200 text-red-700"
    if (due_date === today) return "bg-yellow-200 text-yellow-800"
    return "bg-green-200 text-green-800"
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "High": return "bg-red-100 text-red-700"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "Low": return "bg-green-100 text-green-800"
      default: return "bg-gray-200 text-gray-700"
    }
  }

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">

      <h2 className="text-lg font-semibold mb-3">Upcoming Tasks</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* All / Today */}
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-2 py-1 text-xs font-medium rounded-full border ${
            filter === "all"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("today")}
          className={`px-2 py-1 text-xs font-medium rounded-full border ${
            filter === "today"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
          }`}
        >
          Today
        </button>

        {/* Assignee Pills */}
        <button
          type="button"
          onClick={() => setAssigneeFilter("all")}
          className={`px-2 py-1 text-xs font-medium rounded-full border ${
            assigneeFilter === "all"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
          }`}
        >
          All Assignees
        </button>
        {assignees.map(a => (
          <button
            key={a}
            type="button"
            onClick={() => setAssigneeFilter(a)}
            className={`px-2 py-1 text-xs font-medium rounded-full border ${
              assigneeFilter === a
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="mb-6">
        <ul className="space-y-2 max-h-64 overflow-y-auto mb-3">
          {filteredTasks.length === 0 && (
            <li className="text-gray-400 text-sm">No tasks found</li>
          )}
          {filteredTasks.map(task => (
            <li
              key={task.id}
              className="flex justify-between items-center p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{task.title}</span>
                <div className="flex flex-wrap gap-1 mt-1 text-xs">
                  {task.priority && (
                    <span className={`px-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                  {task.due_date && (
                    <span className={`px-1 rounded ${getBadgeColor(task.due_date)}`}>
                      Due: {task.due_date}
                    </span>
                  )}
                  {task.assignee && (
                    <span className="px-1 bg-blue-200 text-blue-800 rounded">
                      {task.assignee}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => markCompleted(task.id)}
                  className="text-green-500 hover:text-green-700 text-xs"
                >
                  ✅
                </button>
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add New Task (separated visually) */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm">
        <h3 className="text-md font-semibold mb-3 text-gray-700">Add New Task</h3>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Task title..."
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
          <input
            type="date"
            value={newTaskDue}
            onChange={e => setNewTaskDue(e.target.value)}
            className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
          />

          {/* Assignee Pills */}
          <div className="flex gap-2 flex-wrap">
            {assignees.map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setNewTaskAssignee(a)}
                className={`px-2 py-1 text-xs font-medium rounded-full border ${
                  newTaskAssignee === a
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Priority Pills */}
          <div className="flex gap-2 flex-wrap">
            {priorities.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setNewTaskPriority(p)}
                className={`px-2 py-1 text-xs font-medium rounded-full border ${
                  newTaskPriority === p
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={addTask}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowCompleted(prev => !prev)}
            className="text-sm text-gray-600 font-semibold mb-2 mt-4 flex items-center gap-1"
          >
            {showCompleted ? "▼" : "▶"} Completed Tasks ({completedTasks.length})
          </button>
          {showCompleted && (
            <ul className="space-y-2 max-h-40 overflow-y-auto mb-3">
              {completedTasks.map(task => (
                <li
                  key={task.id}
                  className="flex justify-between items-center p-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-400 text-sm"
                >
                  <span>
                    {task.title} {task.assignee && `(Assigned to: ${task.assignee})`} {task.priority && `[${task.priority}]`}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
