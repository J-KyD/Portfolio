const carouselSlide = document.querySelector('carousel-slide');
const carouselImages = document.querySelectorAll('.carousel-slide img');

//button

const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');

//counter

let counter = 1;
const size = carouselImages[0].clientWidth;

carouselSlide.style.transform = 'translateX(' + ( -size * counter) + 'px)';




// button Listener

nextBtn.addEventListener('click',()=>{
	carouselSlide.style.transition = "transform 0.4 ease-in-out";
	counter++;
carouselSlide.style.transform = 'translateX(' + ( -size * counter) + 'px)';

});

