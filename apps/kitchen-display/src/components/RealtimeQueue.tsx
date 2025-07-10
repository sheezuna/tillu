'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@tillu/ui'
import { Clock, ChefHat, AlertCircle } from 'lucide-react'

interface QueueItem {
  id: string
  orderNumber: string
  items: Array<{
    name: string
    quantity: number
    specialInstructions?: string
  }>
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedTime: number
  elapsedTime: number
  assignedChef?: string
  status: 'pending' | 'preparing' | 'ready'
}

export function RealtimeQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const mockQueue: QueueItem[] = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        items: [
          { name: 'Chicken Tikka Masala', quantity: 2 },
          { name: 'Garlic Naan', quantity: 3 },
        ],
        priority: 'high',
        estimatedTime: 25,
        elapsedTime: 8,
        assignedChef: 'Chef A',
        status: 'preparing',
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        items: [
          { name: 'Fish & Chips', quantity: 1, specialInstructions: 'Extra crispy' },
        ],
        priority: 'medium',
        estimatedTime: 20,
        elapsedTime: 0,
        status: 'pending',
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        items: [
          { name: 'Vegetable Curry', quantity: 1 },
          { name: 'Basmati Rice', quantity: 2 },
        ],
        priority: 'urgent',
        estimatedTime: 15,
        elapsedTime: 18,
        assignedChef: 'Chef B',
        status: 'preparing',
      },
    ]

    setQueue(mockQueue)

    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setQueue(prev => prev.map(item => ({
        ...item,
        elapsedTime: item.status === 'preparing' ? item.elapsedTime + 1 : item.elapsedTime,
      })))
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'preparing': return 'default'
      case 'ready': return 'success'
      default: return 'secondary'
    }
  }

  const startOrder = (orderId: string) => {
    setQueue(prev => prev.map(item => 
      item.id === orderId 
        ? { ...item, status: 'preparing' as const, assignedChef: 'Chef C' }
        : item
    ))
  }

  const completeOrder = (orderId: string) => {
    setQueue(prev => prev.map(item => 
      item.id === orderId 
        ? { ...item, status: 'ready' as const }
        : item
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Kitchen Queue</h2>
        <div className="text-sm text-gray-500">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid gap-4">
        {queue.map((item) => (
          <Card key={item.id} className="relative">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(item.priority)}`} />
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.orderNumber}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(item.status)}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {item.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {item.items.map((orderItem, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{orderItem.quantity}x {orderItem.name}</span>
                      {orderItem.specialInstructions && (
                        <div className="text-sm text-orange-600 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {orderItem.specialInstructions}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Est: {item.estimatedTime}min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Elapsed: {item.elapsedTime}min</span>
                  </div>
                  {item.assignedChef && (
                    <div className="flex items-center space-x-1">
                      <ChefHat className="h-4 w-4" />
                      <span>{item.assignedChef}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {item.status === 'pending' && (
                    <Button size="sm" onClick={() => startOrder(item.id)}>
                      Start
                    </Button>
                  )}
                  {item.status === 'preparing' && (
                    <Button size="sm" variant="primary" onClick={() => completeOrder(item.id)}>
                      Complete
                    </Button>
                  )}
                </div>
              </div>

              {item.elapsedTime > item.estimatedTime && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">
                  ⚠️ Order is running {item.elapsedTime - item.estimatedTime} minutes behind schedule
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
