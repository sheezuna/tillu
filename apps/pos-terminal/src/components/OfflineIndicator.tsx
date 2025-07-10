'use client'

import React from 'react'
import { Badge } from '@tillu/ui'
import { Wifi, WifiOff, Clock } from 'lucide-react'

interface OfflineIndicatorProps {
  isOnline: boolean
  pendingOrders: number
}

export function OfflineIndicator({ isOnline, pendingOrders }: OfflineIndicatorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        <span>{isOnline ? "Online" : "Offline"}</span>
      </Badge>
      
      {pendingOrders > 0 && (
        <Badge variant="warning" className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>{pendingOrders} Pending</span>
        </Badge>
      )}
    </div>
  )
}
