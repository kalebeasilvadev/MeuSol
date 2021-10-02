(()=> {
    $("#menu").append(`<div id="menuPrevisaodoTempo">
            <div id="menuPrevisaodoTempoLabel">
                <span
                    href="#menuPrevisaodoTempoItens"
                    data-toggle="collapse"
                    aria-expanded="false"
                    onclick="chamaPage('previsao/previsao.html','#index-pages')"
                    class="bg-primary list-group-item list-group-item-action seta"
                    ><div class="d-flex align-items-center text-white">
                        <span class="fas fa-sun mr-3"></span
                        ><span class="menu-collapsed texto-menu"
                            >Previsao do Tempo</span
                        >
                    </div></span
                >
            </div>
            <div id="menuPrevisaodoTempoItens" class="collapse sidebar-submenu"></div>
        </div>
        <div id="menuHistorico">
        <div id="menuHistoricoLabel">
            <span
                href="#menuHistoricoItens"
                data-toggle="collapse"
                aria-expanded="false"
                onclick="chamaPage('historico/historico.html','#index-pages')"
                class="bg-primary list-group-item list-group-item-action seta"
                ><div class="d-flex align-items-center text-white">
                    <span class="fas fa-list mr-3"></span
                    ><span class="menu-collapsed texto-menu">Historico</span>
                </div></span
            >
        </div>
        <div id="menuHistoricoItens" class="collapse sidebar-submenu"></div>
    </div>`)
})();