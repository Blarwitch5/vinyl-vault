export type DiscogsRelease = {
  id: number
  title: string
  year: number
  thumb: string
  cover_image: string
  resource_url: string
  master_id?: number
  master_url?: string
  uri: string
  country?: string
  formats?: DiscogsFormat[]
  genres?: string[]
  styles?: string[]
  labels?: DiscogsLabel[]
  artists?: DiscogsArtist[]
  tracklist?: DiscogsTrack[]
  videos?: DiscogsVideo[]
  community?: DiscogsCommunity
  estimated_weight?: number
  lowest_price?: number
  num_for_sale?: number
}

export type DiscogsFormat = {
  name: string
  qty: string
  descriptions?: string[]
  text?: string
}

export type DiscogsLabel = {
  name: string
  catno: string
  entity_type: string
  entity_type_name: string
  id: number
  resource_url: string
}

export type DiscogsArtist = {
  name: string
  anv: string
  join: string
  role: string
  tracks: string
  id: number
  resource_url: string
}

export type DiscogsTrack = {
  position: string
  type_: string
  title: string
  duration: string
  extraartists?: DiscogsArtist[]
}

export type DiscogsVideo = {
  uri: string
  title: string
  description: string
  duration: number
  embed: boolean
}

export type DiscogsCommunity = {
  want: number
  have: number
  rating: {
    count: number
    average: number
  }
  contributors?: DiscogsContributor[]
  submitter?: DiscogsUser
  data_quality?: string
  status?: string
}

export type DiscogsContributor = {
  username: string
  resource_url: string
}

export type DiscogsUser = {
  username: string
  resource_url: string
}

export type DiscogsSearchResult = {
  id: number
  type: string
  user_data?: {
    in_wantlist: boolean
    in_collection: boolean
  }
  master_id?: number
  master_url?: string
  uri: string
  title: string
  thumb: string
  cover_image: string
  resource_url: string
  country?: string
  year?: string
  format?: string[]
  label?: string[]
  genre?: string[]
  style?: string[]
  barcode?: string[]
  catno?: string
  community?: {
    want: number
    have: number
  }
}

export type DiscogsSearchResponse = {
  pagination: {
    page: number
    pages: number
    per_page: number
    items: number
    urls: {
      last?: string
      next?: string
    }
  }
  results: DiscogsSearchResult[]
}

export type DiscogsMasterRelease = {
  id: number
  main_release: number
  most_recent_release: number
  resource_url: string
  uri: string
  versions_url: string
  main_release_url: string
  most_recent_release_url: string
  num_for_sale: number
  lowest_price: number
  images: DiscogsImage[]
  genres: string[]
  styles: string[]
  year: number
  tracklist: DiscogsTrack[]
  artists: DiscogsArtist[]
  title: string
  data_quality: string
  videos?: DiscogsVideo[]
}

export type DiscogsImage = {
  type: string
  uri: string
  resource_url: string
  uri150: string
  width: number
  height: number
}
