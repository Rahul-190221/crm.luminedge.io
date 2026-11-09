// Central frontend permission policy for staff screens.
//
// This is a UI-level policy only. It decides which controls a staff member sees;
// it does NOT authorize API requests. The backend remains the security boundary.
//
// Fail-closed: only the literal role 'admin' gets write capabilities. A missing,
// unknown, student or misspelled role is treated as read-only.

export interface StaffCapabilities {
  readonly readOnly: boolean
  readonly canCreateLead: boolean
  readonly canEditLead: boolean
  readonly canChangeStage: boolean
  readonly canAddNotes: boolean
  readonly canAddFollowUp: boolean
  readonly canManageBatches: boolean
  readonly canSubmitEditRequests: boolean
}

const ADMIN_CAPABILITIES: StaffCapabilities = Object.freeze({
  readOnly: false,
  canCreateLead: true,
  canEditLead: true,
  canChangeStage: true,
  canAddNotes: true,
  canAddFollowUp: true,
  canManageBatches: true,
  canSubmitEditRequests: true,
})

const READ_ONLY_CAPABILITIES: StaffCapabilities = Object.freeze({
  readOnly: true,
  canCreateLead: false,
  canEditLead: false,
  canChangeStage: false,
  canAddNotes: false,
  canAddFollowUp: false,
  canManageBatches: false,
  canSubmitEditRequests: false,
})

/**
 * Resolve the capabilities for a decoded staff role.
 *
 * Returns a fresh object so callers can never mutate the shared policy.
 */
export function getStaffCapabilities(role?: string | null): StaffCapabilities {
  if (role === 'admin') {
    return { ...ADMIN_CAPABILITIES }
  }
  return { ...READ_ONLY_CAPABILITIES }
}
