export interface PhoneCountryRule {
  min: number
  max: number
  stripLeadingZero: boolean
}

export interface PhoneCountryOption extends PhoneCountryRule {
  code: `+${string}`
  name: string
  flag: string
}

export const PHONE_COUNTRIES = [
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh', min: 10, max: 10, stripLeadingZero: true },
  { code: '+91', flag: '🇮🇳', name: 'India', min: 10, max: 10, stripLeadingZero: false },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan', min: 10, max: 10, stripLeadingZero: true },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka', min: 9, max: 10, stripLeadingZero: true },
  { code: '+977', flag: '🇳🇵', name: 'Nepal', min: 9, max: 10, stripLeadingZero: true },
  { code: '+95', flag: '🇲🇲', name: 'Myanmar', min: 8, max: 10, stripLeadingZero: true },
  { code: '+1', flag: '🇺🇸', name: 'United States', min: 10, max: 10, stripLeadingZero: false },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom', min: 10, max: 10, stripLeadingZero: true },
  { code: '+61', flag: '🇦🇺', name: 'Australia', min: 9, max: 9, stripLeadingZero: true },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates', min: 9, max: 9, stripLeadingZero: false },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', min: 9, max: 9, stripLeadingZero: false },
  { code: '+65', flag: '🇸🇬', name: 'Singapore', min: 8, max: 8, stripLeadingZero: false },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia', min: 9, max: 11, stripLeadingZero: true },
  { code: '+66', flag: '🇹🇭', name: 'Thailand', min: 9, max: 10, stripLeadingZero: true },
  { code: '+81', flag: '🇯🇵', name: 'Japan', min: 10, max: 11, stripLeadingZero: true },
  { code: '+82', flag: '🇰🇷', name: 'South Korea', min: 9, max: 11, stripLeadingZero: true },
  { code: '+86', flag: '🇨🇳', name: 'China', min: 11, max: 11, stripLeadingZero: true },
  { code: '+49', flag: '🇩🇪', name: 'Germany', min: 10, max: 12, stripLeadingZero: true },
  { code: '+33', flag: '🇫🇷', name: 'France', min: 9, max: 10, stripLeadingZero: true },
] as const satisfies readonly PhoneCountryOption[]

export type PhoneCountryCode = (typeof PHONE_COUNTRIES)[number]['code']

export const DEFAULT_PHONE_COUNTRY_CODE: PhoneCountryCode = '+880'

export const countryRules: Record<PhoneCountryCode, PhoneCountryRule> = PHONE_COUNTRIES.reduce(
  (acc, country) => {
    acc[country.code] = {
      min: country.min,
      max: country.max,
      stripLeadingZero: country.stripLeadingZero,
    }
    return acc
  },
  {} as Record<PhoneCountryCode, PhoneCountryRule>
)

export const PHONE_RULES = countryRules

export const PHONE_INPUT_ALLOWED_CHARACTERS = /[^0-9+\s()-]/g

export const sanitizePhoneTypingInput = (value: string): string =>
  value.replace(PHONE_INPUT_ALLOWED_CHARACTERS, '')

export const extractPhoneDigits = (value: string): string => value.replace(/\D/g, '')

const getPhoneRule = (countryCode: string): PhoneCountryRule | null =>
  countryRules[countryCode as PhoneCountryCode] ?? null

const stripManualCountryPrefix = (digits: string, countryDigits: string): string => {
  if (!countryDigits) return digits

  if (digits.startsWith(`00${countryDigits}`)) {
    return digits.slice(2 + countryDigits.length)
  }

  if (digits.startsWith(countryDigits)) {
    return digits.slice(countryDigits.length)
  }

  return digits
}

const stripNationalTrunkPrefix = (digits: string): string =>
  digits.startsWith('0') ? digits.slice(1) : digits

export const normalizePhone = (phone: string, countryCode: string): string => {
  let digits = extractPhoneDigits(phone)
  const countryDigits = extractPhoneDigits(countryCode)
  const rule = getPhoneRule(countryCode)

  digits = stripManualCountryPrefix(digits, countryDigits)

  if (rule?.stripLeadingZero) {
    digits = stripNationalTrunkPrefix(digits)
  }

  return digits
}

export const buildInternationalPhone = (phone: string, countryCode: string): string => {
  const normalized = normalizePhone(phone, countryCode)
  const countryDigits = extractPhoneDigits(countryCode)

  if (!normalized || !countryDigits) return ''
  return `+${countryDigits}${normalized}`
}

export const validatePhone = (phone: string, countryCode: string): string | null => {
  const rule = getPhoneRule(countryCode)
  if (!rule) return null

  const raw = String(phone ?? '').trim()
  if (!raw) return null

  const normalized = normalizePhone(raw, countryCode)
  if (!normalized) return `Enter a valid phone number for ${countryCode}.`

  const range = rule.min === rule.max ? `${rule.min}` : `${rule.min}-${rule.max}`

  if (normalized.length < rule.min) {
    return `Phone too short for ${countryCode}: need ${range} digits, got ${normalized.length}.`
  }

  if (normalized.length > rule.max) {
    return `Phone too long for ${countryCode}: need ${range} digits, got ${normalized.length}.`
  }

  return null
}

export const splitPhoneEntries = (value?: string | null): string[] =>
  (value || '')
    .split(/[;,\n]+/)
    .map(part => part.trim())
    .filter(Boolean)

export const normalizeStoredPhones = (value: string | undefined | null, countryCode: string): string[] =>
  splitPhoneEntries(value)
    .map(entry => buildInternationalPhone(entry, countryCode))
    .filter(Boolean)

export const phoneEntryMatches = (left: string, right: string, countryCode: string): boolean =>
  buildInternationalPhone(left, countryCode) === buildInternationalPhone(right, countryCode)

export const hasMatchingPhoneEntry = (
  existingPhone: string | undefined | null,
  nextPhone: string,
  countryCode: string
): boolean => splitPhoneEntries(existingPhone).some(entry => phoneEntryMatches(entry, nextPhone, countryCode))

export const mergePhoneEntries = (
  existingPhone: string | undefined | null,
  nextPhone: string,
  countryCode: string
): string => {
  const normalizedNextPhone = buildInternationalPhone(nextPhone, countryCode)
  if (!normalizedNextPhone) return (existingPhone || '').trim()

  const existingEntries = splitPhoneEntries(existingPhone)
  if (hasMatchingPhoneEntry(existingPhone, nextPhone, countryCode)) {
    return existingEntries.join(', ')
  }

  return [...existingEntries, normalizedNextPhone].filter(Boolean).join(', ')
}

export const formatPhoneCountryLabel = (country: PhoneCountryOption): string =>
  `${country.flag} ${country.name} (${country.code})`

export const getPhoneSearchVariants = (value: string, countryCode?: string): string[] => {
  const raw = String(value ?? '').trim()
  if (!raw) return []

  const variants = new Set<string>()
  const digits = extractPhoneDigits(raw)

  if (raw) variants.add(raw)
  if (digits) variants.add(digits)

  const countryCodes = countryCode
    ? [countryCode]
    : PHONE_COUNTRIES.map(country => country.code)

  for (const code of countryCodes) {
    const normalized = normalizePhone(raw, code)
    if (normalized) {
      variants.add(normalized)
      const intl = buildInternationalPhone(raw, code)
      if (intl) variants.add(extractPhoneDigits(intl))
    }
  }

  return [...variants].filter(Boolean)
}

export const matchesPhoneSearch = (phone: string, query: string, countryCode?: string): boolean => {
  const queryVariants = getPhoneSearchVariants(query, countryCode)
  if (queryVariants.length === 0) return true

  const phoneVariants = getPhoneSearchVariants(phone, countryCode)
  return phoneVariants.some(phoneVariant =>
    queryVariants.some(queryVariant =>
      phoneVariant.includes(queryVariant) || queryVariant.includes(phoneVariant)
    )
  )
}