type DataLayerEvent = { event: string } & Record<string, string>

export function track(payload: DataLayerEvent) {
  const w = window as unknown as { dataLayer?: DataLayerEvent[] }
  w.dataLayer?.push(payload)
}
