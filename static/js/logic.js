
let lineChart = null
let map = L.map("map", {
    center: [24.0, -102.145],
    zoom: 5
  })

  L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
    .addTo(map)


let dropdownMenu = d3.select("#selDataset") 
let markersLayer =  L.layerGroup()
map.addLayer(markersLayer)


function init(){

optionChanged('Total')


d3.json('static/js/data.json').then(data => {

///////////////////// Populate the Menu /////////////////////////////////
      let groupedData = d3.groups(data, d => d.unidad)

      let uniqueValues = groupedData.map(function(d) {
        return d[0]
      })

      for(let i =0; i<uniqueValues.length; i++){
        dropdownMenu.append("option").text(uniqueValues[i]).property("value",uniqueValues[i])
    }
    

})
}
////////////////////////// Update the map /////////////////////////////////////
function mapper(unidad){
  d3.json('static/js/location_data.json').then(data => {console.log(data)
  
    markersLayer.clearLayers()

    let filter_data = data.filter(function(d){
      return d.unidad === unidad})
    
    console.log(filter_data)

    
    let uniques = []

    for(let i =0; i<filter_data.length; i++){
      let destino = ''
      destino = filter_data[i].mpio_edo
      if(uniques.includes(destino)){} else{
        uniques.push(destino)
      }
    }

    console.log(uniques)
    let filter_destino =[]
    let num_viajes =[]
    let coords = []
    


    for(let i =0; i<uniques.length; i++){
    filter_destino = filter_data.filter(function(d){
      return d.mpio_edo===uniques[i]})

    console.log(filter_destino[0].mpio_edo)
    console.log(filter_destino)
    
    num_viajes.push(filter_destino.length)
    coords.push(filter_destino[0].coordenadas)  
    }
    
    
    for(let i =0; i<coords.length; i++){
      if(coords[i][1]){
          markersLayer.addLayer(L.marker([coords[i][1],coords[i][0]],{icon:iconColor(num_viajes[i])}).bindPopup(`
          <h2>${uniques[i]}</h2><hr>
          <h3> Total de viajes: ${num_viajes[i].toLocaleString()}</h3>`))
        }
    }

  }
)}

function iconColor(viajes){

  let greenIcon = new L.Icon({
    iconUrl: 'img/marker-icon-green.png',
    
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34] 
  })

  let redIcon = new L.Icon({
    iconUrl: 'img/marker-icon-red.png',
    
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34] 
  })

  let orangeIcon = new L.Icon({
    iconUrl: 'img/marker-icon-orange.png',
    
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34] 
  })

  if(viajes>20){return redIcon} 
    else if(viajes>10){return orangeIcon}
    else{return greenIcon}

}

///////////////////////////////////////// Función para cambiar info de acuerdo a la selección del usuario de unidad/////////////////////////////////////
function optionChanged(selectedValue) {
  
  d3.json('static/js/data.json').then(function(data){
    let unidad =selectedValue
   
    mapper(unidad)
 
    


//////////////cambiar cuadro////////////////////////////////////
  let filteredDataChart = data.filter(function(d) {
    return d.unidad === unidad
  })
  
  let   dataDiv = d3.select('#chart')
        dataDiv.selectAll('p').remove()

        dataDiv.append('p').html('<strong>' +'Unidad de Análisis:' + '</strong> '+ unidad)
 
    filteredDataChart.forEach(function(d) {
    dataDiv.append('p').html('<strong>' + d.tipo_de_gasto + ':</strong> $' + parseFloat(d.monto).toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
  })
///////////cambiar gráfica///////////
    let filteredData = data.filter(function(d) {
      return d.unidad === unidad && d.tipo_de_gasto!=='Total'
    })

    filteredData.sort((a, b) => b.monto - a.monto)

    let tipoDeGastoList = []
    let montoList = []
 

    filteredData.forEach(function(d) {
      tipoDeGastoList.push(d.tipo_de_gasto)
      montoList.push(d.monto)
    })

    let colorScale = d3.scaleSequential(d3.interpolateBlues)

    let bar_trace = [{
      type: 'bar',
      x: montoList,
      y: tipoDeGastoList,
      orientation: 'h',
      marker: { 
        color: montoList.map(value => colorScale(value / Math.max(...montoList))),
      },
      text: tipoDeGastoList.map((category, index) => `Tipo de Gasto: ${category}<br>Monto: ${montoList[index].toLocaleString()}`),
      hoverinfo: 'text',
    }]
    unidad=selectedValue
    
    let bar_layout = {
      title: `${unidad}`,
      xaxis: { title: 'Monto' },
      margin: { t: 50, l: 150, r: 50, b: 50 },
      bargap: 0.01,
      bargroupgap: 0.01,
    }

    Plotly.newPlot('plot', bar_trace, bar_layout)
  })
//////////// time graph ///////////////

  d3.json('static/js/time_data.json').then(function(data){
    console.log(data)
    
    let unidad = selectedValue
    console.log(unidad)
    let filteredData = data.filter(item => item.unidad === unidad);

    let groupedData = d3.group(filteredData, d => d.tipo_de_gasto);

    labels =[]
    filteredData.forEach(function(d) {
    labels.push(d.mes)
    })
    console.log(labels)

    let datasets = []

    let colorScale = d3.scaleSequential(d3.interpolateRainbow)

    for (const [tipo_de_gasto, group] of groupedData) {
              let values = Array.from(group, item => item.monto_acumulado);
              console.log(values)
              
              datasets.push({
                  label: tipo_de_gasto,
                  data: values,
                  fill: false,
                  borderColor: labels.map(value => colorScale(value / Math.max(...labels))),
                  pointBackgroundColor: 'black',
                  pointBorderColor: 'black',
                  pointHitRadius: 10,
                  hoverBackgroundColor: labels.map(value => colorScale(value / Math.max(...labels))),
                  pointHoverRadius: 15

              })
          }
    
    if (lineChart) {
      lineChart.destroy();
    }
    let ctx_time = document.getElementById('timeChart').getContext('2d');
     lineChart = new Chart(ctx_time, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
          scales: {
              x: {
                  type: 'linear',
                  position: 'bottom',
              },
              y: {
                  beginAtZero: true,
              },
          },
          plugins: {
            title: {
              display: true,
              text: `Gasto mensual acumulado ${unidad}`,
              font: {
                      size:40,
                      
                    }
            }
          }
        },
    });


  })

}

///////////////////////////////////////////////////////gráfica de todos los gastos por Dirección////
d3.json('static/js/data.json').then(function(jsonData) {
  let filteredData = jsonData.filter(entry => entry.dirección !== "Total" && entry.tipo_de_gasto !== "Total")

  let direcciones = Array.from(new Set(filteredData.map(d => d.dirección)))

  let colorPalette = ['#9dc6d8', '#00b3ca', '#7dd0b6', '#1b4e89', '#d2b29b', '#f69256', '#965251', '#c6cccc']

  let groupedData = direcciones.map((direc, index) => {
    return {
      dirección: direc,
      data: filteredData.filter(entry => entry.dirección === direc),
      color: colorPalette[index]
    }
  })

  let traces = groupedData.map(group => {
    return {
      x: group.data.map(d => d.tipo_de_gasto),
      y: group.data.map(d => d.monto),
      type: 'bar',
      name: group.dirección,
      marker: {
        color: group.color
      },
      
    }
  })

  let layout = {
    barmode: 'stack',
    yaxis: { title: 'Monto' },
    title: 'Gasto total por Dirección',
    height: 800,
    width: 1200
  }

  Plotly.newPlot('bigplot', traces, layout);
})


init()