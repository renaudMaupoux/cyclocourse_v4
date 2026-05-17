export interface Rider {
  id: string
  numero: number
  nom: string
  club: string
  category: number
  createdAt?: string
  updatedAt?: string
}

export interface RiderRankingRow extends Rider {
  firstAcquisitionAt: string | null
  rank: number
}

export interface RidersListResponse {
  success: boolean
  data: Rider[]
}

export interface RiderRankingResponse {
  success: boolean
  data: RiderRankingRow[]
}
