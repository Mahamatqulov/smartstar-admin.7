"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, X } from "lucide-react"

export type NotificationType = "success" | "error" | "info" | "warning"

interface NotificationProps {
  type: NotificationType
  message: string
  duration?: number
  onClose?: () => void
}

export default function Notification({ type, message, duration = 5000, onClose }: NotificationProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setVisible(false)
    if (onClose) onClose()
  }

  if (!visible) return null

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-500 text-green-700"
      case "error":
        return "bg-red-50 border-red-500 text-red-700"
      case "warning":
        return "bg-yellow-50 border-yellow-500 text-yellow-700"
      case "info":
        return "bg-blue-50 border-blue-500 text-blue-700"
      default:
        return "bg-gray-50 border-gray-500 text-gray-700"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 w-96 border-l-4 p-4 rounded shadow-lg transition-all duration-300 ${getTypeStyles()}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
