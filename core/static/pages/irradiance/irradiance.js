function busca() {
  let latitude = $("#irradiance_latitude").val();
  let longitude = $("#irradiance_longitude").val();
  let inicio = $("#irradiance_inicio").val();
  let fim = $("#irradiance_fim").val();
  let potencia = $("#irradiance_potencia").val();
  let perda = $("#irradiance_perda").val();
  let custo = $("#irradiance_custo").val();

  data = http.request({
    metodo: "POST",
    path: "api/irradiance/",
    data: {
      latitude: latitude,
      longitude: longitude,
      inicio: inicio,
      fim: fim,
      potencia: potencia,
      perda: perda,
      custo: custo,
    },
  });
  if (data?.status == "success") {    
    $("#div_table").empty().append(data.data.html);
    dadosAnos = data.data.dadosAnos;
    dados = data.data.dados;
    ano = data.data.ano;
    mes = data.data.mes;
    data = [];
    irradiance = [];
    energy = [];

    for (key in dados.time) {
      data.push(dados.time[key]);
      irradiance.push(dados.irradiance[key]);
      energy.push(dados.energy[key]);
    }

    time = dados.time;

    config_dia = graficoDash(
      data,
      "Níveis (kW-hr/m^2) ",
      irradiance,
      `Níveis de radiação solar ${mes}/${ano}`,
      "Dia",
      "Produção diaria",
      (type = "bar")
    );
    var ctx = document.getElementById("canvas_dia").getContext("2d");
    $("#canvas_dia").html("");
    window.dia = new Chart(ctx, config_dia);

    var ctx = document.getElementById("canvas_dia2").getContext("2d");
    $("#canvas_dia2").html("");
    window.dia2 = new Chart(ctx, config_dia);

    config_dia_watts = graficoDash(
      data,
      "Energia gerada (kWh) ",
      energy,
      `Produção diaria ${mes}/${ano}`,
      "Dia",
      "Produção diaria",
      (type = "bar")
    );

    var ctx = document.getElementById("canvas_dia_watts").getContext("2d");
    $("#canvas_dia_watts").html("");
    window.dia_watts = new Chart(ctx, config_dia_watts);
    var ctx = document.getElementById("canvas_dia_watts2").getContext("2d");
    $("#canvas_dia_watts2").html("");
    window.dia_watts2 = new Chart(ctx, config_dia_watts);

    dataAno = [];
    irradianceAno = [];
    energyAno = [];

    for (key in dadosAnos.irradience) {
      dataAno.push(dadosAnos.irradience[key].ano);
      irradianceAno.push(dadosAnos.irradience[key].valor);
      energyAno.push(dadosAnos.energy[key].valor);
    }

    config_ano = graficoDash(
      dataAno,
      `Produção mensal ${mes}`,
      irradianceAno,
      `Níveis de radiação solar ultimos 5 anos para o mes ${mes}`,
      "Dia",
      "Produção diaria",
      (type = "bar")
    );

    var ctx = document.getElementById("canvas_ano").getContext("2d");
    $("#canvas_ano").html("");
    window.ano = new Chart(ctx, config_ano);

    var ctx = document.getElementById("canvas_ano2").getContext("2d");
    $("#canvas_ano2").html("");
    window.ano2 = new Chart(ctx, config_ano);

    config_ano_watts2 = graficoDash(
      dataAno,
      `Produção mensal ${mes}`,
      energyAno,
      `Produção mensal dos ultimos 5 anos para o mes ${mes}`,
      "Dia",
      "Produção diaria",
      (type = "bar")
    );

    var ctx = document.getElementById("canvas_ano_watts").getContext("2d");
    $("#canvas_ano_watts").html("");
    window.ano_watts = new Chart(ctx, config_ano_watts2);

    var ctx = document.getElementById("canvas_ano_watts2").getContext("2d");
    $("#canvas_ano_watts2").html("");
    window.ano_watts2 = new Chart(ctx, config_ano_watts2);

    title = `Dados de Irradiação Solar `;
    $("#table_relatorio").DataTable({
      dom: "Bfrtip",
      buttons: [
        { extend: "copyHtml5", footer: true, text: "Copiar" },
        {
          extend: "pdfHtml5",
          text: "PDF",
          orientation: "landscape",
          title: title,
          pageSize: "A4",
          download: "open",
          footer: true,
        },
        {
          extend: "print",
          text: "Imprimir",
          title: title,
          footer: true,
        },
      ],
      searching: false,
      language: {
        sEmptyTable: "Nenhum registro encontrado",
        sInfo: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
        sInfoEmpty: "Mostrando 0 até 0 de 0 registros",
        sInfoFiltered: "(Filtrados de _MAX_ registros)",
        sInfoPostFix: "",
        sInfoThousands: ".",
        sLengthMenu: "_MENU_ resultados por página",
        sLoadingRecords: "Carregando...",
        sProcessing: "Processando...",
        sZeroRecords: "Nenhum registro encontrado",
        sSearch: "Pesquisar",
        oPaginate: {
          sNext: "Próximo",
          sPrevious: "Anterior",
          sFirst: "Primeiro",
          sLast: "Último",
        },
        oAria: {
          sSortAscending: ": Ordenar colunas de forma ascendente",
          sSortDescending: ": Ordenar colunas de forma descendente",
        },
        select: {
          rows: {
            _: "Selecionado %d linhas",
            0: "Nenhuma linha selecionada",
            1: "Selecionado 1 linha",
          },
        },
      },
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return "Details for " + data[0] + " " + data[1];
            },
          }),
          renderer: $.fn.dataTable.Responsive.renderer.tableAll({
            tableClass: "table",
          }),
        },
      },
    });
    $("#graficos").show()
  }
}

$(document).ready(function () {
  $("#graficos").hide();
});
