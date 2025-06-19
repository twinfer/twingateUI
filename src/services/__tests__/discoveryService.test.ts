import { describe, it, expect, beforeEach, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { discoveryService } from '../discoveryService'
import { env } from '@/config/env'

describe('DiscoveryService', () => {
  beforeEach(() => {
    // Reset any request handlers between tests
    server.resetHandlers()
  })

  describe('discoverSingleThing', () => {
    it('successfully discovers a Thing from URL', async () => {
      const mockTD = {
        '@context': 'https://www.w3.org/2019/wot/td/v1',
        '@type': 'Thing',
        id: 'urn:test:thing',
        title: 'Test Thing',
        description: 'A test Thing Description',
        properties: {
          status: {
            type: 'string',
            readOnly: true
          }
        }
      }

      server.use(
        http.get('http://example.com/thing.json', () => {
          return HttpResponse.json(mockTD)
        })
      )

      const result = await discoveryService.discoverSingleThing('http://example.com/thing.json')
      
      expect(result).toMatchObject({
        id: expect.any(String),
        url: 'http://example.com/thing.json',
        title: 'Test Thing',
        description: 'A test Thing Description',
        discoveryMethod: 'direct-url',
        online: true,
        validationStatus: expect.stringMatching(/valid|pending/),
        thingDescription: mockTD,
      })
    })

    it('handles network errors gracefully', async () => {
      server.use(
        http.get('http://example.com/unreachable.json', () => {
          return HttpResponse.error()
        })
      )

      await expect(
        discoveryService.discoverSingleThing('http://example.com/unreachable.json')
      ).rejects.toThrow()
    })

    it('handles invalid JSON responses', async () => {
      server.use(
        http.get('http://example.com/invalid.json', () => {
          return new HttpResponse('invalid json{', {
            headers: { 'Content-Type': 'application/json' }
          })
        })
      )

      await expect(
        discoveryService.discoverSingleThing('http://example.com/invalid.json')
      ).rejects.toThrow()
    })
  })

  describe('scanWellKnownOptimized', () => {
    it('discovers Things from .well-known/wot endpoint', async () => {
      const mockDirectory = {
        things: [
          {
            href: 'http://example.com/things/sensor1',
            rel: 'thing'
          },
          {
            href: 'http://example.com/things/actuator1', 
            rel: 'thing'
          }
        ]
      }

      const mockTD1 = {
        '@context': 'https://www.w3.org/2019/wot/td/v1',
        id: 'sensor1',
        title: 'Temperature Sensor',
        properties: { temperature: { type: 'number' } }
      }

      const mockTD2 = {
        '@context': 'https://www.w3.org/2019/wot/td/v1',
        id: 'actuator1', 
        title: 'Light Switch',
        actions: { toggle: { title: 'Toggle Light' } }
      }

      server.use(
        http.get('http://example.com/.well-known/wot', () => {
          return HttpResponse.json(mockDirectory)
        }),
        http.get('http://example.com/things/sensor1', () => {
          return HttpResponse.json(mockTD1)
        }),
        http.get('http://example.com/things/actuator1', () => {
          return HttpResponse.json(mockTD2)
        })
      )

      const results = await discoveryService.scanWellKnownOptimized('http://example.com')
      
      expect(results).toHaveLength(2)
      expect(results[0]).toMatchObject({
        discoveryMethod: 'well-known'
      })
      expect(results[1]).toMatchObject({
        discoveryMethod: 'well-known'
      })
      
      // Check that we got titles from the mock TDs
      const titles = results.map(r => r.title)
      expect(titles).toHaveLength(2)
      expect(titles.every(title => typeof title === 'string')).toBe(true)
    })

    it('handles empty discovery directory', async () => {
      server.use(
        http.get('http://example.com/.well-known/wot', () => {
          return HttpResponse.json({ things: [] })
        })
      )

      const results = await discoveryService.scanWellKnownOptimized('http://example.com')
      
      expect(results).toHaveLength(0)
    })

    it('handles missing .well-known endpoint', async () => {
      server.use(
        http.get('http://example.com/.well-known/wot', () => {
          return new HttpResponse(null, { status: 404 })
        })
      )

      await expect(
        discoveryService.scanWellKnownOptimized('http://example.com')
      ).rejects.toThrow('HTTP 404')
    })
  })

  describe('validateTD', () => {
    it('validates a correct Thing Description', async () => {
      const validTD = {
        '@context': 'https://www.w3.org/2019/wot/td/v1',
        '@type': 'Thing',
        title: 'Valid Thing',
        security: ['nosec_sc'],
        securityDefinitions: {
          nosec_sc: { scheme: 'nosec' }
        }
      }

      const result = await discoveryService.validateTD(validTD)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('identifies validation errors in invalid TD', async () => {
      const invalidTD = {
        // Missing required @context
        title: 'Invalid Thing'
      }

      const result = await discoveryService.validateTD(invalidTD)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('discoverThings', () => {
    it('discovers Things from multiple endpoints', async () => {
      const mockProgress = vi.fn()
      
      // Mock successful discovery from multiple endpoints
      server.use(
        http.get('http://endpoint1.com/.well-known/wot', () => {
          return HttpResponse.json({
            things: [{ href: 'http://endpoint1.com/thing1', rel: 'thing' }]
          })
        }),
        http.get('http://endpoint2.com/.well-known/wot', () => {
          return HttpResponse.json({
            things: [{ href: 'http://endpoint2.com/thing2', rel: 'thing' }] 
          })
        }),
        http.get('http://endpoint1.com/thing1', () => {
          return HttpResponse.json({
            '@context': 'https://www.w3.org/2019/wot/td/v1',
            title: 'Thing 1'
          })
        }),
        http.get('http://endpoint2.com/thing2', () => {
          return HttpResponse.json({
            '@context': 'https://www.w3.org/2019/wot/td/v1', 
            title: 'Thing 2'
          })
        })
      )

      const result = await discoveryService.discoverThings(
        ['http://endpoint1.com', 'http://endpoint2.com'],
        mockProgress
      )
      
      expect(result.discovered).toHaveLength(2)
      expect(result.errors).toHaveLength(0)
      
      // Check that both things were discovered
      const titles = result.discovered.map(d => d.title)
      expect(titles).toHaveLength(2)
      
      // Check that progress callback was called
      expect(mockProgress).toHaveBeenCalled()
    })
  })
})