import { describe, it, expect, beforeEach } from 'vitest';
import { TravelService } from './travel.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Travel } from '../../../shared/models/entities.model';

describe('TravelService', () => {
  let service: TravelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TravelService]
    });

    service = TestBed.inject(TravelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should get travels', () => {
    const mockTravels: Travel[] = [
      {
        id: '1',
        destination: 'Paris',
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        durationDays: 10,
        activities: 'Sightseeing',
        accommodation: '5-star hotel',
        transportation: 'Flight'
      }
    ];

    service.getTravels().subscribe(travels => {
      expect(travels.length).toBe(1);
      expect(travels[0].destination).toBe('Paris');
    });

    const req = httpMock.expectOne('/travel/admin/travels');
    expect(req.request.method).toBe('GET');
    req.flush(mockTravels);
  });

  it('should create travel', () => {
    const newTravel = {
      destination: 'Tokyo',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      durationDays: 15,
      activities: 'Temple visits',
      accommodation: 'Luxury resort',
      transportation: 'Flight'
    };

    service.createTravel(newTravel).subscribe(travel => {
      expect(travel.id).toBe('1');
      expect(travel.destination).toBe('Tokyo');
    });

    const req = httpMock.expectOne('/travel/admin/travels');
    expect(req.request.method).toBe('POST');
    req.flush({ id: '1', ...newTravel });
  });

  it('should update travel', () => {
    const updateData = {
      destination: 'Barcelona',
      startDate: '2024-03-01',
      endDate: '2024-03-08',
      durationDays: 8,
      activities: 'Beach & culture',
      accommodation: 'Modern hotel',
      transportation: 'Flight'
    };

    service.updateTravel('1', updateData).subscribe(travel => {
      expect(travel.destination).toBe('Barcelona');
    });

    const req = httpMock.expectOne('/travel/admin/travels/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: '1', ...updateData });
  });

  it('should delete travel', () => {
    service.deleteTravel('1').subscribe(() => {
      expect(true).toBe(true);
    });

    const req = httpMock.expectOne('/travel/admin/travels/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
