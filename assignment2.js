// voice commands
if (annyang) {
  const commands = {
    // hello
    'hello': () => { alert('Hello world!'); },
    // color
    'change the color to *color': (color) => {
      document.body.style.background = color; },
    // navigate
    'navigate to *page': (page) => {
      if (page == 'home') {
        window.location = 'assignment2_1.html';
      }
      else if (page == 'stocks') {
        window.location = 'assignment2_2.html';
      }
      else if (page == 'dogs') {
        window.location = 'assignment2_3.html';
      }
    },
    // stock page
    'look up *stock': (stock) => {
      document.getElementById('ticker').value = stock.toUpperCase();
      displayStock();
    },
    // dog page
    'load *dog': (dog) => {
      audioDog(dog.toUpperCase());
    }
  };
  annyang.addCommands(commands);
  annyang.start();

  document.getElementById('audioOn').addEventListener('click', function() {
    annyang.start();
    console.log('audio turned on');
  });

  document.getElementById('audioOff').addEventListener('click', function() {
    annyang.abort();
    console.log('audio turned off');
  });
}

function changePage(num) {
  if (num == 2) {
    window.location = 'assignment2_2.html';
  }
  else if (num == 3) {
    window.location = 'assignment2_3.html';
  }
}

// API call for quote
function getQuote() {
  fetch(`https://zenquotes.io/api/random`)
  .then((result) => result.json())
  .then((resultJson) => {
      document.getElementById('quote').textContent = '"' + resultJson[0]['q'] + '"';
      document.getElementById('author').textContent = '- ' + resultJson[0]['a'];
      console.log(resultJson[0]['q'] + ' ' + resultJson[0]['a']);
  });
}

// API call for stocks
async function searchStock() {
  // get search query from HTML
  const userStock = document.getElementById('ticker').value;
  const userPeriod = document.getElementById('period').value;
  console.log('stock: ', userStock, 'period: ', userPeriod);

  const toDate = new Date().toISOString().split('T')[0];
  const fromTemp = new Date();
  fromTemp.setDate(fromTemp.getDate() - userPeriod);
  const fromDate = fromTemp.toISOString().split('T')[0];

  // make API call
  const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${userStock}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=120&apiKey=r1QgzT_vrN0eHZ1dj7ys8vgDCvpnwnp_`)
  const responseJson = await response.json();
  const results = responseJson.results;

  // return titles and authors
  //console.log(results);
  return results;
}

// display stock info
function displayStock() {
  const dateList = [];
  const priceList = [];

  // call searchStock and make graph
  searchStock().then((results) => {
    for (var result in results) {
      date = new Date(results[result]['t']).toISOString().split('T')[0];
      price = results[result]['c'];
      //console.log('date: ' + date + ' price: ' + price);
      dateList.push(date);
      priceList.push(price);
    }
    //console.log(dateList, priceList);

    document.getElementById('lineChart').style.display = 'block';
    const ctx = document.getElementById('lineChart');

    if(Chart.getChart('lineChart')) {
      Chart.getChart('lineChart')?.destroy()
    };

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: dateList,
        datasets: [{
          label: 'Stock Price',
          data: priceList,
          backgroundColor: '#ba4550',
        }]
      },
    });
    
  });
  return false;
}

// populate table with top 5
async function populateTable() {
  const response = await fetch(`https://tradestie.com/api/v1/apps/reddit?date=2022-04-03`);
  const responseJson = await response.json();
  // console.log(responseJson);
  topStocks = responseJson.slice(0, 5);
  const table = document.getElementById('redditStock');
  topStocks.forEach(stock => {
    //console.log(stock['ticker'], stock['no_of_comments'], stock['sentiment']);
    let row = table.insertRow();
    let ticker = row.insertCell(0);
    ticker.innerHTML = `<a href='https://finance.yahoo.com/quote/${stock['ticker']}/'>${stock['ticker']}</a>`;
    let comments = row.insertCell(1);
    comments.innerHTML = stock['no_of_comments'];
    let sentiment = row.insertCell(2);
    if (stock['sentiment'] == 'Bearish') {
      sentiment.innerHTML = `<img src='https://static.thenounproject.com/png/3328203-200.png' />`;
    }
    else {
      sentiment.innerHTML = `<img src='https://static.thenounproject.com/png/3328202-200.png' />`;
    }
  });
}

// fill carousel with dogs from API
async function fillCarousel() {
  const dogImages = document.getElementById('dogCarousel');
  const response = await fetch(`https://dog.ceo/api/breeds/image/random/10`);
  const responseJson = await response.json();
  const messages = responseJson.message;

  messages.forEach(message => {
    //console.log(message);
    const image = document.createElement('img');
    image.src = message;
    image.style.width = '612px';
    image.style.height = '612px';
    dogImages.appendChild(image);
  })

  simpleslider.getSlider({
    container: dogImages
  });
}

// get dog breeds from API
async function getBreed() {
  const dogButtons = document.getElementById('dogGallery');
  const response = await fetch(`https://dogapi.dog/api/v2/breeds`);
  const responseJson = await response.json();
  const dogList = responseJson.data;

  dogList.forEach(dog => {
    //console.log(dog);
    const dogButton = document.createElement('button')
    dogButton.innerHTML = dog['attributes']['name'];
    dogButton.id = dog['id'];
    dogButton.setAttribute('class', 'button-78');
    dogButton.addEventListener('click', function(){
      document.getElementById('dogInfo').style.display = 'block'
      const info = document.getElementById('dogInfo');
      info.innerHTML = '';
      const name = document.createElement('h1');
      name.innerHTML = `Name: ${dog['attributes']['name']}<br>`
      const text = document.createElement('h3');
      text.innerHTML = `Description: ${dog['attributes']['description']}<br><br>
                        Min Life: ${dog['attributes']['life']['min']}<br><br>
                        Max Life: ${dog['attributes']['life']['max']}`;
      info.append(name, text);
    });
    dogButtons.append(dogButton);
  })
}

// info call for audio command
async function audioDog(dogBreed) {
  const response = await fetch(`https://dogapi.dog/api/v2/breeds`);
  const responseJson = await response.json();
  const dogList = responseJson.data;

  dogList.forEach(dog => {
    //console.log(dog);
    if (dogBreed == dog['attributes']['name'].toUpperCase()) {
      document.getElementById('dogInfo').style.display = 'block'
      const info = document.getElementById('dogInfo');
      info.innerHTML = '';
      const name = document.createElement('h1');
      name.innerHTML = `Name: ${dog['attributes']['name']}<br>`
      const text = document.createElement('h3');
      text.innerHTML = `Description: ${dog['attributes']['description']}<br><br>
                        Min Life: ${dog['attributes']['life']['min']}<br><br>
                        Max Life: ${dog['attributes']['life']['max']}`;
      info.append(name, text);
    }
  }); 
}

// page start up
function loadProcesses() { 
  if (window.location.href.split('/')[3] == 'assignment2_1.html') {
    getQuote();
  }
  else if (window.location.href.split('/')[3] == 'assignment2_2.html') {
    document.getElementById('lineChart').style.display = 'none';
    populateTable();
  }
  else if (window.location.href.split('/')[3] == 'assignment2_3.html') {
    document.getElementById('dogInfo').style.display = 'none';
    fillCarousel();
    getBreed();
  }
}

window.onload = loadProcesses;