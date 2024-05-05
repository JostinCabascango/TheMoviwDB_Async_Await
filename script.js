// Credenciales de la API
const keys = {
    api_key: '835d449c80332451570f34fda87c0b77',
    session_id: 'ec6a39f659a98ecd90c17477c1c68689cbbd0131',
    account_id: '21215375'
}

// Elementos del DOM
const moviesResult = document.getElementById("moviesResult");
const searchInput = document.getElementById("search");
const searchBarIcon = document.querySelector(".searchBar i");
const showFavsButton = document.getElementById("showFavs");
const showWatchButton = document.getElementById("showWatch");

// Configuración de la búsqueda
let total_pages = 0;
let current_page = 1;
let query = '';

// Configuración del idioma
const language = 'es-ES';

// Función para marcar/desmarcar una película como favorita
async function setFav(id, favBool) {
    const url = `https://api.themoviedb.org/3/account/${keys.account_id}/favorite?api_key=${keys.api_key}&session_id=${keys.session_id}`;
    const body = {
        media_type: 'movie',
        media_id: id,
        favorite: favBool
    };

    try {
        await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });

        console.log(`Fav set to ${favBool}`);
        await showFavs();
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

// Función para mostrar las películas favoritas
async function showFavs() {
    const url = `https://api.themoviedb.org/3/account/${keys.account_id}/favorite/movies?api_key=${keys.api_key}&session_id=${keys.session_id}&language=${language}&sort_by=created_at.asc&page=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        moviesResult.innerHTML = "";
        data.results.forEach(movie => printMovie(movie, true, false));
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

// Función para buscar películas
async function searchMovies(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${keys.api_key}&language=${language}&query=${query}&page=1&include_adult=false`;

    try {
        this.query = query;
        clearInput();
        removeActive();

        const response = await fetch(url);
        const data = await response.json();

        total_pages = data.total_pages;
        for (const movie of data.results) {
            const url = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${keys.api_key}&language=${language}`;
            const response = await fetch(url);
            const data = await response.json();

            printMovie(data, false, false);
        }
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

// Funcion para mostrar las peliculas de la watchlist
async function showWatchlist() {
    const url = `https://api.themoviedb.org/3/account/${keys.account_id}/watchlist/movies?api_key=${keys.api_key}&session_id=${keys.session_id}&language=${language}&sort_by=created_at.asc&page=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        moviesResult.innerHTML = "";
        data.results.forEach(movie => printMovie(movie, false, true));

    } catch (error) {
        console.error(`Error: ${error}`);
    }

}

// Función para imprimir una película
function printMovie(movie, fav, watch) {
    const favIcon = fav ? 'iconActive' : 'iconNoActive';
    const watchIcon = watch ? 'iconActive' : 'iconNoActive';

    moviesResult.innerHTML += `
        <div class="movie">
            <img src="https://image.tmdb.org/t/p/original${movie.poster_path}" alt="img">
            <h3>${movie.original_title}</h3>
            <div class="buttons">
                <a id="fav" onClick="setFav(${movie.id}, ${!fav})"><i class="fa-solid fa-heart ${favIcon}"></i></a>
                <a id="watch" onClick="setWatch(${movie.id}, ${!watch})"><i class="fa-solid fa-eye ${watchIcon}"></i></a>
            </div>
        </div>`;
}

// Función para limpiar el input
function clearInput() {
    searchInput.value = "";
}

// Función para eliminar el atributo active del menú
function removeActive() {
    document.querySelectorAll(".menu li a").forEach(el => el.classList.remove("active"));
}

// Evento de scroll para el scroll infinito
window.addEventListener('scroll', async () => {
    if (document.documentElement.scrollTop + document.documentElement.clientHeight >= document.documentElement.scrollHeight - 5 && current_page < total_pages) {
        current_page++;
        const loadingGif = document.createElement('img');
        loadingGif.src = 'https://loading.io/spinners/double-ring/lg.double-ring-spinner.gif';
        document.body.appendChild(loadingGif);
        await searchMovies(query);
        document.body.removeChild(loadingGif);
    }
});

// Eventos de click para los botones de favoritos y watchlist
showFavsButton.addEventListener("click", function () {
    removeActive();
    this.classList.add("active");
    showFavs();
});

showWatchButton.addEventListener("click", function () {
    removeActive();
    this.classList.add("active");
    showWatchlist();
});

// Eventos de teclado y click para la búsqueda de películas
searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchMovies(this.value);
    }
});

searchBarIcon.addEventListener("click", () => searchMovies(searchInput.value));

searchInput.addEventListener('click', clearInput);