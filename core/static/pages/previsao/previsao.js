function busca() {
    cidade = $("#previsao_cidade").val();

    data = http.request({
        metodo: "POST",
        path: "api/buscaprevisao/",
        data: { cidade: cidade },
    });
    if (data?.status == "success") {
        dados = data.data;
        console.log(dados)
        if ( dados != "") {
            $("#dadosPrevisao").html("");
            $("#dadosPrevisaoCidade").html("").append(`
                <div class="card border-left-primary shadow h-100 w-100 py-2 align-items-center">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-12">
                                        <div class="text-xs font-weight-bold text-primary mb-1">
                                            ${cidade} Previsão dos próximos 5 dias</div>
                                    </div>
                                </div>
                            </div>
                            </div>`);
            nomeModal = dados.data
                .replaceAll("/", "_")
                .replaceAll("as", "_")
                .replaceAll(":", "_")
                .replace(/\s/g, "");
            montaCards(dados, nomeModal, $("#dadosPrevisao"));
        }else{
            alertas("Sem informação para essa cidade")
        }
    }
}
