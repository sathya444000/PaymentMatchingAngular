import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import {PaymentMatching} from './PaymentMatching'
@Injectable({
  providedIn: 'root' 
})
export class PaymentService {
     apiUrl = 'https://localhost:7026/api/' 

  constructor(private http: HttpClient) { }

  submitData(data :PaymentMatching[]): Observable<PaymentMatching[]> {
    return this.http.post<any>(
      `${this.apiUrl}add`,
      data
    )
  }

  addPayment(formData:FormData
): Observable<any>{
    return this.http.post<any>(
      `${this.apiUrl}upload`,
      formData
    )
  }
  
   getDetails(
): Observable<any>{
    return this.http.get(
      `${this.apiUrl}`,
      
    )
  }
}
