import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Travel } from '../../../shared/models/entities.model';

@Injectable({
  providedIn: 'root'
})
export class TravelService {
  private baseUrl = '/travel/admin/travels';

  constructor(private http: HttpClient) {}

  getTravels(): Observable<Travel[]> {
    return this.http.get<Travel[]>(this.baseUrl);
  }

  createTravel(travel: Omit<Travel, 'id'>): Observable<Travel> {
    return this.http.post<Travel>(this.baseUrl, travel);
  }

  updateTravel(id: string, travel: Omit<Travel, 'id'>): Observable<Travel> {
    return this.http.put<Travel>(`${this.baseUrl}/${id}`, travel);
  }

  deleteTravel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
