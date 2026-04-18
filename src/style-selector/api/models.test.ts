import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Models } from './models'
import { StepType } from '@/declarations/enums'
import type { MergedParams } from '@/declarations/types'

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockUiSettings = {
  globals: {
    i18n: {
      allLabel: 'All',
      styleSelectorCategoryLabelSunglasses: 'Sunglasses',
      styleSelectorCategoryLabelEyeglasses: 'Eyeglasses',
    },
  },
}

const mockModelsResponse = {
  sunglasses: [
    {
      category: 'Classic',
      models: [
        { modelCode: 'RB2140', vendorId: 'v1', pageUrl: '/rb2140', label: 'Wayfarer', thumbnailUrl: '/w.jpg' },
        { modelCode: 'RB3025', vendorId: 'v2', pageUrl: '/rb3025', label: 'Aviator', thumbnailUrl: '/a.jpg' },
        // Intentional duplicate — same modelCode as the first entry
        { modelCode: 'RB2140', vendorId: 'v1', pageUrl: '/rb2140', label: 'Wayfarer Dup', thumbnailUrl: '/w.jpg' },
      ],
    },
    {
      category: 'Kids',
      models: [
        { modelCode: 'RJ9077S', vendorId: 'v3', pageUrl: '/rj9077s', label: 'Junior', thumbnailUrl: '/j.jpg' },
      ],
    },
  ],
  eyeglasses: [
    {
      category: 'Optical',
      models: [
        { modelCode: 'RX5228', vendorId: 'v4', pageUrl: '/rx5228', label: 'Optical', thumbnailUrl: '/o.jpg' },
      ],
    },
  ],
}

const baseParams: MergedParams = {
  endpoint: 'https://example.com/models?language=',
  lang: 'en',
  workflow: 'prod',
  customer: 1581,
  product: 123,
  locale: 'en_us',
  store: '',
  mockMyDesigns: false,
  mockInspirations: false,
  startWithStyleSelector: '',
} as unknown as MergedParams

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockFetch() {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (String(url).includes('fluidconfigure')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUiSettings) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(mockModelsResponse) })
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Models', () => {
  beforeEach(mockFetch)
  afterEach(() => vi.restoreAllMocks())

  // ── init() ──────────────────────────────────────────────────────────────────

  describe('init()', () => {
    it('returns a defined result with all expected fields', async () => {
      const result = await new Models(baseParams).init()
      expect(result).toBeDefined()
      expect(result.i18n).toBeDefined()
      expect(result.stepsTranslated).toBeDefined()
      expect(result.modelsTypesTranslated).toBeDefined()
      expect(result.flatModels).toBeDefined()
    })

    it('returns undefined when the models fetch fails (non-ok response)', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
      const result = await new Models(baseParams).init()
      expect(result).toBeUndefined()
    })

    it('returns undefined when fetch throws (network error)', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
      const result = await new Models(baseParams).init()
      expect(result).toBeUndefined()
    })
  })

  // ── Steps (mapModels) ──────────────────────────────────────────────────────

  describe('steps', () => {
    it('creates exactly 2 steps (TYPE + MODEL) when no inspirations', async () => {
      const result = await new Models(baseParams).init()
      expect(result.stepsTranslated).toHaveLength(2)
    })

    it('first step has type TYPE', async () => {
      const result = await new Models(baseParams).init()
      expect(result.stepsTranslated?.[0].type).toBe(StepType.TYPE)
    })

    it('second step has type MODEL', async () => {
      const result = await new Models(baseParams).init()
      expect(result.stepsTranslated?.[1].type).toBe(StepType.MODEL)
    })

    it('adds an INSPIRATIONS step when mockInspirations=true', async () => {
      const result = await new Models({ ...baseParams, mockInspirations: true } as MergedParams).init()
      expect(result.stepsTranslated).toHaveLength(3)
      expect(result.stepsTranslated?.[2].type).toBe(StepType.INSPIRATIONS)
    })

    it('inspirations array is populated when mockInspirations=true', async () => {
      const result = await new Models({ ...baseParams, mockInspirations: true } as MergedParams).init()
      expect(result.inspirations?.length).toBeGreaterThan(0)
    })

    it('inspirations is an empty array when mockInspirations is false', async () => {
      const result = await new Models(baseParams).init()
      expect(result.inspirations).toEqual([])
    })
  })

  // ── Types (mapModels) ──────────────────────────────────────────────────────

  describe('modelsTypesTranslated', () => {
    it('contains an entry for each API type key', async () => {
      const result = await new Models(baseParams).init()
      const names = result.modelsTypesTranslated?.map(t => t.name)
      expect(names).toContain('sunglasses')
      expect(names).toContain('eyeglasses')
    })

    it('adds "my_design" type when mockMyDesigns=true', async () => {
      const result = await new Models({ ...baseParams, mockMyDesigns: true } as MergedParams).init()
      const names = result.modelsTypesTranslated?.map(t => t.name)
      expect(names?.[0]).toBe('my_design')
    })

    it('does not add "my_design" type when mockMyDesigns=false', async () => {
      const result = await new Models(baseParams).init()
      const names = result.modelsTypesTranslated?.map(t => t.name)
      expect(names).not.toContain('my_design')
    })

    it('my_design type carries the designs count as length', async () => {
      const result = await new Models({ ...baseParams, mockMyDesigns: true } as MergedParams).init()
      const myDesign = result.modelsTypesTranslated?.find(t => t.name === 'my_design')
      expect(myDesign?.length).toBeGreaterThan(0)
    })
  })

  // ── flatModels / deduplication ─────────────────────────────────────────────

  describe('flatModels', () => {
    it('"All" is the first FlatModel entry for each type', async () => {
      const result = await new Models(baseParams).init()
      const sunglass = result.flatModels?.filter(f => f.type === 'sunglasses')
      expect(sunglass?.[0].category).toBe('All')
    })

    it('deduplicates models by modelCode within the "All" category', async () => {
      const result = await new Models(baseParams).init()
      const allSunglasses = result.flatModels?.find(
        f => f.type === 'sunglasses' && f.category === 'All',
      )
      const codes = allSunglasses?.models.map(m => m.modelCode) ?? []
      expect(new Set(codes).size).toBe(codes.length)
    })

    it('keeps the first occurrence when deduplicating (not the duplicate)', async () => {
      const result = await new Models(baseParams).init()
      const allSunglasses = result.flatModels?.find(
        f => f.type === 'sunglasses' && f.category === 'All',
      )
      const wayfarer = allSunglasses?.models.find(m => m.modelCode === 'RB2140')
      expect(wayfarer?.label).toBe('Wayfarer')
    })

    it('includes per-category FlatModel entries after "All"', async () => {
      const result = await new Models(baseParams).init()
      const categories = result.flatModels
        ?.filter(f => f.type === 'sunglasses')
        .map(f => f.category)
      expect(categories).toContain('Classic')
      expect(categories).toContain('Kids')
    })
  })

  // ── getModelsUrl ───────────────────────────────────────────────────────────

  describe('getModelsUrl()', () => {
    it('appends lang to the endpoint', async () => {
      await new Models({ ...baseParams, endpoint: 'https://api.test/', lang: 'fr' } as MergedParams).init()
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
      const modelsCall = calls.find((args: unknown[]) => String(args[0]).includes('api.test'))
      expect(modelsCall?.[0]).toBe('https://api.test/fr')
    })

    it('replaces the store segment when a store param is provided', async () => {
      const endpoint = 'https://example.com/store/10151/models?language='
      await new Models({ ...baseParams, endpoint, lang: 'en', store: '99999' } as MergedParams).init()
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls
      const modelsCall = calls.find((args: unknown[]) => String(args[0]).includes('example.com'))
      expect(modelsCall?.[0]).toContain('store/99999')
      expect(modelsCall?.[0]).not.toContain('store/10151')
    })
  })

  // ── getMyDesigns ───────────────────────────────────────────────────────────

  describe('getMyDesigns()', () => {
    it('returns no my_design flat model when mockMyDesigns is false', async () => {
      const result = await new Models(baseParams).init()
      const myDesign = result.flatModels?.find(f => f.type === 'my_design')
      expect(myDesign).toBeUndefined()
    })

    it('populates my_design flat model when mockMyDesigns=true', async () => {
      const result = await new Models({ ...baseParams, mockMyDesigns: true } as MergedParams).init()
      const myDesign = result.flatModels?.find(f => f.type === 'my_design')
      expect(myDesign?.models.length).toBeGreaterThan(0)
    })
  })

  // ── mapPreselections ───────────────────────────────────────────────────────

  describe('mapPreselections()', () => {
    it('preselectedStep is undefined when startWithStyleSelector is empty', async () => {
      const result = await new Models(baseParams).init()
      expect(result.preselectedStep).toBeUndefined()
    })

    it('modelsToRender is empty when no preselection', async () => {
      const result = await new Models(baseParams).init()
      expect(result.modelsToRender).toEqual([])
    })

    it('sets preselectedStep to MODEL step when type param matches an existing type', async () => {
      const result = await new Models({
        ...baseParams,
        startWithStyleSelector: 'sunglasses',
      } as MergedParams).init()
      expect(result.preselectedStep?.type).toBe(StepType.MODEL)
    })

    it('preselectedCategoriesFilters is populated when type matches', async () => {
      const result = await new Models({
        ...baseParams,
        startWithStyleSelector: 'sunglasses',
      } as MergedParams).init()
      expect(result.preselectedCategoriesFilters?.length).toBeGreaterThan(0)
    })

    it('preselectedStep is undefined when type does not exist in the API response', async () => {
      const result = await new Models({
        ...baseParams,
        startWithStyleSelector: 'nonexistent',
      } as MergedParams).init()
      expect(result.preselectedStep).toBeUndefined()
    })
  })
})
