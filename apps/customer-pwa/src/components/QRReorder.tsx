'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, Button, Badge } from '@tillu/ui'
import { QrCode, Clock, ShoppingCart } from 'lucide-react'

interface PreviousOrder {
  id: string
  orderNumber: string
  date: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
}

export function QRReorder() {
  const [previousOrder, setPreviousOrder] = useState<PreviousOrder | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const qrCode = urlParams.get('qr')
    
    if (qrCode) {
      fetchOrderFromQR(qrCode)
    }
  }, [])

  const fetchOrderFromQR = async (qrCode: string) => {
    try {
      const response = await fetch(`/api/orders/qr/${qrCode}`)
      const data = await response.json()
      
      if (data.order) {
        setPreviousOrder(data.order)
      }
    } catch (error) {
      console.error('Failed to fetch order from QR:', error)
    }
  }

  const reorderItems = async () => {
    if (!previousOrder) return

    try {
      const response = await fetch('/api/orders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: previousOrder.id }),
      })

      if (response.ok) {
        const newOrder = await response.json()
        alert(`Order placed successfully! Order number: ${newOrder.orderNumber}`)
      }
    } catch (error) {
      console.error('Failed to reorder:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  const startQRScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      const mockOrder: PreviousOrder = {
        id: 'order-123',
        orderNumber: 'ORD-123',
        date: '2025-07-09',
        items: [
          { name: 'Chicken Tikka Masala', quantity: 1, price: 12.99 },
          { name: 'Garlic Naan', quantity: 2, price: 3.50 },
          { name: 'Mango Lassi', quantity: 1, price: 2.95 },
        ],
        total: 22.94,
      }
      setPreviousOrder(mockOrder)
      setIsScanning(false)
    }, 2000)
  }

  if (isScanning) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <QrCode className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Scanning QR Code...</h3>
            <p className="text-gray-600">Point your camera at the QR code on your receipt</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (previousOrder) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Reorder from {previousOrder.date}</h3>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Order #{previousOrder.orderNumber}</span>
              <Badge variant="secondary">{previousOrder.items.length} items</Badge>
            </div>
            
            {previousOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <div>
                  <span className="font-medium">{item.quantity}x {item.name}</span>
                </div>
                <span className="text-gray-600">£{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-2 font-semibold">
              <span>Total:</span>
              <span className="text-blue-600">£{previousOrder.total.toFixed(2)}</span>
            </div>
          </div>
          
          <Button className="w-full" onClick={reorderItems}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Reorder These Items
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Quick Reorder</h3>
        <p className="text-gray-600 mb-4">
          Scan the QR code on your receipt to instantly reorder your previous items
        </p>
        <Button onClick={startQRScan}>
          <QrCode className="h-4 w-4 mr-2" />
          Scan QR Code
        </Button>
      </CardContent>
    </Card>
  )
}
