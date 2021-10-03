async function busca() {
  let latitude = $("#irradiance_latitude").val();
  let longitude = $("#irradiance_longitude").val();
  let inicio = $("#irradiance_inicio").val();
  let fim = $("#irradiance_fim").val();
  let potencia = $("#irradiance_potencia").val();
  let perda = $("#irradiance_perda").val();
  let custo = $("#irradiance_custo").val();

  if(!latitude || !longitude || !inicio || !fim || !potencia || !perda || !custo){
    verifica($("#irradiance_latitude"))
    verifica($("#irradiance_longitude"))
    verifica($("#irradiance_inicio"))
    verifica($("#irradiance_fim"))
    verifica($("#irradiance_potencia"))
    verifica($("#irradiance_perda"))
    verifica($("#irradiance_custo"))
    alertas("Preencha os campos.")
    return;
  }

  const date1 = new Date(inicio);
  const date2 = new Date(fim);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 31) {
    const confirm = await ui.confirm("Periodo maior que 31 dias. Deseja continuar?");
    if (!confirm) {
      return false;
    }
  }

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
    mes_fim = data.data.mes_fim;
    inicio = data.data.inicio;
    fim = data.data.fim;
    dia_fim = data.data.dia_fim;
    dia_inicio = data.data.dia_inicio;
    fim = data.data.fim;
    data = [];
    irradiance = [];
    energy = [];
    temperature = [];
    humidity = [];

    for (key in dados.time) {
      data.push(dados.time[key]);
      irradiance.push(dados.irradiance[key]);
      energy.push(dados.energy[key]);
      temperature.push(dados.temperature[key]);
      humidity.push(dados.humidity[key]);
    }
    infos = { humidity: humidity, temperature: temperature };
    time = dados.time;
    config_dia = graficoDash(
      data,
      "Níveis de radiação (kW-hr/m^2) ",
      irradiance,
      `Níveis de radiação solar ${inicio} - ${fim}`,
      "Dia",
      "Produção diaria",
      (type = "bar"),
      (infos = infos),
      backgroundColor = "#8B008B"
    );

    if (window.dia instanceof Chart) {
      window.dia.destroy();
    }
    var ctx_dia = document.getElementById("canvas_dia").getContext("2d");
    $("#canvas_dia").html("");
    window.dia = new Chart(ctx_dia, config_dia);

    if (window.dia2 instanceof Chart) {
      window.dia2.destroy();
    }
    var ctx_dia2 = document.getElementById("canvas_dia2").getContext("2d");
    $("#canvas_dia2").html("");
    window.dia2 = new Chart(ctx_dia2, config_dia);

    config_dia_watts = graficoDash(
      data,
      "Energia gerada (kW) ",
      energy,
      `Produção diaria ${inicio} - ${fim}`,
      "Dia",
      "Produção diaria",
      (type = "bar"),
      (infos = infos),
      backgroundColor = "#4169E1"
    );

    if (window.dia_watts instanceof Chart) {
      window.dia_watts.destroy();
    }
    var ctx_dia_watts = document
      .getElementById("canvas_dia_watts")
      .getContext("2d");
    $("#canvas_dia_watts").html("");
    window.dia_watts = new Chart(ctx_dia_watts, config_dia_watts);

    if (window.dia_watts2 instanceof Chart) {
      window.dia_watts2.destroy();
    }
    var ctx_dia_watts2 = document
      .getElementById("canvas_dia_watts2")
      .getContext("2d");
    $("#canvas_dia_watts2").html("");
    window.dia_watts2 = new Chart(ctx_dia_watts2, config_dia_watts);

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
      `Níveis de radiação (kW-hr/m^2)`,
      irradianceAno,
      `Níveis de radiação solar ultimos 5 anos ${dia_inicio}/${mes} - ${dia_fim}/${mes_fim}`,
      "Ano",
      "Produção diaria",
      (type = "bar"),
      (infos = {}),
      backgroundColor = "#008080"
    );

    if (window.anoS instanceof Chart) {
      window.anoS.destroy();
    }
    $("#canvas_ano").html("");
    var ctx_ano = document.getElementById("canvas_ano").getContext("2d");
    window.anoS = new Chart(ctx_ano, config_ano);

    if (window.ano2 instanceof Chart) {
      window.ano2.destroy();
    }
    var ctx_ano2 = document.getElementById("canvas_ano2").getContext("2d");
    $("#canvas_ano2").html("");
    window.ano2 = new Chart(ctx_ano2, config_ano);

    config_ano_watts2 = graficoDash(
      dataAno,
      `Produção (KWh)`,
      energyAno,
      `Produção mensal dos ultimos 5 anos ${dia_inicio}/${mes} - ${dia_fim}/${mes_fim}`,
      "Ano",
      "Produção diaria",
      (type = "bar"),
      (infos = {}),
      backgroundColor = "#008000"
    );

    if (window.ano_watts instanceof Chart) {
      window.ano_watts.destroy();
    }
    var ctx_anos_watts = document
      .getElementById("canvas_ano_watts")
      .getContext("2d");
    $("#canvas_ano_watts").html("");
    window.ano_watts = new Chart(ctx_anos_watts, config_ano_watts2);

    if (window.ano_watts2 instanceof Chart) {
      window.ano_watts2.destroy();
    }
    var ctx_anos_watts2 = document
      .getElementById("canvas_ano_watts2")
      .getContext("2d");
    $("#canvas_ano_watts2").html("");
    window.ano_watts2 = new Chart(ctx_anos_watts2, config_ano_watts2);

    title = `Dados de Irradiação Solar `;
    $("#table_relatorio").DataTable({
      dom: "Bfrtip",
      buttons: [
        { extend: "copyHtml5", footer: true, text: "Copiar" },
        {
          extend: "excelHtml5",
          footer: true,
        },
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
    $("#graficos").show();
  }
}

$(document).ready(function () {
  $("#graficos").hide();
});
