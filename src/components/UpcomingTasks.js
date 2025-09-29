"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function UpcomingTasks({ leads }) {
  const [tasks, setTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDue, setNewTaskDue] = useState("")
  const [filter, setFilter] = useState("all")

  // Fetch incomplete tasks
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("completed", false)
      .order("due_date", { ascending: true })
    if (!error) setTasks(data)
  }

  // Fetch completed tasks
  const fetchCompletedTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("completed", true)
      .order("due_date", { ascending: false })
    if (!error) setCompletedTasks(data)
  }

  useEffect(() => {
    fetchTasks()
    fetchCompletedTasks()
  }, [])

  // Add new task
  const addTask = async () => {
    if (!newTaskTitle) return
    const newTask = {
      title: newTaskTitle,
      due_date: newTaskDue || null,
      completed: false,
      created_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from("tasks").insert(newTask).select()
    if (!error) {
      setTasks(prev => [...prev, data[0]])
      setNewTaskTitle("")
      setNewTaskDue("")
    }
  }

  // Mark task as completed
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

  // Optional delete task (permanent removal)
  const deleteTask = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id))
      setCompletedTasks(prev => prev.filter(t => t.id !== id))
    }
  }

  const today = new Date().toISOString().split("T")[0]
  const filteredTasks = tasks.filter(task => {
    if (filter === "today") return task.due_date === today
    return true
  })

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTask()
    }
  }

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Upcoming Tasks</h2>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-3">
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
      </div>

      {/* Upcoming Tasks List */}
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
              {task.due_date && (
                <span className="text-xs text-gray-400">Due: {task.due_date}</span>
              )}
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

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <>
          <h3 className="text-sm font-semibold mb-2 mt-4 text-gray-600">Completed Tasks</h3>
          <ul className="space-y-2 max-h-40 overflow-y-auto mb-3">
            {completedTasks.map(task => (
              <li
                key={task.id}
                className="flex justify-between items-center p-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-400 text-sm"
              >
                <span>{task.title}</span>
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
        </>
      )}

      {/* Add New Task */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="New task..."
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
        <button
          type="button"
          onClick={addTask}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Add Task
        </button>
      </div>
    </div>
  )
}
