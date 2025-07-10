'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, Button, Badge } from '@tillu/ui'
import { Star, Clock, Heart } from 'lucide-react'

interface Recommendation {
  id: string
  name: string
  description: string
  price: number
  rating: number
  preparationTime: number
  reason: string
  discount?: number
}

export function PersonalizedRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    const mockRecommendations: Recommendation[] = [
      {
        id: '1',
        name: 'Chicken Tikka Masala',
        description: 'Your most ordered dish - creamy, flavorful, and perfectly spiced',
        price: 12.99,
        rating: 4.8,
        preparationTime: 25,
        reason: 'Your favorite',
        discount: 10,
      },
      {
        id: '2',
        name: 'Garlic Naan',
        description: 'Perfect pairing with your curry dishes',
        price: 3.50,
        rating: 4.7,
        preparationTime: 10,
        reason: 'Often ordered together',
      },
      {
        id: '3',
        name: 'Mango Lassi',
        description: 'Refreshing drink to complement spicy food',
        price: 2.95,
        rating: 4.5,
        preparationTime: 5,
        reason: 'Popular with similar customers',
      },
    ]

    setRecommendations(mockRecommendations)
  }, [])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recommended for You</h3>
      
      <div className="grid gap-4">
        {recommendations.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.discount && (
                      <Badge variant="destructive" className="text-xs">
                        {item.discount}% OFF
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span>{item.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{item.preparationTime} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {item.reason}
                    </Badge>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="p-1">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {item.discount ? (
                    <>
                      <span className="text-lg font-bold text-green-600">
                        £{(item.price * (1 - item.discount / 100)).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        £{item.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-blue-600">
                      £{item.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <Button size="sm">
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
