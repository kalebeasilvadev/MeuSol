(() => {
    data = http.request({
        path: "api/historico/",
    });
    if (data?.status == "success") {
        dados = data.data;
        $("#dadoshistorico").html("");
        dados.map((item) => {
            dataTime = item.data;
            nomeModal = item.data
                .replaceAll("/", "_")
                .replaceAll("as", "_")
                .replaceAll(":", "_")
                .replace(/\s/g, "");
            let html = `<div class="col-sm-3 mt-2" >
                            <div class="card border-left-primary shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                ${dataTime}</div>
                                            <div class="h6 mb-0 font-weight-bold text-gray-800">${item.cidade}</div>
                                            </div>
                                            <div>
                                                <button onclick='modal("#modal_${nomeModal}")' type="button" class="btn  btn-outline-info btn-sm" >Detalhar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="modal_${nomeModal}" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="modal_title">${item.cidade}</h5>
                                        <button type="button" class="close" onclick='modalClose("#modal_${nomeModal}")' aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <div class="container-fluid row" id="modal_text_${nomeModal}"></div>
                                        <div class="modal-footer" id='modal_footer'>
                                            <button type="button" class="btn btn-secondary" onclick='modalClose("#modal_${nomeModal}")'>sair</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
            $("#dadoshistorico").append(html);
            montaCards(item, nomeModal);
        });
    }
})();
