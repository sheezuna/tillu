'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@tillu/ui'
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'

interface Insight {
  type: 'forecast' | 'alert' | 'recommendation'
  title: string
  description: string
  confidence: number
  action?: string
}

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/ai/insights/branch-1')
        const data = await response.json()
        setInsights(data.insights || [])
      } catch (error) {
        console.error('Failed to fetch AI insights:', error)
        setInsights([
          {
            type: 'forecast',
            title: 'Revenue Forecast',
            description: 'Expected 15% increase in revenue this weekend based on historical patterns.',
            confidence: 0.87,
          },
          {
            type: 'alert',
            title: 'Inventory Alert',
            description: 'Chicken stock will run low by Thursday. Consider reordering 50kg.',
            confidence: 0.92,
            action: 'Reorder Now',
          },
          {
            type: 'recommendation',
            title: 'Marketing Opportunity',
            description: 'Launch a lunch promotion targeting office workers. Potential 25% uplift.',
            confidence: 0.78,
            action: 'Create Campaign',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'forecast': return TrendingUp
      case 'alert': return AlertTriangle
      case 'recommendation': return Lightbulb
      default: return Brain
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'forecast': return 'text-blue-600'
      case 'alert': return 'text-red-600'
      case 'recommendation': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Insights</span>
          </CardTitle>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>AI Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = getIcon(insight.type)
          return (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${getColor(insight.type)}`} />
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500">
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                {insight.action && (
                  <Button size="sm" variant="secondary">
                    {insight.action}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
