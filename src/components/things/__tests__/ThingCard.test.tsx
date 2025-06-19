import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import { ThingCard } from '../ThingCard'
import { createMockThing } from '@/test/test-utils'

describe('ThingCard', () => {
  const mockThing = createMockThing({
    id: 'test-thing-1',
    title: 'Temperature Sensor',
    description: 'A smart temperature sensor',
  })

  it('renders thing information correctly', () => {
    render(<ThingCard thing={mockThing} />)
    
    expect(screen.getByText('Temperature Sensor')).toBeInTheDocument()
    expect(screen.getByText('A smart temperature sensor')).toBeInTheDocument()
    expect(screen.getByText('http://example.com/thing')).toBeInTheDocument()
  })

  it('shows online status when thing is online', () => {
    const onlineThing = createMockThing({
      status: 'online',
    })
    
    render(<ThingCard thing={onlineThing} />)
    
    expect(screen.getByText('online')).toBeInTheDocument()
  })

  it('shows offline status when thing is offline', () => {
    const offlineThing = createMockThing({
      status: 'offline',
    })
    
    render(<ThingCard thing={offlineThing} />)
    
    expect(screen.getByText('offline')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const mockOnEdit = vi.fn()
    
    render(<ThingCard thing={mockThing} onEdit={mockOnEdit} />)
    
    // Click the dropdown menu trigger first
    const menuButton = screen.getByRole('button')
    menuButton.click()
    
    // Wait for menu to open and find edit option
    await waitFor(() => {
      const editButton = screen.getByText('Edit Thing')
      editButton.click()
    })
    
    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(mockThing)
    })
  })

  it('calls onDelete when delete button is clicked', async () => {
    const mockOnDelete = vi.fn()
    
    render(<ThingCard thing={mockThing} onDelete={mockOnDelete} />)
    
    // Click the dropdown menu trigger first
    const menuButton = screen.getByRole('button')
    menuButton.click()
    
    // Wait for menu to open and find delete option
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Thing')
      deleteButton.click()
    })
    
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockThing)
    })
  })

  it('displays properties count when thing has properties', () => {
    const thingWithProperties = createMockThing({
      thingDescription: {
        '@context': 'https://www.w3.org/2019/wot/td/v1',
        '@type': 'Thing',
        id: 'test-thing-1',
        title: 'Test Thing',
        properties: {
          temperature: { type: 'number' },
          humidity: { type: 'number' },
          status: { type: 'string' },
        },
      },
    })
    
    render(<ThingCard thing={thingWithProperties} />)
    
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('displays actions count when thing has actions', () => {
    const thingWithActions = createMockThing({
      thingDescription: {
        '@context': 'https://www.w3.org/2019/wot/td/v1',
        '@type': 'Thing',
        id: 'test-thing-1',
        title: 'Test Thing',
        actions: {
          toggle: { title: 'Toggle' },
          reset: { title: 'Reset' },
        },
      },
    })
    
    render(<ThingCard thing={thingWithActions} />)
    
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})