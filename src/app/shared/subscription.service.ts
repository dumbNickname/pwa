import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operators';

@Injectable()
export class SubscriptionService {
  private readonly URI = 'api/subscription';

  constructor(private http: HttpClient) {
  }

  doSubscribe(subscription: any): Observable<void> {
    return this.http.post(`${this.URI}`, subscription, {responseType: 'text'})
      .pipe(map(_ => null));
  }

  doUnsubscribe(endpoint: string): Observable<void> {
    return this.http.delete(`${this.URI}/${encodeURIComponent(endpoint)}`, {responseType: 'text'})
      .pipe(map(_ => null));
  }
}
