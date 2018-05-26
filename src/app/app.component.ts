import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

config:any={
	delay:3000
}
slides=[
{src:'/assets/slider0.jpg',caption:{
	header:'Slider 0',
	subheader:'Subheading 0',
	callToActionBtn:{
		text:'Shop',
		link:'/shop'
}}},
{src:'/assets/slider1.jpg',caption:{
	header:'Slider 1',
	subheader:'Subheading 1',
	callToActionBtn:{
		text:'Shop',
		link:'/shop'
}
}},
{src:'/assets/slider2.jpg',caption:{
	header:'Slider 2',
	subheader:'Subheading 2',
	callToActionBtn:{
		text:'Shop',
		link:'/shop'
}
}},{src:'/assets/slider3.jpg',caption:{
	header:'Slider 4',
	subheader:'Subheading 4',
	callToActionBtn:{
		text:'Shop',
		link:'/shop'
}
}}]
 
}
