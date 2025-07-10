'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@tillu/ui'
import { Clock, CheckCircle, Truck, ChefHat } from 'lucide-react'

interface OrderStatus {
  id: string
  orderNumber: string
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered'
  estimatedTime: number
  actualTime?: number
  items: Array<{
    name: string
    quantity: number
  }>
  total: number
}

export function RealTimeOrderTracking() {
  const [currentOrder, setCurrentOrder] = useState<OrderStatus | null>(null)

  useEffect(() => {
    const mockOrder: OrderStatus = {
      id: 'order-123',
      orderNumber: 'ORD-123',
      status: 'preparing',
      estimatedTime: 25,
      actualTime: 12,
      items: [
        { name: 'Chicken Tikka Masala', quantity: 1 },
        { name: 'Garlic Naan', quantity: 2 },
      ],
      total: 16.49,
    }

    setCurrentOrder(mockOrder)

    const interval = setInterval(() => {
      setCurrentOrder(prev => {
        if (!prev) return null
        
        const statuses: OrderStatus['status'][] = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
        const currentIndex = statuses.indexOf(prev.status)
        
        if (currentIndex < statuses.length - 1) {
          return {
            ...prev,
            status: statuses[currentIndex + 1],
            actualTime: prev.actualTime ? prev.actualTime + 5 : 5,
          }
        }
        
        return prev
      })
    }, 10000) // Update every 10 seconds for demo

    return () => clearInterval(interval)
  }, [])

  if (!currentOrder) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No active orders</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed':
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'preparing':
        return <ChefHat className="h-5 w-5 text-orange-500" />
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-purple-500" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'placed': return 'Order Placed'
      case 'confirmed': return 'Order Confirmed'
      case 'preparing': return 'Being Prepared'
      case 'ready': return 'Ready for Pickup'
      case 'out_for_delivery': return 'Out for Delivery'
      case 'delivered': return 'Delivered'
      default: return 'Unknown Status'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success'
      case 'out_for_delivery': return 'default'
      case 'preparing': return 'warning'
      default: return 'secondary'
    }
  }

  const statusSteps = [
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'out_for_delivery', label: 'Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ]

  const currentStepIndex = statusSteps.findIndex(step => step.key === currentOrder.status)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Tracking</span>
          <Badge variant={getStatusColor(currentOrder.status)}>
            {currentOrder.orderNumber}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-3">
          {getStatusIcon(currentOrder.status)}
          <div>
            <div className="font-medium">{getStatusText(currentOrder.status)}</div>
            <div className="text-sm text-gray-600">
              {currentOrder.actualTime && (
                <span>Elapsed: {currentOrder.actualTime} min</span>
              )}
              {currentOrder.status !== 'delivered' && (
                <span className="ml-2">
                  Est. total: {currentOrder.estimatedTime} min
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {statusSteps.map((step, index) => (
            <div key={step.key} className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                index <= currentStepIndex 
                  ? 'bg-blue-500' 
                  : 'bg-gray-200'
              }`} />
              <span className={`text-sm ${
                index <= currentStepIndex 
                  ? 'text-gray-900 font-medium' 
                  : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index === currentStepIndex && (
                <Badge variant="default" className="text-xs">
                  Current
                </Badge>
              )}
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Order Items</h4>
          <div className="space-y-1">
            {currentOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-medium mt-2 pt-2 border-t">
            <span>Total:</span>
            <span>£{currentOrder.total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
