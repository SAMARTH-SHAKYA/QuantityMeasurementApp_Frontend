import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

export const UNIT_DATA: Record<string, string[]> = {
    length: ['Feet', 'Inch', 'Yard', 'Centimeter'],
    weight: ['Kilogram', 'Gram', 'Pound'],
    temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
    volume: ['Litre', 'Millilitre', 'Gallon'],
    angle: ['Degree', 'Radian'],
    area: ['SqFeet', 'SqInch', 'SqCentimeter'],
    energy: ['Joule', 'Calorie', 'Kilocalorie'],
    power: ['Watt', 'Kilowatt', 'Horsepower'],
    pressure: ['Pascal', 'Bar', 'Psi'],
    speed: ['Kmph', 'Mph', 'Mps'],
    time: ['Second', 'Minute', 'Hour']
};

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private apiUrl = `${environment.apiUrl}/measurement`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  convert(body: any) {
    return this.http.post(`${this.apiUrl}/convert`, body, { headers: this.getHeaders() });
  }

  compare(body: any) {
    return this.http.post(`${this.apiUrl}/compare`, body, { headers: this.getHeaders() });
  }

  arithmetic(operation: string, body: any) {
    return this.http.post(`${this.apiUrl}/${operation}`, body, { headers: this.getHeaders() });
  }
}
