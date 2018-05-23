import {Directive, Inject, OnInit, PLATFORM_ID, TemplateRef, ViewContainerRef} from '@angular/core';
import {isPlatformServer} from '@angular/common';

@Directive({
  selector: '[appIfInBrowser]'
})
export class IfInBrowserDirective implements OnInit {
  constructor(private viewContainer: ViewContainerRef,
              private templateRef: TemplateRef<any>,
              @Inject(PLATFORM_ID) private platformId) {
  }

  ngOnInit(): void {
    if (isPlatformServer(this.platformId)) {
      this.viewContainer.clear();
    } else {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
