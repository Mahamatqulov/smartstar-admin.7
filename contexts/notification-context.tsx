"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import Notification, { type NotificationType } from "@/components/notification"

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationItem {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const showNotification = (type: NotificationType, message: string, duration = 5000) => {
    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { id, type, message, duration }])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
