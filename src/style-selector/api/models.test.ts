/*import { getCategoriesByType, getModelsByType } from './models'
import type { ApiModelsResponse } from './models'

const MOCK_DATA: ApiModelsResponse = {
  sunglasses: [
    {
      category: 'CLASSIC',
      models: [
        { modelCode: 'RB2140', vendorId: 'v1', pageUrl: '/rb2140', promoBadge: '', label: 'Wayfarer', thumbnailUrl: '/img/rb2140.jpg' },
        { modelCode: 'RB3025', vendorId: 'v2', pageUrl: '/rb3025', promoBadge: '', label: 'Aviator', thumbnailUrl: '/img/rb3025.jpg' },
        { modelCode: 'RB2140', vendorId: 'v1', pageUrl: '/rb2140', promoBadge: '', label: 'Wayfarer (dup)', thumbnailUrl: '/img/rb2140.jpg' },
      ],
    },
    {
      category: 'KIDS',
      models: [
        { modelCode: 'RJ9077S', vendorId: 'v3', pageUrl: '/rj9077s', promoBadge: '', label: 'Junior', thumbnailUrl: '/img/rj9077s.jpg' },
      ],
    },
  ],
  eyeglasses: [
    {
      category: 'OPTICAL',
      models: [
        { modelCode: 'RX5228', vendorId: 'v4', pageUrl: '/rx5228', promoBadge: '', label: 'Optical', thumbnailUrl: '/img/rx5228.jpg' },
      ],
    },
  ],
}

describe.skip('getCategoriesByType', () => {
  it('returns adult sunglasses categories, excluding KIDS', () => {
    const result = getCategoriesByType(MOCK_DATA, 'sunglasses')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('CLASSIC')
  })

  it('returns only KIDS category for kids-sunglasses', () => {
    const result = getCategoriesByType(MOCK_DATA, 'kids-sunglasses')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('KIDS')
  })

  it('returns eyeglasses categories', () => {
    const result = getCategoriesByType(MOCK_DATA, 'eyeglasses')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('OPTICAL')
  })
})

describe('getModelsByType', () => {
  it('deduplicates models by modelCode', () => {
    const result = getModelsByType(MOCK_DATA, 'sunglasses')
    const codes = result.map(m => m.modelCode)
    expect(codes).toEqual(['RB2140', 'RB3025'])
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('returns first occurrence when deduplicating', () => {
    const result = getModelsByType(MOCK_DATA, 'sunglasses')
    const wayfarer = result.find(m => m.modelCode === 'RB2140')
    expect(wayfarer?.label).toBe('Wayfarer')
  })
})
*/