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
    title = "Ial Previsões do Tempo";
  }

  if (!text) {
    text = "Ial Previsões do Tempo";
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
                                                <div style="font-size:1vw"  class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                    ${key}</div>
                                                <div style="font-size:0.8vw" class="mb-0 font-weight-bold text-gray-800">Temp: ${value.temp} °C</div>
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
  pdf.addImage(fullQuality, "PNG", 0, 0);

  pdf.save(`${nome}.pdf`);
}

function graficoDash(
  dataLabel = [],
  dataSetLabel = "",
  dados = [],
  text = "",
  labelx = "",
  labely = "",
  type = "line",
  responsive = true
) {
  return {
    type: type,
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
      title: {
        display: true,
        text: text,
      },
      tooltips: {
        mode: "index",
        intersect: true,
      },
      hover: {
        mode: "nearest",
        intersect: true,
      },
      scales: {
        x: {
          display: true,
          scaleLabel: {
            display: true,
            labelString: labelx,
          },
        },
        y: {
          display: true,
          scaleLabel: {
            display: true,
            labelString: labely,
          },
        },
      },
    },
  };
}
