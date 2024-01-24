
let map = L.map("map", {
    center: [24.0, -102.145],
    zoom: 5
  })

  L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
    .addTo(map)

let dropdownMenu = d3.select("#selDataset") 

d3.json('static/js/data.json').then(data => {
  d3.json('static/js/location_data.json').then(data_l => {console.log(data_l)

    let filterldata = data_l.filter(function(d){
      return d.unidad === 'Norte'})

 
    console.log(filterldata)
    filterldata.forEach(dp => L.circle(dp.coordenadas.reverse(),{

      fillOpacity: 0.1,
      color: 'red',
      fillColor: 'red',
      radius: 10000}).addTo(map))

//////initial menu and graph
optionChanged('Total')


///////////////////// Populate the Menu /////////////////////////////////
      let groupedData = d3.groups(data, d => d.unidad)

      let uniqueValues = groupedData.map(function(d) {
        return d[0]
      })

      console.log(uniqueValues)

     

      for(let i =0; i<uniqueValues.length; i++){
        dropdownMenu.append("option").text(uniqueValues[i]).property("value",uniqueValues[i])
    }
    

})
})


///////////////////////////////////////// Función para cambiar info de acuerdo a la selección del usuario de unidad/////////////////////////////////////
function optionChanged(selectedValue) {
  d3.json('static/js/data.json').then(function(data){
    let unidad =selectedValue
//////////////cambiar cuadro////////////////////////////////////
  let filteredDataChart = data.filter(function(d) {
    return d.unidad === unidad
  })
  console.log(filteredDataChart)
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
    console.log(unidad)
    let bar_layout = {
      title: `${unidad}`,
      xaxis: { title: 'Monto' },
      margin: { t: 50, l: 150, r: 50, b: 50 },
      bargap: 0.01,
      bargroupgap: 0.01,
    }

    Plotly.newPlot('plot', bar_trace, bar_layout)
  })
  
}

/////gráfica de todos los gastos por Dirección////
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

///////time graph///////
let margin = {top: 60, right: 230, bottom: 50, left: 50},
    width = 660 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

let svg = d3.select('#time_plot')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.json('static/js/time_data.json').then(data => {
  console.log(data)
  let groupedData = d3.groups(data, d => d.tipo_de_gasto)

  let keys = groupedData.map(function(d) {
    return d[0]
  })
  console.log(keys)

  let color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeSet2);
})