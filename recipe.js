const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" +id);

    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}

async function getMealsBySearch(term) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);
    
    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

function addMeal(mealData, random = false) {
    console.log(mealData);
    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
        <div class="meal-header">
            ${
                random 
                    ? `
            <span class="random">Random Recipe</span>` 
                    : ''
            }  
            <img 
                src="${mealData.strMealThumb}" 
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i></fa-heart>
            </button>
        </div>
    `;
    const btn = meal.querySelector(".meal-body .fav-btn");
    btn.addEventListener("click", () => {
        if(btn.classList.contains("active")) {
            removeMealLs(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            addMealLs(mealData.idMeal);
            btn.classList.add("active");
        }
        
        fetchFavMeals();
    });

    meal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

function addMealLs(mealId) {

    favoriteContainer.innerHTML = "";
    const mealIds = getMealsLs();

    localStorage.setItem("mealIds", JSON.stringify
    ([...mealIds, mealId]));
}

function removeMealLs(mealId) {
    const mealIds = getMealsLs();

    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

function getMealsLs() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    favoriteContainer.innerHTML = "";

    const mealIds = getMealsLs();

    for(let i=0; i<mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        
        addMealFav(meal);
    }
}

function addMealFav(mealData) {
    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
        <img 
            src="${mealData.strMealThumb}" 
            alt="${mealData.strMeal}"
        /><span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector('.clear');
    btn.addEventListener("click", () => {
        removeMealLs(mealData.idMeal);

        fetchFavMeals();
    });

    favMeal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    favoriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {

    mealInfoEl.innerHTML = '';

    const mealEl = document.createElement("div");

    const ingredients = [];

    for(let i=1; i<=20; i++) {
        if(mealData['strIngredient' + i]) {
            ingredients.push(`${mealData
            ['strIngredient' + i]} - ${mealData
            ['strMeasure' + i]}`)
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMealThumb}">
        <p>${mealData.strInstructions}</p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
                    <li>${ing}</li>`).join("")}
        </ul>
        `;

    mealInfoEl.appendChild(mealEl);

    mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
    mealsEl.innerHTML = "";
    const search = searchTerm.value;

    const meals = await getMealsBySearch(search);
    if(meals){
        meals.forEach((meal) => {
            addMeal(meal);
        });
    }
});

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});


/*<div class="meal">
                <div class="meal-header">
                    <span class="random">
                        Random Recipe
                    </span>
                    <img src="https://www.themealdb.com/images/media/meals/xxpqsy1511452222.jpg" alt="">
                </div>
                <div class="meal-body">
                    <h4>Veggie Veggies</h4>
                    <button class="fav-btn"><i class="fas fa-heart"></i></fa-heart></button>
                </div>
            </div>
            <li><img src="https://www.themealdb.com/images/ingredients/Lime.png" alt=""><span>Lime</span></li>
                <li><img src="https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg/preview" alt=""><span>Carbonare</span></li>
                <li><img src="https://www.themealdb.com/images/media/meals/rvxxuy1468312893.jpg" alt=""><span>Lasagna</span></li>
                <li><img src="https://www.themealdb.com/images/media/meals/xxpqsy1511452222.jpg" alt=""><span>Veggiesaup</span></li>
                
                <ul>
            <li>ing 1 / measure</li>
            <li>ing 2 / measure</li>
            <li>ing 3 / measure</li>
        </ul>*/

