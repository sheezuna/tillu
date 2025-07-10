interface OfflineOrder {
  id: string
  items: any[]
  total: number
  timestamp: number
  customerInfo?: any
  status: 'pending' | 'synced' | 'failed'
}

interface SyncConflict {
  localOrder: OfflineOrder
  serverOrder?: any
  conflictType: 'duplicate' | 'modified' | 'deleted'
  resolution?: 'keep_local' | 'keep_server' | 'merge'
}

class OfflineSyncService {
  private dbName = 'tillu-pos-offline'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' })
          orderStore.createIndex('timestamp', 'timestamp', { unique: false })
          orderStore.createIndex('status', 'status', { unique: false })
        }
        
        if (!db.objectStoreNames.contains('menuItems')) {
          const menuStore = db.createObjectStore('menuItems', { keyPath: 'id' })
          menuStore.createIndex('category', 'category', { unique: false })
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
        }
      }
    })
  }

  async saveOfflineOrder(order: Omit<OfflineOrder, 'id' | 'timestamp' | 'status'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized')
    
    const offlineOrder: OfflineOrder = {
      ...order,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending'
    }
    
    const transaction = this.db.transaction(['orders'], 'readwrite')
    const store = transaction.objectStore('orders')
    
    return new Promise((resolve, reject) => {
      const request = store.add(offlineOrder)
      request.onsuccess = () => resolve(offlineOrder.id)
      request.onerror = () => reject(request.error)
    })
  }

  async getOfflineOrders(): Promise<OfflineOrder[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['orders'], 'readonly')
    const store = transaction.objectStore('orders')
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingOrders(): Promise<OfflineOrder[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['orders'], 'readonly')
    const store = transaction.objectStore('orders')
    const index = store.index('status')
    
    return new Promise((resolve, reject) => {
      const request = index.getAll('pending')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async syncWithServer(): Promise<{ synced: number; conflicts: SyncConflict[] }> {
    const pendingOrders = await this.getPendingOrders()
    const conflicts: SyncConflict[] = []
    let syncedCount = 0

    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: order.items,
            total: order.total,
            customerInfo: order.customerInfo,
            offlineId: order.id,
            offlineTimestamp: order.timestamp,
          }),
        })

        if (response.ok) {
          await this.markOrderSynced(order.id)
          syncedCount++
        } else if (response.status === 409) {
          const conflictData = await response.json()
          conflicts.push({
            localOrder: order,
            serverOrder: conflictData.existingOrder,
            conflictType: 'duplicate',
          })
        } else {
          await this.markOrderFailed(order.id)
        }
      } catch (error) {
        console.error('Sync error for order', order.id, error)
        await this.markOrderFailed(order.id)
      }
    }

    return { synced: syncedCount, conflicts }
  }

  async resolveConflict(conflict: SyncConflict, resolution: 'keep_local' | 'keep_server' | 'merge'): Promise<void> {
    switch (resolution) {
      case 'keep_local':
        await this.forceUploadOrder(conflict.localOrder)
        break
      case 'keep_server':
        await this.markOrderSynced(conflict.localOrder.id)
        break
      case 'merge':
        await this.mergeOrders(conflict.localOrder, conflict.serverOrder)
        break
    }
  }

  private async markOrderSynced(orderId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['orders'], 'readwrite')
    const store = transaction.objectStore('orders')
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(orderId)
      getRequest.onsuccess = () => {
        const order = getRequest.result
        if (order) {
          order.status = 'synced'
          const putRequest = store.put(order)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  private async markOrderFailed(orderId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['orders'], 'readwrite')
    const store = transaction.objectStore('orders')
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(orderId)
      getRequest.onsuccess = () => {
        const order = getRequest.result
        if (order) {
          order.status = 'failed'
          const putRequest = store.put(order)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  private async forceUploadOrder(order: OfflineOrder): Promise<void> {
    const response = await fetch('/api/orders/force', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    })

    if (response.ok) {
      await this.markOrderSynced(order.id)
    } else {
      throw new Error('Failed to force upload order')
    }
  }

  private async mergeOrders(localOrder: OfflineOrder, serverOrder: any): Promise<void> {
    const mergedOrder = {
      ...localOrder,
      items: [...localOrder.items, ...serverOrder.items],
      total: localOrder.total + serverOrder.total,
    }

    await this.forceUploadOrder(mergedOrder)
  }

  async cacheMenuItems(items: any[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['menuItems'], 'readwrite')
    const store = transaction.objectStore('menuItems')
    
    for (const item of items) {
      store.put(item)
    }
  }

  async getCachedMenuItems(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['menuItems'], 'readonly')
    const store = transaction.objectStore('menuItems')
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async isOnline(): Promise<boolean> {
    if (!navigator.onLine) return false
    
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
      return response.ok
    } catch {
      return false
    }
  }

  async startAutoSync(): Promise<void> {
    const syncInterval = setInterval(async () => {
      if (await this.isOnline()) {
        try {
          await this.syncWithServer()
        } catch (error) {
          console.error('Auto-sync failed:', error)
        }
      }
    }, 30000)

    window.addEventListener('online', async () => {
      try {
        await this.syncWithServer()
      } catch (error) {
        console.error('Online sync failed:', error)
      }
    })
  }
}

export const offlineSyncService = new OfflineSyncService()
