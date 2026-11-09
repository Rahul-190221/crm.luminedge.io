import { describe, expect, it } from 'vitest'
import { getStaffCapabilities, type StaffCapabilities } from './permissions'

const WRITE_FLAGS: ReadonlyArray<Exclude<keyof StaffCapabilities, 'readOnly'>> = [
  'canCreateLead',
  'canEditLead',
  'canChangeStage',
  'canAddNotes',
  'canAddFollowUp',
  'canManageBatches',
  'canSubmitEditRequests',
]

describe('getStaffCapabilities', () => {
  it('grants every write capability to admin', () => {
    const caps = getStaffCapabilities('admin')

    expect(caps.readOnly).toBe(false)
    for (const flag of WRITE_FLAGS) {
      expect(caps[flag]).toBe(true)
    }
  })

  it('denies every write capability to bdm and marks it read-only', () => {
    const caps = getStaffCapabilities('bdm')

    expect(caps.readOnly).toBe(true)
    for (const flag of WRITE_FLAGS) {
      expect(caps[flag]).toBe(false)
    }
  })

  it.each([undefined, null, '', 'student', 'ADMIN', 'Admin', 'admin ', 'superadmin', 'garbage'])(
    'fails closed for role %j',
    (role) => {
      const caps = getStaffCapabilities(role)

      expect(caps.readOnly).toBe(true)
      for (const flag of WRITE_FLAGS) {
        expect(caps[flag]).toBe(false)
      }
    },
  )

  it('returns a fresh object so callers cannot mutate the shared policy', () => {
    const first = getStaffCapabilities('admin')
    Reflect.set(first, 'canCreateLead', false)

    const second = getStaffCapabilities('admin')
    expect(second.canCreateLead).toBe(true)

    const readOnlyFirst = getStaffCapabilities('bdm')
    Reflect.set(readOnlyFirst, 'readOnly', false)

    const readOnlySecond = getStaffCapabilities('bdm')
    expect(readOnlySecond.readOnly).toBe(true)
  })
})
