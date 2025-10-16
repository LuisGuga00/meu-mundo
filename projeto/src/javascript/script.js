// Evento para capturar a busca da cidade e fazer a requisição à API
document.querySelector('#search').addEventListener('submit', async (event) => {
    event.preventDefault();

    const cityName = document.querySelector('#city_name').value;

    if (!cityName) {
        document.querySelector("#weather").classList.remove('show');
        showAlert('Você precisa digitar uma cidade...');
        return;
    }

    //API ussada
    const apiKey = '8a60b2de14f7a17c7a11706b2cfcd87c'; 
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(cityName)}&appid=${apiKey}&units=metric&lang=pt_br`;

    const results = await fetch(apiUrl);
    const json = await results.json();

    if (json.cod === 200) {
        // Chama a API para obter a previsão para 5 dias (hoje, amanhã e 3 próximos dias)
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURI(cityName)}&appid=${apiKey}&units=metric&lang=pt_br&cnt=5`;
        const forecastResult = await fetch(forecastUrl);
        const forecastJson = await forecastResult.json();

        if (forecastJson.cod === "200") {
            // Mapear os dados dos 5 dias de previsão
            weatherData = forecastJson.list.map(item => ({
                city: forecastJson.city.name,
                country: forecastJson.city.country,
                temp: item.main.temp,
                tempMax: item.main.temp_max || item.main.temp, 
                tempMin: item.main.temp_min || item.main.temp, 
                description: item.weather[0].description,
                tempIcon: item.weather[0].icon,
                windSpeed: item.wind.speed,
                humidity: item.main.humidity,
                dt: item.dt // Data em formato Unix
            }));

            // Inicializa o contador de dias
            currentDayIndex = 0; // Começa com o primeiro dia da previsão

            // Define o primeiro dia com base no getDate da data da API
            const firstDate = new Date(weatherData[0].dt * 1000); // Primeiro dia em formato Date
            baseDay = firstDate.getDate(); // Define o primeiro dia da previsão como base

            // Exibe as informações para o primeiro dia
            showInfo(currentDayIndex);

            // Atualiza os botões de navegação
            updateNavigationButtons();
        } else {
            showAlert('Não foi possível obter a previsão do tempo...');
        }
    } else {
        showAlert('Não foi possível localizar...');
    }
});

let currentDayIndex = 0; // Variável para controlar o índice do dia exibido na weatherData
let weatherData = []; // Array para armazenar os dados de previsão
let baseDay = 0; // Variável para armazenar o valor inicial do dia da previsão

// Exibe as informações do clima
function showInfo(dayIndex) {
    showAlert('');
    document.querySelector("#weather").classList.add('show');

    const json = weatherData[dayIndex];
    if (!json) return; // Proteção contra acesso a índice inválido

    // Calculando o dia correto com base no baseDay
    const date = new Date(json.dt * 1000); // Convertendo Unix timestamp para objeto Date
    date.setDate(baseDay + dayIndex); // Atualiza o dia somando ou subtraindo com base no contador

    const formattedDate = formatDate(date); // Função para formatar a data

    // Atualiza a interface com as informações do clima
    document.querySelector('#title').innerHTML = `${json.city}, ${json.country} - ${formattedDate}`;
    document.querySelector('#temp_value').innerHTML = `${json.temp.toFixed(1).toString().replace('.', ',')} <sup>C°</sup>`;
    document.querySelector('#temp_description').innerHTML = `${json.description}`;
    document.querySelector('#temp_img').setAttribute('src', `https://openweathermap.org/img/wn/${json.tempIcon}@2x.png`);
    document.querySelector('#temp_max').innerHTML = `${json.tempMax.toFixed(1).toString().replace('.', ',')} <sup>C°</sup>`;
    document.querySelector('#temp_min').innerHTML = `${json.tempMin.toFixed(1).toString().replace('.', ',')} <sup>C°</sup>`;
    document.querySelector('#humidity').innerHTML = `${json.humidity}%`;
    document.querySelector('#wind').innerHTML = `${json.windSpeed.toFixed(1)} km/h`;
}

// Função para mostrar alertas
function showAlert(msg) {
    document.querySelector('#alert').innerHTML = msg;
}

// Atualiza os botões de navegação
function updateNavigationButtons() {
    document.querySelector('#prev-day').disabled = (currentDayIndex === 0); // Desabilita a seta para trás se estiver no primeiro dia
    document.querySelector('#next-day').disabled = (currentDayIndex === weatherData.length - 1); // Desabilita a seta para frente se estiver no último dia
}

// Funções para navegar entre os dias
document.querySelector('#prev-day').addEventListener('click', () => {
    if (currentDayIndex > 0) {  // Não permite navegar para antes do primeiro dia
        currentDayIndex--; // Decrementa o dia
        showInfo(currentDayIndex); // Exibe as informações para o dia anterior
        updateNavigationButtons(); // Atualiza os botões de navegação
    }
});

document.querySelector('#next-day').addEventListener('click', () => {
    if (currentDayIndex < weatherData.length - 1) {  // Não permite navegar além do último dia
        currentDayIndex++; // Incrementa o dia
        showInfo(currentDayIndex); // Exibe as informações para o próximo dia
        updateNavigationButtons(); // Atualiza os botões de navegação
    }
});

// Função para formatar a data no formato dd/mm/yyyy
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0'); // Garante que o dia tenha 2 dígitos
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Garante que o mês tenha 2 dígitos (os meses começam em 0)
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
