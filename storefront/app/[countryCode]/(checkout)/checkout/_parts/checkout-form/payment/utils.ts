export function isStripe(providerId?: string) {
  return providerId?.startsWith("pp_stripe_");
}

export function isManual(providerId?: string) {
  return providerId?.startsWith("pp_system_default");
}

export function isPayOs(providerId?: string) {
  return providerId?.startsWith("pp_payos_");
}
