import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {RouterModule,Routes} from '@angular/router';

import { AppComponent } from './app.component';
import {BannerCarouselModule} from './banner-carousel/banner-carousel.module';


export const routes:Routes=[
{path:'',pathMatch:'full',redirectTo:''} //just to enable routerLink attribute on anchor elements
];

@NgModule({
  declarations: [
    AppComponent,
   
   
  ],
  imports: [
    BrowserModule,BannerCarouselModule,RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
