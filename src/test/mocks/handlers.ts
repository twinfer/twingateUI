import { http, HttpResponse } from 'msw'
import { env } from '@/config/env'

const API_BASE = env.API_BASE_URL

// Mock data factories
const mockThing = (id: string) => ({
  id,
  title: `Mock Thing ${id}`,
  description: 'A mock Thing Description for testing',
  '@context': 'https://www.w3.org/2019/wot/td/v1',
  '@type': 'Thing',
  security: ['nosec_sc'],
  securityDefinitions: {
    nosec_sc: {
      scheme: 'nosec'
    }
  },
  properties: {
    status: {
      type: 'string',
      readOnly: true,
      enum: ['online', 'offline']
    },
    temperature: {
      type: 'number',
      readOnly: true,
      unit: 'celsius'
    }
  },
  actions: {
    toggle: {
      title: 'Toggle device',
      output: {
        type: 'string'
      }
    }
  },
  events: {
    statusChanged: {
      title: 'Status changed',
      data: {
        type: 'string'
      }
    }
  }
})

const mockThingsList = () => ({
  things: [
    mockThing('thing-1'),
    mockThing('thing-2'),
    mockThing('thing-3'),
  ],
  total: 3,
  page: 1,
  limit: 10
})

const mockDiscoveryResult = () => ({
  things: [
    {
      href: 'http://example.com/things/discovered-1',
      rel: 'thing'
    },
    {
      href: 'http://example.com/things/discovered-2', 
      rel: 'thing'
    }
  ]
})

export const handlers = [
  // Things API
  http.get(`${API_BASE}/api/things`, () => {
    return HttpResponse.json(mockThingsList())
  }),

  http.get(`${API_BASE}/api/things/:id`, ({ params }) => {
    const { id } = params
    return HttpResponse.json(mockThing(id as string))
  }),

  http.post(`${API_BASE}/api/things`, async ({ request }) => {
    const body = await request.json()
    const newThing = {
      ...mockThing('new-thing'),
      ...body,
      id: 'generated-id-' + Date.now()
    }
    return HttpResponse.json(newThing, { status: 201 })
  }),

  http.put(`${API_BASE}/api/things/:id`, async ({ params, request }) => {
    const { id } = params
    const body = await request.json()
    const updatedThing = {
      ...mockThing(id as string),
      ...body
    }
    return HttpResponse.json(updatedThing)
  }),

  http.delete(`${API_BASE}/api/things/:id`, ({ params }) => {
    const { id } = params
    return HttpResponse.json({ message: `Thing ${id} deleted successfully` })
  }),

  // Discovery API
  http.get(`${API_BASE}/api/directory/.well-known/wot`, () => {
    return HttpResponse.json(mockDiscoveryResult())
  }),

  http.post(`${API_BASE}/api/directory/search/text`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      results: [mockThing('search-result-1')],
      total: 1,
      query: body
    })
  }),

  // Properties API
  http.get(`${API_BASE}/api/things/:id/properties/:propertyName`, ({ params }) => {
    const { id, propertyName } = params
    
    // Mock property values based on property name
    const mockValues: Record<string, any> = {
      status: 'online',
      temperature: 23.5,
      humidity: 65,
      power: true
    }
    
    return HttpResponse.json({
      value: mockValues[propertyName as string] || 'mock-value',
      timestamp: new Date().toISOString()
    })
  }),

  http.put(`${API_BASE}/api/things/:id/properties/:propertyName`, async ({ params, request }) => {
    const { id, propertyName } = params
    const body = await request.json()
    
    return HttpResponse.json({
      success: true,
      property: propertyName,
      oldValue: 'previous-value',
      newValue: body.value,
      timestamp: new Date().toISOString()
    })
  }),

  // Actions API
  http.post(`${API_BASE}/api/things/:id/actions/:actionName`, async ({ params, request }) => {
    const { id, actionName } = params
    const body = await request.json()
    
    return HttpResponse.json({
      action: actionName,
      input: body,
      output: { result: 'success', timestamp: new Date().toISOString() },
      status: 'completed'
    })
  }),

  // Events API  
  http.get(`${API_BASE}/api/things/:id/events/:eventName`, ({ params }) => {
    const { id, eventName } = params
    
    return HttpResponse.json({
      event: eventName,
      data: { message: 'Mock event data' },
      timestamp: new Date().toISOString()
    })
  }),

  // Auth API
  http.post(`${API_BASE}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        }
      })
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.post(`${API_BASE}/api/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  // Config API
  http.get(`${API_BASE}/api/config`, () => {
    return HttpResponse.json({
      version: '1.0.0',
      features: ['discovery', 'things', 'properties', 'actions', 'events'],
      limits: {
        maxThings: 1000,
        maxProperties: 100
      }
    })
  }),
]