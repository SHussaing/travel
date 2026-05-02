import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from './user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { User } from '../../../shared/models/entities.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should get users', () => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'user1@test.com',
        enabled: true,
        roles: new Set(['USER'])
      }
    ];

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].email).toBe('user1@test.com');
    });

    const req = httpMock.expectOne('/users/admin/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should create user', () => {
    const newUser = {
      email: 'newuser@test.com',
      enabled: true,
      roles: new Set(['USER'])
    };

    service.createUser(newUser).subscribe(user => {
      expect(user.id).toBe('1');
      expect(user.email).toBe('newuser@test.com');
    });

    const req = httpMock.expectOne('/users/admin/users');
    expect(req.request.method).toBe('POST');
    req.flush({ id: '1', ...newUser });
  });

  it('should update user', () => {
    const updateData = {
      email: 'updated@test.com',
      enabled: false,
      roles: new Set(['ADMIN'])
    };

    service.updateUser('1', updateData).subscribe(user => {
      expect(user.email).toBe('updated@test.com');
    });

    const req = httpMock.expectOne('/users/admin/users/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: '1', ...updateData });
  });

  it('should delete user', () => {
    service.deleteUser('1').subscribe(() => {
      expect(true).toBe(true);
    });

    const req = httpMock.expectOne('/users/admin/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
