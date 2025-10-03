console.log("categories.js is working");


document.addEventListener('DOMContentLoaded', () => {


    // ===========  function to fetch and show cards dynamically when an option in manuever bar is clicked =============
    let categoryBtns = document.querySelectorAll("#category");
    let dataContainer = document.querySelector("#dataContainer");
    
    // event listener which fetches all the data based on category
    categoryBtns.forEach((btn) => {
        btn.addEventListener("click", async() => {

            // remove focus from all buttons when a btn is clicked
            categoryBtns.forEach((button) => {
                button.classList.remove("clickedBtn");
            });

            // put the category into focus
            btn.classList.add("clickedBtn");
            
            // choose the data-name attribute in the category buttons
            let categoryName = btn.dataset.name;
            let type;
            switch (categoryName) {
                case "Spaces": type = ["mall", "workspace"];
                    break;
                case "Entertainment": type = ["movieTheatre", "stadium"];
                    break;
                case "Travel": type = ["airport", "railwayStation"];
                    break;
                case "Stays": type = ["stay"];
                    break;    
                case "Care": type = ["care"];
                    break;
                case "Institutions": type = ["institution"];
                    break;
            
                default:
                    break;
            }
            console.log(type)

            await fetchData(type);
        });
    });

    // the function that fetches data
    async function fetchData(type) {
        try {
            // URLSearchParams forms a query string for the request 
            let query = new URLSearchParams();

            // the returned query is iterated and forms
            // /getData?type=malls&type=workspaces
            type.forEach(t => query.append("type", t));

            // await the content via the query sent from the backend
            // fetch() is a promise that returns the response (res) object on the URL
            const response = await fetch(`/getData?${query.toString()}`);

            // check for error
            if (!response.ok) throw new Error("Failed to fetch data");
             
            // data as json
            const data = await response.json();
            console.log(data);

            // call the function
            await updatePageContent(data);

        } catch (error) {
            console.log(error);
        }
    };
    
    // show the newly fetched data on the page 
    async function updatePageContent(data) {
        
        // clear the existing data inside the dataContainer
        dataContainer.innerHTML = " ";

        // loop for each space in the data
        data.forEach((space) => {

            // if no data is returned
            if (data.length === 0) {
                container.innerHTML = `<p class="no-results">No results found.</p>`;
                return;
            }

            // try to mimic our previous EJS structure
            let row = document.createElement("div");
            row.classList.add("row");

            // our EJS code just replace <%= %> for ${} to input value
            row.innerHTML = `
            <div class="spaceTextBg">
                    <div class="spaceText poppins-regular">
                        Type: ${space.type} <br>
                        Parking spots: ${space.totalParkingSpots} <br>
                        Description: ${space.description}
                    </div>
                </div>

                <a href="/spaces/show/${space._id}">
                    <div class="imageContainer">
                        <img src="${space.imageUrl}" class="cardImg image" alt="space image">
                    </div>
                </a>

                <li class="listOfNames">
                    <a class="poppins-regular spaceName" href="/spaces/show/${space._id}">
                        ${space.name}
                    </a>
                    <div class="spaceAddress poppins-regular">${space.address}</div>
                    <div class="spaceState poppins-regular">${space.state}</div>
                </li>
            `;
            
            dataContainer.append(row);
        });
    };

});


