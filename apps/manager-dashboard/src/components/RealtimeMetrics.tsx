'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@tillu/ui'
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react'

interface Metrics {
  todayRevenue: number
  todayOrders: number
  activeCustomers: number
  averageOrderValue: number
}

export function RealtimeMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({
    todayRevenue: 0,
    todayOrders: 0,
    activeCustomers: 0,
    averageOrderValue: 0,
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard/branch-1')
        const data = await response.json()
        setMetrics({
          todayRevenue: data.todayRevenue || 0,
          todayOrders: data.todayOrders || 0,
          activeCustomers: data.activeCustomers || 0,
          averageOrderValue: data.averageOrderValue || 0,
        })
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const metricCards = [
    {
      title: "Today's Revenue",
      value: `£${metrics.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Orders Today",
      value: metrics.todayOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Active Customers",
      value: metrics.activeCustomers.toString(),
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Avg Order Value",
      value: `£${metrics.averageOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
