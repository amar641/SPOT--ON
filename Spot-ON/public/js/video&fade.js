// ===================== Track scroll of video ================
let lastScrollY = 0;
function updateVideoSize(){

    // as we scroll scrollY increases
    let scrollPosition = window.scrollY;
    let heroVideo = document.querySelector(".heroVideo");

    // trigger only when scrolled past 100px
    // Math.abs is for absolute value
    if(scrollPosition  > 160){
        let adjustedScroll = scrollPosition - 160;
        // using Math.min we subtract the width depending on scrollY
        // the math min function selects the smallest value 
        // eg: for 50px it returns 5 so (5,10), after 100px only 10 gets selected as it is the smallest one
        let newWidth = 100 - Math.min(adjustedScroll / 50, 12);
        let newBorderRadius = Math.min(adjustedScroll / 10, 30);

        heroVideo.style.width = newWidth + "%";
        heroVideo.style.borderRadius = newBorderRadius + "px";

        // we store the last scroll position
        lastScrollY = scrollPosition;
    } else{

        // an if statement that ensures that
        if(heroVideo){
            // if we are on any other page than the home where the video doesn't exist then we won't get null element error

            heroVideo.style.width = "100%";
        } 
    } 
    
    // better than window.addEventListener("scroll"); 
    // it runs only when the next frame is required improving performance 
    // it calls the function on loop for each change
    requestAnimationFrame(updateVideoSize);
}
// call the function
updateVideoSize();


// =============================================================


document.addEventListener('DOMContentLoaded', () => {
    
    // =============== Fade In animation of elements =============
    let fadeInElements = document.querySelectorAll(".fadeIn");
    
    // function to perform the task
    function fadeInOnScroll(){
        fadeInElements.forEach((el) => {
    
            // a special function that detects position of an element wrt viewport
            let rect = el.getBoundingClientRect();
             
            // .top tells distance from top of element to top of viewport
            if (rect.top < window.innerHeight * 0.85) { 
                // trigger only when 85% visible
                el.classList.add("show");
            }
        })
    }
    
    // when we scroll on window the fadeIn function is triggered as an event 
    window.addEventListener("scroll", fadeInOnScroll);
    
    // to avoid errors the landing page is checked once for the event by simply calling the function
    fadeInOnScroll();
    
    // ===================================================

});
