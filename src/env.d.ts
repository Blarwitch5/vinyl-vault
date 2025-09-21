/// <reference types="astro/client" />
/// <reference types="vite-plugin-pwa/client" />

// Types pour les données de vinyle
type VinylData = {
  id: string
  title: string
  artist: string
  year?: string | number
  format?: string
  coverImage?: string
  discogsId?: string
  discogsUrl?: string
  barcode?: string
  genre?: string
}

// Déclarations de types pour les propriétés globales de Window
declare global {
  interface Window {
    openDeleteVinylModal?: (vinyl: VinylData) => void
    addToCollection?: (
      collectionId: string,
      collectionName: string,
      vinylId: string
    ) => Promise<void>
    addToCollectionWithData?: (
      collectionId: string,
      collectionName: string,
      vinylData: VinylData
    ) => Promise<void>
    createCollectionAndAdd?: (vinylId: string) => Promise<void>
    hideVinylPreviewModal?: () => void
    showCreateCollectionForm?: () => void
  }
}
