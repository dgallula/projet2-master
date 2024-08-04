$(document).ready(() => {
  const CRYPTO_COMPARE_API_KEY = "c9e5e9284e9f0f6ca1f5307ba9c3ffecab188049a7d3678310793883fdefbbe3"
  const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/coins"
  const MAX_SELECTED_CURRENCIES = 5
  let selectedCurrencies = []
  let currenciesToShow = []
  let reportIntervalId
  let dataPoints = []

  // LIVE REPORT
  var options = {
    exportEnabled: true,
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Live Report"
    },
    subtitles: {
      text: ""
    },
    axisX: {
      title: "",
      valueFormatString: "HH:mm:ss",
    },
    axisY: {
      title: "Coin Value"
    },
    toolTip: {
      shared: true,
      content: "{name}: {y}$"
    },
    data: [{ // = une ligne
      type: "spline", 
      yValueFormatString: "$#,###.##",
      dataPoints: dataPoints
    }]
  }

  $("#live-report").CanvasJSChart(options)
  $('#live-report').hide()



  const getAllCurrencies = async () => {
    const res = await fetch(COINGECKO_API_URL + '/list')
    const currencies = await res.json()
    
    return currencies.slice(0, 100)
  }

  const getCurrencyDetailsById = async id => {
    const res = await fetch(COINGECKO_API_URL + '/' + id)
    const currency = await res.json()
    
    return currency
  }


// SEARCH
  const onSearch = searchValue => {
    for (const currency of currenciesToShow) {
      if (currency.includes(searchValue)) {
        $(`#card-${currency}`).show()
      } else {
        $(`#card-${currency}`).hide()
      }
    }
  }

  const addDataPoints = currencies => {
    for (const currency of currencies) {
      $.get(`https://min-api.cryptocompare.com/data/price?fsym=${currency}&tsyms=USD&api_key=${CRYPTO_COMPARE_API_KEY}`, data => {
        dataPoints.push({
          x: new Date(),
          y: data.USD
        })
      })
    }
    addDataPoints(currencies)
    reportIntervalId = setInterval(() => addDataPoints(currencies), 2000)
  }


// AFFICHE TOUS LES ELEMENTS
  $("#search-bar").keyup(() => {
    onSearch($("#search-bar").val())
  })


// CLEAR
$("#clear").click(() => {
  $('#search-bar').css('background-color', '')
  $('#search-bar').val('')
  onSearch($("#search-bar").val())
})

  // HOME
  $("#home").click(() => {
    $('#live-report').hide()
    $('#divTag').show()
    dataPoints = []
    clearInterval(reportIntervalId)
    $("#about-page").hide();
  })



  $("#ShowReport").click(() => {
    $('#divTag').hide()
    $('#live-report').show()
    generateReport(selectedCurrencies)
    $("#about-page").hide();
  })


  // BITCOINS
  getAllCurrencies()
    .then(currencies => {
      $('#spinner').fadeOut(1000)

      $.each(currencies, (i) => {
        currenciesToShow.push(currencies[i].symbol)
        $("div#divTag").append(
          `<div id="card-${currencies[i].symbol}" class="card col-sm-6 col-md-4 col-lg-3 col-xl-2">
            <div class="card-body">
              <h5 class="card-title">${currencies[i].symbol.toUpperCase()}</h5>
              <p class="card-text">${currencies[i].name}</p>
              <p class="card-text" id="${currencies[i].id}" style="display: none"></p>
              <button id="btn-${currencies[i].id}" class="btn btn-primary" type="button">More infos</button>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="${currencies[i].symbol}" >
              <label class="form-check-label" for="${currencies[i].symbol}">
              add to live report
              </label>
            </div>
          </div>`
        )

        $(`#btn-${currencies[i].id}`).click((evt)=> {
          $(`p#${currencies[i].id}`).html('')
          getCurrencyDetailsById(currencies[i].id)
            .then(currency => {
              $(`p#${currencies[i].id}`).append(`
                <div class="card">
                  <img class="card-img-top" src="${currency.image.large}" alt="Card image cap">
                  <div class="card-body">
                    <h5 class="card-text" id="money" style='color: red'>${currency.market_data.current_price.ils} ₪</h5>
                    <h5 class="card-text" id="money" style='color: blue'>${currency.market_data.current_price.eur} €</h5>
                    <h5 class="card-text" id="money" style='color: green'>${currency.market_data.current_price.usd} $</h5>
                  </div>
                </div>
                `
              )

              $(`p#${currencies[i].id}`).slideToggle('slow')
            })
            .catch(error => {
              console.log(error)
            })
        })
      })





// SELECT CURRENCIES : MAX 5
      $(`.form-check-input`).on('click', evt => {
        // if the button id is already checked
        if (selectedCurrencies.includes(evt.target.id)) {
          selectedCurrencies = selectedCurrencies.filter(id => id !== evt.target.id)
        } else {
          // if we want to add the currency to the report
          // limit the selected currencies to 5
          if (selectedCurrencies.length + 1 > MAX_SELECTED_CURRENCIES) {
            evt.preventDefault()
            alert('Sorry you can choose only 5 coins')
          } else {
            selectedCurrencies.push(evt.target.id)
          }
        }
      })
    })


// MODAL
  $('#modal-opener').click(() => {
    $('.modal-body').html("") 
    $.each(selectedCurrencies,(i) => {
      console.log(selectedCurrencies[i].toUpperCase())
      $('.modal-body').append(`
            <div class="card-body">
            <h5 class="card-title">${selectedCurrencies[i].toUpperCase()}</h5>
            <div class="form-check">
            <input class="form-check-input" type="checkbox" id="${selectedCurrencies[i] + 1}" checked >
            <label class="form-check-label" for="${selectedCurrencies[i]+ 1}">
            add to live report
            </label>
          </div>`)
    })
  })



// STYLE SEARCH BAR
  $('#search-bar').focusin(function () {
   $(this).css('background-color', '#ABEBF6')
   })
  
  $('#search-bar').focusout(function () {
   $(this).css('background-color', '')
  })
  
})


// GO UP
  $(function ()  
  { 
      $('#top').click(function ()  
      { 
          $('html, body').animate({ 
              scrollTop: '0px' 
          }, 
          1500); 
          return false; 
      }); 
  }); 


// ABOUT
  $("#about-page").hide();
  $("#about").click(function(){
  $("#about-page").show();
  $(`#card-${currencies}`).hide()
  })

$("#close-about").click(()=>{
  $("#about-page").hide();
  for (const currency of currenciesToShow) {
    $(`#card-${currency}`).show()
  }
})


 
