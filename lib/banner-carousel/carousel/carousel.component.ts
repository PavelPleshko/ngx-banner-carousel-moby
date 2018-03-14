import { Component, OnInit,OnDestroy,
  AfterViewInit,Input,Output,EventEmitter,
  ViewChild,ElementRef,Renderer,Renderer2,HostListener} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {tap,map,mergeMap,startWith,mapTo,
  merge,switchMap,takeUntil,take,combineLatest} from 'rxjs/operators';
import { timer } from 'rxjs/observable/timer';
import { of } from 'rxjs/observable/of';
import {mergeObject} from '../helpers/helpers';



export interface ISlide{
	src:string,
  caption:any
}

@Component({
  selector: 'app-carousel',
  template: `<div class="banner-carousel-arrows">
    <a class="control carousel-ctrl-btn prev" (click)="moveToPrev()"><i class="material-icons">keyboard_arrow_left</i></a>
<a class="control carousel-ctrl-btn next" (click)="moveToNext()"><i class="material-icons">keyboard_arrow_right</i></a>
</div>
<div class="banner-carousel-inner" #carousel_inner>
<div class="banner-carousel-items">

      <div *ngFor="let slide of slides;let i=index;" class="banner-carousel-item-img" id="slide-{{i}}" [style.background-image]='"url("+slide.src+")"'><div class="banner-carousel-slide-caption" *ngIf="config.caption.enabled"><h3 class="slide-caption-header">{{slide.caption.header}}</h3>
      <div class="slide-caption-subheader">{{slide.caption.subheader}}</div>
      <a *ngIf="slide.caption.callToActionBtn.text.length>0" class="slide-caption-call-to-action-btn" [routerLink]="slide.caption.callToActionBtn.link">{{slide.caption.callToActionBtn.text}}</a>
      </div></div>
      
    
</div>

</div>
<div class="banner-carousel-points" #points *ngIf="config.points.visible">
<div *ngFor="let point of points$ | async;let i=index;" id="point-{{i}}" class="point" [class.active]="point"></div>
  </div>
`,
  styles: [` :host {
      display: block;
      position: relative;
      width: 900px;
      height: 500px;
      overflow: hidden;
    }
.banner-carousel-inner{
      position: relative;
   
   
    transition: .5s ease-in-out;
}
.banner-carousel-items{
  width:100%;
  max-height:500px;
  
  position: relative;
  white-space: nowrap;
}

.banner-carousel-item-img{
  width: 100%;
  height:500px;
  white-space: initial;
  background-position: center center;
  background-size: cover;
  display: inline-block;
  transition: .5s ease-in-out;
  position: relative;

}


.banner-carousel-arrows{
  position: absolute;
  z-index: 222;
  top:50%;
  transform: translateY(-50%);
  width: 100%;
}

.banner-carousel-arrows a{
  position: absolute;
}
.banner-carousel-arrows .prev{
  left:5%;
}

.banner-carousel-arrows .next{
  right:5%;
}

.banner-carousel-arrows .carousel-ctrl-btn{
  background-color: rgba(26, 35, 126,.7);
  border-radius: 50%;
  text-align: center;
  padding: 5px;
  border:none;
  color: #ffffff;
  cursor: pointer;
}
.banner-carousel-arrows .carousel-ctrl-btn:hover{
  background-color: rgba(26, 35, 126,1);
}
.banner-carousel-arrows .carousel-ctrl-btn i{
  vertical-align: middle;
  font-size: 200%;
}

.banner-carousel-points{
display: flex;
flex-direction: row;
position: absolute;
bottom: 10%;
left: 50%;
transform: translateX(-50%);
}

.banner-carousel-points .point{
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(26, 35, 126,.7);
  border:1px solid #dedede; 
  margin: 0 7px;
  cursor: pointer;
  transition:all .5s ease-in-out;
}

.banner-carousel-points .point.active{

  background-color: rgba(26, 35, 126,1);
  
  transform: scale3d(1.3,1.3,1.3);
  transform: scale(1.3,1.3);
  border:3px solid #dedede; 
}

.banner-carousel-points .point:hover{

  background-color: rgba(26, 35, 126,1);
  border:1px solid #fff; 
}

.banner-carousel-slide-caption{
  color:#fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  text-align: center;
}

.banner-carousel-slide-caption .slide-caption-header{
  font-size: 3em;
  margin-bottom: .1em;
}

.banner-carousel-slide-caption .slide-caption-subheader{
font-size: 1.5em;
}

.banner-carousel-slide-caption .slide-caption-call-to-action-btn{
text-transform: uppercase;
font-weight: 900;
padding:.5em 2em;
margin-top: 1em;
background: rgba(53,73,171,1);
border:1px solid #3949ab;
color: #fff;
border-radius: 3px;
cursor: pointer;
display: block;
transition: .4s ease-in-out;
letter-spacing: 1px;
text-decoration: none;
}

.banner-carousel-slide-caption .slide-caption-call-to-action-btn:hover{
color:#fff;
background: #3f51b5;
}


.fadeIn{
  animation: fadein .4s ease-in-out forwards;
}

.fadeOut{
  animation: fadeout .4s ease-in-out forwards;
}



@keyframes fadein {
from { opacity: 0; }
to { opacity: 1; }
}

@keyframes fadeout {
from { opacity: 1; }
to { opacity: 0; }
}`]
})
export class CarouselComponent implements OnInit,AfterViewInit,OnDestroy{
@Input() config;
@Input() slides:ISlide[];
@ViewChild('carousel_inner') carouselInner:ElementRef;
@ViewChild('points') pointsContainer:ElementRef;
@Output() slideChanged = new EventEmitter();

defaultConfig:any={
	autoplay:true,
	transitionTime:1000,
	delay:6000,
	firstSlideIndex:0,
	backwards:false,
	repeat:true,
  animationName:'slide',
  points:{
    visible:true,
    pointClass:'custom-point'
  },
  controls:{
    visible:true,
    controlClass:'custom-control'
  },
  caption:{
    enabled:true
  }
};

currentPos;
pointsArr:Observable<Array<boolean>>;
previousSlide:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
nextSlide:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
currentSlide:BehaviorSubject<any>;
currentIndex:BehaviorSubject<{value:number,forward:boolean}>;
moveTo:Subject<number> = new Subject<number>();
changeSlideTo:Subject<number> = new Subject<number>();
slide$:Observable<any>;
interval:Observable<any>;
stopSlider$:Subject<boolean>;
actions$;
points$;
sliderStopped:boolean = false;
subscriptions:any = [];
listeners:any = [];

  constructor(private renderer:Renderer,private renderer2:Renderer2,private el:ElementRef) { }
//when we hover over we would like slider to stop its endless rotation
@HostListener('mouseenter',['$event'])
stopSlider(e){
  e.stopPropagation();
  if(!this.sliderStopped && this.config.autoplay){
    this.stopSlider$.next(true);
    this.sliderStopped = true;
  }
    
}
@HostListener('mouseleave',['$event'])
startSlider(e){
  e.stopPropagation();
  if(this.sliderStopped){
    this.sliderStopped = false;
   
         timer(1000).pipe(take(1)).subscribe(()=>{
       this.config.backwards ? this.moveToPrev() : this.moveToNext();
     });
    
  
  }
}

  ngOnInit() {
    //first we need to merge configuration objects
    if(this.config){
      this.config = mergeObject(this.defaultConfig,this.config,{});
    }else{
      this.config = this.defaultConfig;
    }
    //init observables and subjects
    this.initCarousel();
    this.startCarousel();
  }

  ngAfterViewInit(){
    this.applyCustomStyles();
  		let currentSlide = this.currentSlide.asObservable().pipe(map(current=>{
  		

  		 this.applyAnimation(current.value,current.forward);
  		return current;
  	})).subscribe();
      this.renderer.listen(this.pointsContainer.nativeElement,'click',this.onPointClick.bind(this));
  		this.subscriptions.push(currentSlide);
  }

changeSlideIndex(val,forward=true,direct=false){

if(!direct){
   let current:any = this.currentIndex.getValue().value;
      val =current + val;
      let len = this.slides.length;
      if(val<0){
        val = len-1;
      }else if(val>len-1){
        val = 0;
      }
    }
   
      this.currentIndex.next({value:val,forward:forward});	
}

applyAnimation(current,isForward){
   switch (this.config.animationName) {
     case "fadeIn":
      this.fadeInAnimation(current,isForward);
       break;
     case "slide":
       this.nativeSlideAnimation(current,isForward);
       break;
     default:
       this.nativeSlideAnimation(current,isForward);
       break;
   }
}

nativeSlideAnimation(current,isForward){
  if(isForward){
      this.currentPos = 100 * current;
      this.renderer.setElementStyle(this.carouselInner.nativeElement,'transform',`translate3d(-${this.currentPos}%,0,0)`);     
   }else{ 
     let newPos=current*100;
        if(newPos == this.currentPos){

          this.currentPos=newPos-100<0 ? 0 : newPos-100;
        }else{
          this.currentPos = newPos;
        }
this.renderer.setElementStyle(this.carouselInner.nativeElement,'transform',`translate3d(-${this.currentPos}%,0,0)`);
}
}

fadeInAnimation(current,isForward){
let {prev,next} = this.getNeighbours(current,this.slides);
let slides = this.el.nativeElement.querySelectorAll('.banner-carousel-item-img');
    prev = this.el.nativeElement.querySelector(`#slide-${prev}`);
     current = this.el.nativeElement.querySelector(`#slide-${current}`);
     [].forEach.call(slides,(slide)=>{
      this.renderer.setElementStyle(slide,'opacity','0');
       this.renderer.setElementStyle(slide,'position','absolute');
       this.renderer.setElementClass(slide,'fadeIn',false);
     })
     this.renderer.setElementClass(current,'fadeIn',true);
}

onPointClick(e){
  let el = e.target;
  if(/^point\b/.test(el.className)){
    console.log(el);
    let elementIndex = el.id.split('-')[1];
    elementIndex = parseInt(elementIndex,10)
    this.changeSlideIndex(elementIndex,true,true);
  }
}

getNeighbours(current,slides){
	let len = slides.length;
	let prev,next;
	if(current+1 > len-1){
		prev = current-1;
		next = 0;
	}else if(current-1 < 0){
		prev = len-1;
		next = current +1;
	}else{
		prev=current-1;
		next=current+1;
	}
	return {prev:prev,next:next};
}

moveToNext(){
this.nextSlide.next(true);
}

moveToPrev(){
	this.previousSlide.next(true);
}

autoplay(value){
  if(this.config.autoplay){
    value = this.config.backwards ? -1 : 1;
   let timerObs =  timer(this.config.delay,this.config.delay).pipe(takeUntil(this.stopSlider$),mapTo(value),tap(val=>this.changeSlideIndex(val)));
   return timerObs;
 }else{
   return of(value);
 }
}

reachedEnd(){
  let lastIndex = this.slides.length-1;
  return lastIndex == this.currentIndex.getValue().value;
}

//init process
initCarousel():void{
  this.initPoints();
  this.initActions();
  this.initCurrentSlide();

}


initPoints(){
if(this.config.points.visible){
   this.pointsArr= of(new Array(this.slides.length).fill(false));

}
}
initActions(){
//arrow actions
    if(this.config.controls.visible){
      const nextSlide = this.nextSlide.pipe(mapTo(1));
      const prevSlide = this.previousSlide.pipe(mapTo(-1));
      this.actions$ = nextSlide.pipe(merge(prevSlide));
    }
}

initCurrentSlide(){
    this.currentSlide = new BehaviorSubject<any>(this.config.firstSlideIndex);
    this.currentIndex = new BehaviorSubject<{value:number,forward:boolean}>({value:this.config.firstSlideIndex,forward:true});
    const currentIndex = this.currentIndex.subscribe(this.currentSlide);
    this.subscriptions.push(currentIndex);
}

startCarousel(){
  this.stopSlider$ = new Subject();
   const moveSlides = this.actions$.pipe(switchMap((val:any)=>{
      let forward;
      forward = val>0 ? true : false;
console.log(val);
      this.changeSlideIndex(val,forward);

      return this.autoplay(val);
    })).subscribe(val=>{
         if(!this.config.repeat && this.reachedEnd()){
       this.stopSlider$.next(true);
     }
   });

       this.points$=this.pointsArr.pipe(combineLatest(this.currentIndex,(points,currIndex)=>{
      let val =  currIndex.value;
      points = points.map(point=>false);
      points[val]=true;
      return points;
    }),mergeMap(points=>of(points)));
    this.subscriptions.push(moveSlides);
}

applyCustomStyles(){
  let points = this.el.nativeElement.querySelectorAll('.point');
  let controls = this.el.nativeElement.querySelectorAll('.control');
  [].forEach.call(points,(point)=>{
    this.renderer.setElementClass(point,this.config.points.pointClass,true);
  });
   [].forEach.call(controls,(control)=>{
    this.renderer.setElementClass(control,this.config.controls.controlClass,true);
  })
}


ngOnDestroy(){
  this.subscriptions.forEach((sub)=>{
    sub.unsubscribe();
  })
}

}
