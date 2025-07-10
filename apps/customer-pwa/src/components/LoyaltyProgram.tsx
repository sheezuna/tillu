'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@tillu/ui'
import { Gift, Star, Trophy, Zap } from 'lucide-react'

interface LoyaltyData {
  points: number
  tier: string
  nextTierPoints: number
  availableRewards: Array<{
    id: string
    title: string
    description: string
    pointsCost: number
    type: 'discount' | 'free_item' | 'upgrade'
  }>
  recentActivity: Array<{
    date: string
    description: string
    points: number
  }>
}

export function LoyaltyProgram() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const mockLoyaltyData: LoyaltyData = {
      points: 1250,
      tier: 'Gold',
      nextTierPoints: 1500,
      availableRewards: [
        {
          id: '1',
          title: 'Free Garlic Naan',
          description: 'Complimentary garlic naan with any curry order',
          pointsCost: 200,
          type: 'free_item',
        },
        {
          id: '2',
          title: '15% Off Next Order',
          description: 'Get 15% discount on your entire next order',
          pointsCost: 500,
          type: 'discount',
        },
        {
          id: '3',
          title: 'Free Delivery',
          description: 'Free delivery on orders over £20',
          pointsCost: 300,
          type: 'upgrade',
        },
      ],
      recentActivity: [
        { date: '2025-07-09', description: 'Order #ORD-123', points: 50 },
        { date: '2025-07-08', description: 'Bonus points for review', points: 25 },
        { date: '2025-07-07', description: 'Order #ORD-122', points: 35 },
      ],
    }

    setLoyaltyData(mockLoyaltyData)
  }, [])

  const redeemReward = async (rewardId: string) => {
    if (!loyaltyData) return

    const reward = loyaltyData.availableRewards.find(r => r.id === rewardId)
    if (!reward || loyaltyData.points < reward.pointsCost) return

    try {
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      })

      if (response.ok) {
        setLoyaltyData(prev => prev ? {
          ...prev,
          points: prev.points - reward.pointsCost,
          availableRewards: prev.availableRewards.filter(r => r.id !== rewardId),
        } : null)
        alert(`${reward.title} redeemed successfully!`)
      }
    } catch (error) {
      console.error('Failed to redeem reward:', error)
    }
  }

  if (!loyaltyData) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progressPercentage = (loyaltyData.points / loyaltyData.nextTierPoints) * 100

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Loyalty Program</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{loyaltyData.points}</div>
            <div className="text-sm text-gray-600">Points Available</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Tier: {loyaltyData.tier}</span>
              <span>{loyaltyData.nextTierPoints - loyaltyData.points} to next tier</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {!isExpanded && (
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => setIsExpanded(true)}
            >
              View Rewards & Activity
            </Button>
          )}
        </CardContent>
      </Card>

      {isExpanded && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-green-500" />
                <span>Available Rewards</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loyaltyData.availableRewards.map((reward) => (
                <div key={reward.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{reward.title}</h4>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {reward.pointsCost} pts
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    disabled={loyaltyData.points < reward.pointsCost}
                    onClick={() => redeemReward(reward.id)}
                  >
                    {loyaltyData.points >= reward.pointsCost ? 'Redeem' : 'Not enough points'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loyaltyData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="text-sm font-medium">{activity.description}</div>
                      <div className="text-xs text-gray-500">{activity.date}</div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      +{activity.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => setIsExpanded(false)}
          >
            Hide Details
          </Button>
        </>
      )}
    </div>
  )
}

      {isExpanded && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-green-500" />
                <span>Available Rewards</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loyaltyData.availableRewards.map((reward) => (
                <div key={reward.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{reward.title}</h4>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {reward.pointsCost} pts
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    disabled={loyaltyData.points < reward.pointsCost}
                    onClick={() => redeemReward(reward.id)}
                  >
                    {loyaltyData.points >= reward.pointsCost ? 'Redeem' : 'Not enough points'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loyaltyData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="text-sm font-medium">{activity.description}</div>
                      <div className="text-xs text-gray-500">{activity.date}</div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      +{activity.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => setIsExpanded(false)}
          >
            Hide Details
          </Button>
        </>
      )}
    </div>
  )
}
