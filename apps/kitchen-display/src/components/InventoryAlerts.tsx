'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@tillu/ui'
import { AlertTriangle, Package, Clock, TrendingDown } from 'lucide-react'

interface InventoryAlert {
  id: string
  itemName: string
  currentStock: number
  minimumStock: number
  unit: string
  category: string
  severity: 'low' | 'critical' | 'out_of_stock'
  estimatedDepletion: string
  reorderSuggestion: number
  supplier: string
  lastRestocked: string
}

export function InventoryAlerts() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/inventory/alerts/branch-1')
        const data = await response.json()
        setAlerts(data.alerts || [])
      } catch (error) {
        console.error('Failed to fetch inventory alerts:', error)
        setAlerts([
          {
            id: '1',
            itemName: 'Chicken Breast',
            currentStock: 5,
            minimumStock: 20,
            unit: 'kg',
            category: 'Meat',
            severity: 'critical',
            estimatedDepletion: '2025-07-11',
            reorderSuggestion: 50,
            supplier: 'Fresh Foods Ltd',
            lastRestocked: '2025-07-08',
          },
          {
            id: '2',
            itemName: 'Basmati Rice',
            currentStock: 8,
            minimumStock: 15,
            unit: 'kg',
            category: 'Grains',
            severity: 'low',
            estimatedDepletion: '2025-07-12',
            reorderSuggestion: 25,
            supplier: 'Grain Suppliers Co',
            lastRestocked: '2025-07-06',
          },
          {
            id: '3',
            itemName: 'Tomatoes',
            currentStock: 0,
            minimumStock: 10,
            unit: 'kg',
            category: 'Vegetables',
            severity: 'out_of_stock',
            estimatedDepletion: '2025-07-10',
            reorderSuggestion: 30,
            supplier: 'Fresh Produce Inc',
            lastRestocked: '2025-07-07',
          },
          {
            id: '4',
            itemName: 'Cooking Oil',
            currentStock: 3,
            minimumStock: 8,
            unit: 'liters',
            category: 'Cooking Essentials',
            severity: 'low',
            estimatedDepletion: '2025-07-13',
            reorderSuggestion: 20,
            supplier: 'Kitchen Supplies Ltd',
            lastRestocked: '2025-07-05',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlerts()
    
    const interval = setInterval(fetchAlerts, 300000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'out_of_stock': return 'destructive'
      case 'low': return 'warning'
      default: return 'secondary'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'out_of_stock':
        return <AlertTriangle className="h-4 w-4" />
      case 'low':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const handleReorder = async (alertId: string) => {
    try {
      const response = await fetch('/api/inventory/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      })

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
        alert('Reorder request sent successfully!')
      }
    } catch (error) {
      console.error('Failed to send reorder request:', error)
      alert('Failed to send reorder request. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Alerts</CardTitle>
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

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'out_of_stock')
  const lowStockAlerts = alerts.filter(alert => alert.severity === 'low')

  return (
    <div className="space-y-6">
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Critical Inventory Alerts</span>
              <Badge variant="destructive">{criticalAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-red-900">{alert.itemName}</h4>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity === 'out_of_stock' ? 'OUT OF STOCK' : 'CRITICAL'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Category: {alert.category} | Supplier: {alert.supplier}
                      </div>
                    </div>
                    {getSeverityIcon(alert.severity)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Current Stock:</span>
                      <div className="font-medium text-red-600">
                        {alert.currentStock} {alert.unit}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Minimum Required:</span>
                      <div className="font-medium">
                        {alert.minimumStock} {alert.unit}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Suggested Reorder:</span>
                      <div className="font-medium text-green-600">
                        {alert.reorderSuggestion} {alert.unit}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Est. Depletion:</span>
                      <div className="font-medium">
                        {new Date(alert.estimatedDepletion).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Last restocked: {new Date(alert.lastRestocked).toLocaleDateString()}
                    </div>
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={() => handleReorder(alert.id)}
                    >
                      Reorder Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {lowStockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Low Stock Alerts</span>
              <Badge variant="warning">{lowStockAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{alert.itemName}</h4>
                      <Badge variant="warning">Low Stock</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {alert.currentStock}/{alert.minimumStock} {alert.unit}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Suggested: {alert.reorderSuggestion} {alert.unit}
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleReorder(alert.id)}
                    >
                      Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {alerts.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              All Stock Levels Good
            </h3>
            <p className="text-gray-600">
              No inventory alerts at this time. All items are adequately stocked.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
