import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { getToken, clearToken } from './token.storage';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const token = getToken();

  let outReq = req;

  // Don't attach auth header to assets.
  if (token && !(req.url.startsWith('assets/') || req.url.startsWith('/assets/'))) {
    outReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(outReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
        clearToken();
        // avoid navigation loops on login
        if (router.url !== '/login') {
          router.navigateByUrl('/login');
        }
      }
      return throwError(() => err);
    })
  );
};
