//FIREBASE########################################################

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
      ).innerText = `Welcome, ${user.displayName}`;
    })
    .catch((error) => {
      // Handle errors
      console.error("Error logging in:", error);
    });
}

// Add click event listener to the login button
document.getElementById("login").addEventListener("click", loginWithGoogle);

// #############################SEARCH###############################
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
                  <a href="#" class="view-recipe" data-recipe-id="${recipe.id}">View Recipe</a>
              `;

            // Store recipe data as a dataset attribute for the view recipe link
            const viewRecipeLink = recipeItem.querySelector(".view-recipe");
            viewRecipeLink.dataset.recipe = JSON.stringify(recipe);

            recipeListContainer.appendChild(recipeItem);
          });

          // Add click event listener to "View Recipe" links
          const viewRecipeLinks = document.querySelectorAll(".view-recipe");
          viewRecipeLinks.forEach((link) => {
            link.addEventListener("click", function (event) {
              event.preventDefault();
              const recipeData = JSON.parse(this.dataset.recipe);
              const recipeId = recipeData.id;
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

                    // Display title and checkbox
                    recipeViewContainer.innerHTML += `
                              <div class="recipe-nav">
                                  <h2>${recipeData.title}</h2>
                                  <input type="checkbox" id="bookmark">
                              </div>
                          `;

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

// ##########################MY RECIPE#############################
// Get a reference to the Firebase database
const database = firebase.database();

// Function to add a recipe
function addRecipe() {
  // Check if user is logged in
  const user = firebase.auth().currentUser;
  if (!user) {
    // If user is not logged in, display a message or prompt to log in
    console.log("Please log in to add a recipe.");
    return;
  }

  // Get elements for modal
  const modal = document.getElementById("addRecipeModal");
  const titleInput = document.getElementById("titleInput");
  const ingredientInput = document.getElementById("ingredientInput");
  const unitInput = document.getElementById("unitInput");
  const cookingStepInput = document.getElementById("cookingStepInput");

  // Show modal
  modal.style.display = "block";

  // Function to save recipe to Firebase database
  function saveRecipe() {
    const title = titleInput.value;
    const ingredient = ingredientInput.value;
    const unit = unitInput.value;
    const cookingStep = cookingStepInput.value;

    // Save recipe data to Firebase database
    const recipeRef = database.ref("recipes").push();
    recipeRef.set({
      title: title,
      ingredient: ingredient,
      unit: unit,
      cookingStep: cookingStep,
    });

    // Close modal
    modal.style.display = "none";
  }

  // Add event listener to save button
  const saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", saveRecipe);
}

// Function to display recipes in .my-recipe-list
function displayRecipes() {
  const recipeListContainer = document.querySelector(".my-recipe-list");
  recipeListContainer.innerHTML = ""; // Clear previous results

  // Retrieve recipes from Firebase database
  database
    .ref("recipes")
    .once("value")
    .then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const recipe = childSnapshot.val();
        const recipeItem = document.createElement("div");
        recipeItem.classList.add("recipe-item");
        recipeItem.innerHTML = `
          <h2>${recipe.title}</h2>
          <img src="./myrecipe.jpg" alt="my-recipe-image">
          <a href="#" class="view-recipe" data-recipe-id="${childSnapshot.key}">View Recipe</a>
        `;
        recipeListContainer.appendChild(recipeItem);
      });

      // Add event listener to "View Recipe" links
      const viewRecipeLinks = document.querySelectorAll(".view-recipe");
      viewRecipeLinks.forEach((link) => {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          const recipeId = this.getAttribute("data-recipe-id");
          // Function to display recipe details
          displayRecipeDetails(recipeId);
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching recipes:", error);
    });
}

// Function to display recipe details in .my-recipe-view
function displayRecipeDetails(recipeId) {
  const recipeViewContainer = document.querySelector(".my-recipe-view");
  recipeViewContainer.innerHTML = ""; // Clear previous content

  // Retrieve recipe details from Firebase database
  database
    .ref("recipes")
    .child(recipeId)
    .once("value")
    .then((snapshot) => {
      const recipe = snapshot.val();
      recipeViewContainer.innerHTML = `
        <h2>${recipe.title}</h2>
        <p><strong>Ingredients:</strong> ${recipe.ingredient} (${recipe.unit})</p>
        <p><strong>Cooking Steps:</strong> ${recipe.cookingStep}</p>
      `;
    })
    .catch((error) => {
      console.error("Error fetching recipe details:", error);
    });
}
