// For more examples:
//   https://github.com/angular/angular/blob/master/modules/@angular/router/test/integration.spec.ts

import { waitForAsync, ComponentFixture, TestBed, tick, fakeAsync, ComponentFixtureAutoDetect } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { SpyLocation } from '@angular/common/testing';

import { Router, RouterLinkWithHref } from '@angular/router';

import { By } from '@angular/platform-browser';
import { DebugElement, Type } from '@angular/core';
import { Location } from '@angular/common';

import { AppRoutes } from './routes';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';

import { declarations } from './declarations';
import { imports } from './imports';
import { TweetFeedComponent } from './tweet-feed/tweet-feed.component';
import { TweetComponent } from './tweet/tweet.component';
import { UserService } from './user/user.service';
import { TweetService } from './tweet/tweet.service';
import { User } from './user/user';
import { UserComponent } from './user/user.component';

let comp: AppComponent;
let fixture: ComponentFixture<AppComponent>;
let page: Page;
let router: Router;
let location: SpyLocation;
let users: UserService;
let tweets: TweetService;

describe('AppComponent & RouterTestingModule', () => {
  const user1Id = '71ab267fc37caa55b9d8de7280daee18';
  const user2Id = '750891be3ef78dda51ea512d1726348e';


  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({
          imports: [
            ...imports,
            AppModule,
            RouterTestingModule.withRoutes(AppRoutes),
          ],
          declarations: [ ...declarations, MockTweetFeedComponent ],
          providers: [
             { provide: ComponentFixtureAutoDetect, useValue: true },
             { provide: UserService },
             { provide: TweetService }
           ]
        })
        .compileComponents();
  }));

  it("The App should rediect to an arbitary user's page on loading", waitForAsync(() => {
       createComponent();
       advance();  // wait for async data to arrive
       page.fixture.whenStable().then(() => {
         expectPathToBe(`/user/${user1Id}`, 'after initialNavigation()');
         expectElementOf(UserComponent);
       });
     }));

  it("The App should be able to navigate to another user's profile from thier username link", waitForAsync(() => {
    createComponent();
    advance();
    fixture.whenStable().then(() => {
      users = TestBed.inject(UserService);
      tweets = TestBed.inject(TweetService);
      const TweetFeed = TestBed.createComponent(MockTweetFeedComponent);
      TweetFeed.detectChanges();
      TweetFeed.whenStable().then(() => {
        let tweetUsers = TweetFeed.debugElement.queryAll(By.css('.feed .profile-link'));
        let link = tweetUsers[1].nativeElement;
        link.click();
        advance();
        fixture.whenStable().then(() => {
        expectPathToBe(`/user/${user2Id}`);
        expectElementOf(UserComponent);
        });
      });
    });
  }));
});

////// Helpers /////////

/**
 * Advance to the routed page
 * Wait a tick, then detect changes, and tick again
 */
function advance(): void {
  fixture.detectChanges();  // update view
}

function createComponent() {
  fixture = TestBed.createComponent(AppComponent);
  comp = fixture.componentInstance;

  const injector = fixture.debugElement.injector;
  location = injector.get(Location) as SpyLocation;
  router = injector.get(Router);
  users = injector.get(UserService);
  tweets = injector.get(TweetService);
  router.initialNavigation();
  advance();

  page = new Page();
}

class Page {
  // for debugging
  comp: AppComponent;
  router: Router;
  fixture: ComponentFixture<AppComponent>;

  constructor() {
    // for debugging
    this.comp = comp;
    this.fixture = fixture;
    this.router = router;
  }
}

function expectPathToBe(path: string, expectationFailOutput?: any) {
  expect(location.path())
  .withContext(expectationFailOutput || 'location.path()')
  .toEqual(path);
}

function expectElementOf(type: Type<any>): any {
  const el = fixture.debugElement.query(By.directive(type));
  expect(el)
    .withContext(`expected an element for ${type.name}`)
    .toBeTruthy();
  return el;
}

class MockTweetFeedComponent extends TweetFeedComponent {
  getTweets(): void {
    super.filterTweets(this.getId());
  }

  add(tweetText: string): void {
    super.add(tweetText, this.getId());
  }

  getId(): string {
    const path = location.path().split('/');
    const id: string = (Array.isArray(path) &&  path?.[2] ) ? path[2] : '71ab267fc37caa55b9d8de7280daee18';
    return id;
  }
}
