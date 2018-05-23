import {Component, OnInit} from '@angular/core';
import {SwPush} from '@angular/service-worker';
import {SubscriptionService} from '../subscription.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-sw-push-sub-btn',
  templateUrl: './sw-push-sub-btn.component.html',
  styleUrls: ['./sw-push-sub-btn.component.scss']
})
export class SwPushSubBtnComponent implements OnInit {
  readonly VAPID_PUBLIC_KEY = 'BK8kQcsdYJxxwtx7Uc3uj5Nbu0-_9cTsaqNZy3ir8h5aq4tm8EwnPuxINuTnGCl146XGY9XVd_IunCkHslfOL_E';

  swPushEnabled = true;
  alreadySubscribed = false;
  whileToggling = false;

  constructor(private swPush: SwPush, private subscription: SubscriptionService) {
    this.swPushEnabled = swPush.isEnabled && !this.iOS();
  }

  /* tslint:disable:no-console */
  ngOnInit(): void {
    if (this.swPushEnabled) {
      this.swPush.subscription.pipe(
        take(1),
      ).subscribe(pushSubscription => {
        console.debug('Checking if already subscribed: ' + pushSubscription);
        this.alreadySubscribed = pushSubscription !== null;
      });
    }
  }

  togglePushNotifications() {
    this.whileToggling = true;

    if (this.alreadySubscribed) {
      this.unsubscribe();
    } else {
      this.subscribe();
    }
  }

  private unsubscribe() {
    console.debug('Unsubscribing...');
    this.swPush.subscription.pipe(
      take(1),
    ).subscribe((pushSubscription) => {
      console.debug('Got current subscription... ', pushSubscription);
      if (pushSubscription) {
        console.debug('Calling pushSubscription.unsubscribe()...');
        pushSubscription.unsubscribe()
          .then(_ => {
            console.debug('pushSubscription.unsubscribe() successful; calling the server...');
            this.subscription.doUnsubscribe(pushSubscription.endpoint).subscribe(() => {
              this.whileToggling = false;
              this.alreadySubscribed = false;
              console.debug('Unsubscribing on the server successful');
            }, error => {
              this.whileToggling = false;
              console.debug('Unsubscribing on the server failed', error);
            });
          })
          .catch(err => {
            this.whileToggling = false;
            console.error('pushSubscription.unsubscribe() failed', err);
          });
      } else {
        this.whileToggling = false;
        this.alreadySubscribed = false;
      }
    }, error => {
      this.whileToggling = false;
      console.debug('Error while getting current subscription... ' + error);
    });
  }

  private subscribe() {
    console.debug('Calling swPush.requestSubscription()');
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
      .then(sub => {
        console.debug('swPush.requestSubscription() successful; calling the server', sub);
        this.subscription.doSubscribe(sub).subscribe(_ => {
          this.whileToggling = false;
          this.alreadySubscribed = true;
          console.debug('Subscribing on the server successful');
        }, error => {
          this.whileToggling = false;
          console.debug('Subscribing on the server failed' + error);
        });
      })
      .catch(err => {
        this.whileToggling = false;
        console.debug('swPush.requestSubscription() failed', err);
      });
  }

  private iOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window['MSStream'];
  }
}
