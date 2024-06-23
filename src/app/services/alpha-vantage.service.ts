import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {forkJoin, map, Observable} from 'rxjs';

@Injectable()
export class AlphaVantageService {
  private apiKey = '2G51AEASNIUF9I1K';
  private baseUrl = 'https://www.alphavantage.co/query';

  constructor(private http: HttpClient) { }

  getTimeSeries(symbol: string): Observable<any> {
    const url = `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}`;
    // const url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=demo'
    return this.http.get(url).pipe(
      map(response => (response as any)['Time Series (Daily)'])
    );
  }

  getMultipleTimeSeries(symbols: string[]): Observable<any[]> {
    const requests = symbols.map(symbol => this.getTimeSeries(symbol));
    return forkJoin(requests);
  }
}
