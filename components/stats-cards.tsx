"use client"

import type React from "react"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { RefObject } from "react"

interface Stat {
  title: string
  value: string
  change: string
  trend: "up" | "down"
}

interface StatsCardsProps {
  stats: Stat[]
  loading?: boolean
  onMenuToggle?: (statTitle: string) => void
  showMenu?: string | null
  menuRef?: RefObject<HTMLDivElement>
  children?: (stat: Stat) => React.ReactNode
}

export default function StatsCards({
  stats,
  loading = false,
  onMenuToggle,
  showMenu,
  menuRef,
  children,
}: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="flex items-center">
              <div className="h-4 bg-gray-200 rounded w-1/4 mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            {children && children(stat)}
          </div>
          <p className="text-3xl font-bold text-gray-900 my-2">{stat.value}</p>
          <div className="flex items-center">
            <span
              className={`inline-flex items-center text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
            >
              {stat.change}
              {stat.trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 ml-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 ml-1" />
              )}
            </span>
            <span className="text-sm text-gray-500 ml-1.5">from last month</span>
          </div>
        </div>
      ))}
    </div>
  )
}
