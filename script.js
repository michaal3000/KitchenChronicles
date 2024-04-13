//FIREBASE########################################################

//  Your Firebase configuration

// Initialize Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIR5A3cZFW_XnoTT02azJI-GoM3j6cyvE",
  authDomain: "kitchen-chronicles-2b2d6.firebaseapp.com",
  databaseURL:
    "https://kitchen-chronicles-2b2d6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kitchen-chronicles-2b2d6",
  storageBucket: "kitchen-chronicles-2b2d6.appspot.com",
  messagingSenderId: "729708529241",
  appId: "1:729708529241:web:92e6d38f7280b336bd9348",
  measurementId: "G-SHS0K08BLV",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Function to log in with Google
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      // User is signed in
      const user = result.user;
      document.getElementById(
        "user-info"
      ).innerText = `Logged in as: ${user.displayName}`;
    })
    .catch((error) => {
      // Handle errors
      console.error("Error logging in:", error);
    });
}

// Add click event listener to the login button
document.getElementById("login").addEventListener("click", loginWithGoogle);

// SEARCH #######################################################
document
  .getElementById("searchbar")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    // Get the search query from the input field
    const searchQuery = document.getElementById("searchInput").value;

    // Make the API call
    fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${searchQuery}&apiKey=902bf69a703c4991b2688c80e9cc32aa`
    )
      .then((response) => response.json())
      .then((data) => {
        // Display results in .recipe-list container
        const recipeListContainer = document.querySelector(".recipe-list");
        recipeListContainer.innerHTML = ""; // Clear previous results

        if (data.results.length > 0) {
          data.results.forEach((recipe) => {
            const recipeItem = document.createElement("div");
            recipeItem.classList.add("recipe-item");
            recipeItem.innerHTML = `
                  <h2>${recipe.title}</h2>
                  <img src="${recipe.image}" alt="${recipe.title}">
                  <p>Ready in: ${recipe.readyInMinutes} minutes</p>
                  <p>Servings: ${recipe.servings}</p>
                  <p>${recipe.summary}</p>
                  <a href="#" class="view-recipe" data-recipe-id="${recipe.id}">View Recipe</a>
              `;
            recipeListContainer.appendChild(recipeItem);
          });

          // Add click event listener to "View Recipe" links
          const viewRecipeLinks = document.querySelectorAll(".view-recipe");
          viewRecipeLinks.forEach((link) => {
            link.addEventListener("click", function (event) {
              event.preventDefault();
              const recipeId = this.getAttribute("data-recipe-id");
              fetch(
                `https://api.spoonacular.com/recipes/${recipeId}/analyzedInstructions?apiKey=902bf69a703c4991b2688c80e9cc32aa`
              )
                .then((response) => response.json())
                .then((data) => {
                  // Display recipe instructions and ingredients in .recipe-view container
                  const recipeViewContainer =
                    document.querySelector(".recipe-view");
                  recipeViewContainer.innerHTML = ""; // Clear previous content

                  if (data.length > 0) {
                    let allIngredients = [];
                    data[0].steps.forEach((step) => {
                      // Extract ingredients from each step and add to allIngredients array
                      if (step.ingredients) {
                        step.ingredients.forEach((ingredient) => {
                          allIngredients.push(ingredient.name);
                        });
                      }
                    });

                    // Remove duplicate ingredients
                    const uniqueIngredients = [...new Set(allIngredients)];

                    // Display unique ingredients
                    recipeViewContainer.innerHTML += `<h3>Ingredients:</h3>`;
                    uniqueIngredients.forEach((ingredient) => {
                      recipeViewContainer.innerHTML += `<p>${ingredient}</p>`;
                    });

                    // Display recipe instructions
                    recipeViewContainer.innerHTML += `<h3>Instructions:</h3>`;
                    data[0].steps.forEach((step) => {
                      recipeViewContainer.innerHTML += `<p>${step.step}</p>`;
                    });
                  } else {
                    recipeViewContainer.innerHTML =
                      "<p>No instructions found.</p>";
                  }
                })
                .catch((error) => {
                  console.error("Error fetching recipe instructions:", error);
                });
            });
          });
        } else {
          recipeListContainer.innerHTML = "<p>No results found.</p>";
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  });
