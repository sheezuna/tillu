'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@tillu/ui'
import { ChefHat, Clock, User, AlertCircle } from 'lucide-react'

interface Chef {
  id: string
  name: string
  specialties: string[]
  currentOrders: number
  efficiency: number
  status: 'available' | 'busy' | 'break'
}

interface OrderAssignment {
  orderId: string
  orderNumber: string
  items: string[]
  complexity: 'low' | 'medium' | 'high'
  estimatedTime: number
  assignedChef?: string
}

export function ChefAssignment() {
  const [chefs, setChefs] = useState<Chef[]>([])
  const [unassignedOrders, setUnassignedOrders] = useState<OrderAssignment[]>([])

  useEffect(() => {
    const mockChefs: Chef[] = [
      {
        id: 'chef-1',
        name: 'Chef Ahmed',
        specialties: ['Curry', 'Tandoor'],
        currentOrders: 2,
        efficiency: 0.92,
        status: 'busy',
      },
      {
        id: 'chef-2',
        name: 'Chef Sarah',
        specialties: ['Grill', 'Sides'],
        currentOrders: 1,
        efficiency: 0.88,
        status: 'available',
      },
      {
        id: 'chef-3',
        name: 'Chef Marcus',
        specialties: ['Curry', 'Rice'],
        currentOrders: 0,
        efficiency: 0.95,
        status: 'available',
      },
    ]

    const mockUnassignedOrders: OrderAssignment[] = [
      {
        orderId: 'order-1',
        orderNumber: 'ORD-004',
        items: ['Chicken Tikka Masala', 'Garlic Naan'],
        complexity: 'medium',
        estimatedTime: 25,
      },
      {
        orderId: 'order-2',
        orderNumber: 'ORD-005',
        items: ['Fish & Chips'],
        complexity: 'low',
        estimatedTime: 15,
      },
    ]

    setChefs(mockChefs)
    setUnassignedOrders(mockUnassignedOrders)
  }, [])

  const assignOrder = (orderId: string, chefId: string) => {
    setUnassignedOrders(prev => prev.filter(order => order.orderId !== orderId))
    setChefs(prev => prev.map(chef => 
      chef.id === chefId 
        ? { ...chef, currentOrders: chef.currentOrders + 1 }
        : chef
    ))
  }

  const getRecommendedChef = (order: OrderAssignment): string | null => {
    const availableChefs = chefs.filter(chef => chef.status === 'available' || chef.currentOrders < 3)
    
    if (availableChefs.length === 0) return null

    const specialtyMatch = availableChefs.find(chef => 
      order.items.some(item => 
        chef.specialties.some(specialty => 
          item.toLowerCase().includes(specialty.toLowerCase())
        )
      )
    )

    if (specialtyMatch) return specialtyMatch.id

    return availableChefs.reduce((best, chef) => 
      chef.currentOrders < best.currentOrders ? chef : best
    ).id
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success'
      case 'busy': return 'warning'
      case 'break': return 'secondary'
      default: return 'secondary'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'success'
      case 'medium': return 'warning'
      case 'high': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChefHat className="h-5 w-5" />
            <span>Chef Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {chefs.map((chef) => (
              <div key={chef.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-gray-400" />
                  <div>
                    <div className="font-medium">{chef.name}</div>
                    <div className="text-sm text-gray-600">
                      Specialties: {chef.specialties.join(', ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Efficiency: {Math.round(chef.efficiency * 100)}%
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant={getStatusColor(chef.status)}>
                    {chef.status.charAt(0).toUpperCase() + chef.status.slice(1)}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    {chef.currentOrders} active orders
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {unassignedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Unassigned Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unassignedOrders.map((order) => {
                const recommendedChefId = getRecommendedChef(order)
                const recommendedChef = chefs.find(chef => chef.id === recommendedChefId)

                return (
                  <div key={order.orderId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{order.orderNumber}</h4>
                        <div className="text-sm text-gray-600">
                          {order.items.join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getComplexityColor(order.complexity)}>
                          {order.complexity} complexity
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {order.estimatedTime} min
                        </div>
                      </div>
                    </div>

                    {recommendedChef && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                        <div className="text-sm text-blue-800">
                          <strong>Recommended:</strong> {recommendedChef.name}
                          {order.items.some(item => 
                            recommendedChef.specialties.some(specialty => 
                              item.toLowerCase().includes(specialty.toLowerCase())
                            )
                          ) && ' (Specialty match)'}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {chefs
                        .filter(chef => chef.status !== 'break')
                        .map((chef) => (
                        <Button
                          key={chef.id}
                          size="sm"
                          variant={chef.id === recommendedChefId ? 'primary' : 'secondary'}
                          onClick={() => assignOrder(order.orderId, chef.id)}
                          disabled={chef.currentOrders >= 3}
                        >
                          Assign to {chef.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
