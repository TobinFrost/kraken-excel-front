import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from './product.model';

@Injectable({
  providedIn: 'root',
})
export class UploaderService {
  private apiUrl = 'http://localhost:3000/kraken/';

  constructor(private http: HttpClient) {}

  uploadData(data: Product[]) {
    return this.http.post(`${this.apiUrl}data`, data);
  }
}
