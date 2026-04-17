export interface PlaceDto {
  id: string;
  name: string;
  country: string;
}

export interface UpsertPlaceRequest {
  name: string;
  country: string;
}
