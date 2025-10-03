let checkProbabilityBtn = document.querySelector(".checkProbabilityBtn");
let showProbability = document.querySelector(".showProbability");
let probabilityLoadingVid = document.querySelector(".probabilityLoadingVid");
let afterSelection = document.querySelector(".afterSelection");


checkProbabilityBtn.addEventListener("click", () => {
    checkProbabilityBtn.classList.add("hidden");
    afterSelection.classList.add("hidden");

    // play video
    probabilityLoadingVid.classList.remove("hidden");

    setTimeout(()=>{
        probabilityLoadingVid.classList.add("hidden")
        showProbability.classList.remove("hidden");
    }, 1650)
    
});




