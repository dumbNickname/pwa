import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from './shared/shared.module';
import {RouterModule} from '@angular/router';
import {routes} from './shared/routes/routes';
import {BookModule} from './book/book.module';
import {HttpClientModule} from '@angular/common/http';
import {environment} from '../environments/environment';
import {ServiceWorkerModule} from '@angular/service-worker';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({appId: 'serverApp'}),
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule.forRoot(),
    RouterModule.forRoot(routes),
    // feature modules
    BookModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
