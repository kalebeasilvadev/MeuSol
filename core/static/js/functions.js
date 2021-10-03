$(document).ready(function () {
  $("#corpo").empty();
  $("#corpo").load("web/corpo");
});

function chamaPage(path, conteiner) {
  path = path.split("/");
  $.ajax({
    url: "web/" + path[path.length - 2],
    error: function () {
      $(conteiner).load("web/generico/generico.html");
    },
    success: function () {
      $(conteiner).load("web/" + path[path.length - 2]);
    },
  });
}

function alertas(text = null, title = null) {
  if (!title) {
    title = "Previsões do Tempo";
  }

  if (!text) {
    text = "Previsões do Tempo";
  }
  // $("#modal_msg").modal("show");
  BootstrapDialog.show({
    title: title,
    message: text,
    buttons: [
      {
        label: "OK",
        action: function (dialog) {
          dialog.close();
        },
      },
    ],
  });
}

function modal(elm) {
  $(elm).modal("show");
}
function modalClose(elm) {
  $(elm).modal("hide");
}

function montaCards(item, nomeModal, elm = "") {
  Object.keys(item.dadosPrevisao).forEach((key) => {
    value = item.dadosPrevisao[key];
    nomeModalDias = `${key.replaceAll("/", "_")}${nomeModal}`;

    let htmls = `<div class="col-sm-2">
                                <div class="card border-left-primary shadow h-100 py-1">
                                    <div class="card-body">
                                        <div class="row no-gutters align-items-center">
                                            <div class="col-sm mr-2">
                                                <div style="font-size:100%"  class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                    ${key}</div>
                                                <div style="font-size:80%" class="mb-0 font-weight-bold text-gray-800">Temp: ${value.temp} °C</div>
                                                <div >
                                                    <button onclick='modal("#modal2_${nomeModalDias}")' type="button" class="btn  btn-outline-info btn-sm" >Detalhar</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="modal2_${nomeModalDias}" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="modal_title">${key}</h5>
                                            <button type="button" class="close" onclick='modalClose("#modal2_${nomeModalDias}")' aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="container-fluid row" id="modal2_text_${nomeModalDias}"></div>
                                            <div class="modal-footer" id='modal_footer'>
                                                <button type="button" class="btn btn-secondary" onclick='modalClose("#modal2_${nomeModalDias}")'>sair</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    `;
    if (elm) {
      $(elm).append(htmls);
    } else {
      $(`#modal_text_${nomeModal}`).append(htmls);
    }
    Object.keys(value.time).forEach((keys) => {
      values = value.time[keys];
      let detalhes = `
                                    <div class="col-sm-3">
                                    <div class="card border-left-primary shadow h-100 py-2">
                                        <div class="card-body">
                                            <div class="row no-gutters align-items-center">
                                                <div class="col mr-2">
                                                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1"> ${key} ${keys}</div>
                                                    <div class="h6 mb-0 font-weight-bold text-gray-800">Temp: ${values.temp} °C</div>
                                                    <div class="h6 mb-0 font-weight-bold text-gray-800">Min: ${values.min} °C</div>
                                                    <div class="h6 mb-0 font-weight-bold text-gray-800">Max: ${values.max} °C</div>
                                                    <div class="h6 mb-0 font-weight-bold text-gray-800">Pressao: ${values.pressure}</div>
                                                    <div class="h6 mb-0 font-weight-bold text-gray-800">Umidade: ${values.humidity}</div>
                                                    <div class="h6 mb-0 font-weight-bold text-gray-800">Nivel do mar: ${values.sea_level}</div>
                                                    <div class="h6 mb-0 font-weight-bold text-gray-800">Vento: ${values.wind}</div>
                                                    <div class="h6 mb-0 font-weight-bold text-gray-800">Clima: ${values.weather.main}</div>
                                                </div>
                                                <div class="col-auto">
                                                    <img src="http://openweathermap.org/img/wn/${values.weather.icon}.png" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                `;
      $(`#modal2_text_${nomeModalDias}`).append(detalhes);
    });
  });
}

function downloadPDF(grafico, nome) {
  var pdfCanvas = document.getElementById(grafico).getContext("2d");
  var fullQuality = document
    .getElementById(grafico)
    .toDataURL("image/png", 1.0);
  var pdfctx = pdfCanvas;
  var pdfctxX = 0;
  var pdfctxY = 0;
  var buffer = 100;

  $("canvas").each(function (index) {
    var canvasHeight = $(this).innerHeight();
    var canvasWidth = $(this).innerWidth();
    pdfctx.drawImage($(this)[0], pdfctxX, pdfctxY, canvasWidth, canvasHeight);
    pdfctxX += canvasWidth + buffer;
    if (index % 2 === 1) {
      pdfctxX = 0;
      pdfctxY += canvasHeight + buffer;
    }
  });
  var pdf = new jsPDF("l", "pt");
  pdf.addImage(fullQuality, "PNG", 0, 0, ["1000px", "1000px"]);

  pdf.save(`${nome}.pdf`);
}

const footer = (tooltipItems) => {
  let sum = 0;
  console.log("as as da");
  tooltipItems.forEach(function (tooltipItem) {
    sum += tooltipItem.parsed.y;
  });
  return "Sum: " + sum;
};

// <block:external:2>
const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector("div");

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.style.background = "rgba(0, 0, 0, 0.7)";
    tooltipEl.style.borderRadius = "3px";
    tooltipEl.style.color = "white";
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.position = "absolute";
    tooltipEl.style.transform = "translate(-50%, 0)";
    tooltipEl.style.transition = "all .1s ease";
    tooltipEl.style.width = "250px";

    const table = document.createElement("table");
    table.style.margin = "0px";

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  // Tooltip Element
  const { chart, tooltip } = context;

  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    var { humidity, temperature } = chart.config._config.adicional;
    var labelx = chart.config._config.labelx;
    var { dataIndex, label, formattedValue, dataset } = tooltip.dataPoints[0]

    const tableRoot = tooltipEl.querySelector("table");

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    var html = ''
    if(temperature){
      html = `
        <div class="form-group">
          <span>${labelx} ${label}</span><br/>
          <span>${dataset.label} = ${formattedValue}</span><br/>
          <span>Temperatura = ${temperature[dataIndex]} °C</span><br/>
          <span>Humidade = ${humidity[dataIndex]} %</span>
        </div>
      `;
    }else{
      html = `
        <div class="form-group">
          <span>${labelx} ${label}</span><br/>
          <span>${dataset.label} = ${formattedValue}</span><br/>
        </div>
      `;
    }
    tableRoot.innerHTML = html;
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + "px";
  tooltipEl.style.top = positionY + tooltip.caretY + "px";
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding =
    tooltip.options.padding + "px " + tooltip.options.padding + "px";
};

function graficoDash(
  dataLabel = [],
  dataSetLabel = "",
  dados = [],
  text = "",
  labelx = "",
  labely = "",
  type = "line",
  infos = {},
  responsive = true
) {
  return {
    type: type,
    adicional: infos,
    labelx: labelx,
    data: {
      labels: dataLabel,
      datasets: [
        {
          label: dataSetLabel,
          backgroundColor: "rgb(54, 162, 235)",
          borderColor: "rgb(54, 162, 235)",
          data: dados,
          fill: false,
        },
      ],
    },
    options: {
      responsive: responsive,
      plugins: {
        title: {
          display: true,
          text: text,
        },
        tooltip: {
          enabled: false,
          position: "nearest",
          external: externalTooltipHandler,
        },
      },
    },
  };
}

function do_something(coords) {
  $("#irradiance_latitude").val(coords.latitude);
  $("#irradiance_longitude").val(coords.longitude);
}

function pegaLoc() {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      do_something(position.coords);
    },
    function (failure) {
      $.getJSON("https://ipinfo.io/geo", function (response) {
        var loc = response.loc.split(",");
        var coords = {
          latitude: loc[0],
          longitude: loc[1],
        };
        do_something(coords);
      });
    }
  );
}
