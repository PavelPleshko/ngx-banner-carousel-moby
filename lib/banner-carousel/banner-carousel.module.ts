import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {RouterModule,Routes} from '@angular/router';

import { CarouselComponent } from './carousel/carousel.component';

export const routes:Routes=[
{path:'',pathMatch:'full',redirectTo:''} //just to enable routerLink attribute on anchor elements
];


@NgModule({
  declarations: [
    CarouselComponent,  
  ],
  imports: [
    CommonModule,RouterModule.forRoot(routes)
  ],
  providers: [],
  exports:[CarouselComponent]
})
export class BannerCarouselModule { }
