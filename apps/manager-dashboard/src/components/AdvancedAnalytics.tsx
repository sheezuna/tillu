'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@tillu/ui'
import { BarChart3, PieChart, TrendingUp, Users, Target, Calendar } from 'lucide-react'

interface AnalyticsData {
  revenue: {
    today: number
    yesterday: number
    thisWeek: number
    lastWeek: number
    thisMonth: number
    lastMonth: number
  }
  orders: {
    total: number
    completed: number
    cancelled: number
    averageValue: number
  }
  customers: {
    new: number
    returning: number
    loyalty: number
  }
  topItems: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  hourlyTrends: Array<{
    hour: number
    orders: number
    revenue: number
  }>
  predictions: {
    nextWeekRevenue: number
    confidence: number
    recommendations: string[]
  }
}

export function AdvancedAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics/advanced/branch-1?period=${selectedPeriod}`)
        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        setAnalyticsData({
          revenue: {
            today: 1247.50,
            yesterday: 1156.30,
            thisWeek: 8234.20,
            lastWeek: 7891.45,
            thisMonth: 32456.78,
            lastMonth: 29876.54,
          },
          orders: {
            total: 156,
            completed: 148,
            cancelled: 8,
            averageValue: 23.45,
          },
          customers: {
            new: 23,
            returning: 89,
            loyalty: 44,
          },
          topItems: [
            { name: 'Chicken Tikka Masala', quantity: 45, revenue: 584.55 },
            { name: 'Fish & Chips', quantity: 38, revenue: 456.20 },
            { name: 'Vegetable Curry', quantity: 32, revenue: 352.00 },
            { name: 'Garlic Naan', quantity: 67, revenue: 234.50 },
          ],
          hourlyTrends: [
            { hour: 11, orders: 8, revenue: 156.40 },
            { hour: 12, orders: 15, revenue: 298.75 },
            { hour: 13, orders: 22, revenue: 445.60 },
            { hour: 17, orders: 18, revenue: 387.20 },
            { hour: 18, orders: 25, revenue: 567.85 },
            { hour: 19, orders: 31, revenue: 689.45 },
            { hour: 20, orders: 19, revenue: 423.15 },
          ],
          predictions: {
            nextWeekRevenue: 8756.30,
            confidence: 0.87,
            recommendations: [
              'Increase chicken stock by 20% for weekend',
              'Launch lunch promotion for office workers',
              'Optimize delivery routes for peak hours',
            ],
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedPeriod])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analyticsData) return null

  const getRevenueGrowth = () => {
    const current = analyticsData.revenue[selectedPeriod === 'today' ? 'today' : selectedPeriod === 'week' ? 'thisWeek' : 'thisMonth']
    const previous = analyticsData.revenue[selectedPeriod === 'today' ? 'yesterday' : selectedPeriod === 'week' ? 'lastWeek' : 'lastMonth']
    return ((current - previous) / previous * 100).toFixed(1)
  }

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Advanced Analytics</span>
            </span>
            <div className="flex space-x-2">
              {periods.map((period) => (
                <Button
                  key={period.key}
                  size="sm"
                  variant={selectedPeriod === period.key ? 'primary' : 'secondary'}
                  onClick={() => setSelectedPeriod(period.key as any)}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Revenue Growth</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {getRevenueGrowth()}%
              </div>
              <div className="text-sm text-gray-600">
                vs previous {selectedPeriod}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Completion Rate</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((analyticsData.orders.completed / analyticsData.orders.total) * 100)}%
              </div>
              <div className="text-sm text-gray-600">
                {analyticsData.orders.completed} of {analyticsData.orders.total} orders
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Customer Mix</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((analyticsData.customers.returning / (analyticsData.customers.new + analyticsData.customers.returning)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">
                returning customers
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Top Performing Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantity} sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      £{item.revenue.toFixed(2)}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Peak Hours Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.hourlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">
                      {trend.hour}:00
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(trend.orders / 35) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {trend.orders} orders
                    </div>
                    <div className="text-xs text-gray-600">
                      £{trend.revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>AI Predictions & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Next Week Forecast</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                £{analyticsData.predictions.nextWeekRevenue.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                Confidence: {Math.round(analyticsData.predictions.confidence * 100)}%
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">AI Recommendations</h4>
              <div className="space-y-2">
                {analyticsData.predictions.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
            <div>
              <h4 className="font-medium mb-3">Next Week Forecast</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                £{analyticsData.predictions.nextWeekRevenue.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                Confidence: {Math.round(analyticsData.predictions.confidence * 100)}%
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">AI Recommendations</h4>
              <div className="space-y-2">
                {analyticsData.predictions.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
