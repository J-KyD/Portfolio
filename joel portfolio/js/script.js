$(document).ready(function(){
    $(window).scroll(function(){
        // sticky navbar on scroll script
        if(this.scrollY > 20){
            $('.navbar').addClass("sticky");
        }else{
            $('.navbar').removeClass("sticky");
        }
        
        // scroll-up button show/hide script
        if(this.scrollY > 500){
            $('.scroll-up-btn').addClass("show");
        }else{
            $('.scroll-up-btn').removeClass("show");
        }
    });

    // slide-up script
    $('.scroll-up-btn').click(function(){
        $('html').animate({scrollTop: 0});
        // removing smooth scroll on slide-up button click
        $('html').css("scrollBehavior", "auto");
    });

    $('.navbar .menu li a').click(function(){
        // applying again smooth scroll on menu items click
        $('html').css("scrollBehavior", "smooth");
    });

    // toggle menu/navbar script
    $('.menu-btn').click(function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });

    // typing text animation script
    var typed = new Typed(".typing", {
        strings: ["Front-End Web Developer", "Back-End Web Developer", "Full stack Web Developer", "Animator"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true
        
    });

    var typed = new Typed(".typing-2", {
        strings: ["Front-End Web Developer", "Back-End Web Developer", "Full stack Web Developer", "Animator"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true
    });

    // owl carousel script
    $('.carousel').owlCarousel({
        margin: 20,
        loop: true,
        autoplay: true,
        autoplayTimeOut: 2000,
        autoplayHoverPause: true,
        responsive: {
            0:{
                items: 1,
                nav: false
            },
            600:{
                items: 2,
                nav: false
            },
            1000:{
                items: 3,
                nav: false
            }
        }
    });
});




/**
   * form
   */
 const form = document.getElementById('form');
 const username = document.getElementById('name');
 const email = document.getElementById('email');
 const subject = document.getElementById('subject');
 const message = document.getElementById('message');


 
 form.addEventListener('submit', e => {
     e.preventDefault();
 
     validateInputs();
 });
 
 const setError = (element, message) => {
     const inputControl = element.parentElement;
     const errorDisplay = inputControl.querySelector('.error');
 
     errorDisplay.innerText = message;
     inputControl.classList.add('error');
     inputControl.classList.remove('success')
 }
 
 const setSuccess = element => {
     const inputControl = element.parentElement;
     const errorDisplay = inputControl.querySelector('.error');
 
     errorDisplay.innerText = '';
     inputControl.classList.add('success');
     inputControl.classList.remove('error');
 };
 
 const isValidEmail = email => {
     const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
     return re.test(String(email).toLowerCase());
 }
 
 const validateInputs = () => {
     const usernameValue = username.value.trim();
     const emailValue = email.value.trim();
     const subjectValue = subject.value.trim();
     const messageValue = message.value.trim();

     if(usernameValue.length >0 && emailValue.length >0 && subjectValue.length > 0 && messageValue.length >0 && isValidEmail(emailValue)){

      const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-btn]')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button=>{
  button.addEventListener('click',()=>{
      const modal = document.querySelector(button.dataset.modalTarget)
      openModal(modal)
  })
})

overlay.addEventListener('click', () =>{
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal =>{
  closeModal(modal)
  })
})

closeModalButtons.forEach(button=>{
  button.addEventListener('click',()=>{
      const modal = button.closest('.modal')
      closeModal(modal)
  })
})

function openModal(modal){
  if (modal == null) return
      modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal){
  if (modal == null) return
      modal.classList.remove('active')
      overlay.classList.remove('active')


}
setSuccess(username);
setSuccess(email);
setSuccess(subject);
setSuccess(message);


     }

    else{
     if(usernameValue === '') {
         setError(username, 'Name is required');
     } else {
         setSuccess(username);
     }
 
     if(emailValue === '') {
         setError(email, 'Email is required');
     } else if (!isValidEmail(emailValue)) {
         setError(email, 'Provide a valid email address');
     } else {
         setSuccess(email);
     }

     if(subjectValue === '') {
        setError(subject, 'Subject is required');
    } else {
        setSuccess(subject);
    }
    if(messageValue === '') {
        setError(message, 'message is required');
    } else {
        setSuccess(message);
    }

  }
 
 };
 