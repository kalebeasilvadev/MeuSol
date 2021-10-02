function geraPdf() {
    var doc = new jspdf.jsPDF();
    tableHead = $("#table > thead > tr > th");
    tableBody = $("#table > tbody > tr");
    let head = [[]];
    let body = [];
    for (let x = 0; x < tableHead.length; x++) {
        const element = tableHead[x];
        head[0].push(element.outerText);
    }
    for (let x = 0; x < tableBody.length; x++) {
        const element = tableBody[x].children;
        let data = [];
        for (let a = 0; a < element.length; a++) {
            const elements = element[a];
            data.push(elements.outerText);
        }
        body.push(data);
    }
    doc.autoTable({ head: head, body: body });
    doc.autoTable({
        body: [
            [
                {
                    colSpan: 2,
                    rowSpan: 2,
                    theme: "striped",
                    styles: { halign: "center" },
                },
            ],
        ],
    });
    doc.save("table.pdf");
}

const switchAtiva = (codigo, value) => {
    if (value) {
        check = "checked";
    } else {
        check = "";
    }

    html = `<td  style='cursor:pointer'>
                     <div class="custom-control custom-switch">
                         <input type="checkbox" onclick='ativa_bico("${codigo}","switch${codigo}")' class="custom-control-input" id="switch${codigo}" ${check}>
                         <label class="custom-control-label" for="switch${codigo}"></label>
                     </div>
                 </td>`;
    return html;
};

const pagesTable = (len) => {
    return `<tr>
<th colspan="${len}" class="ts-pager">
    <div class="form-inline">
        <div
            class="btn-group btn-group-sm mx-1"
            role="group"
        >
            <button
                type="button"
                class="btn btn-secondary first"
                title="primeiro"
            >
                &#8676;
            </button>
            <button
                type="button"
                class="btn btn-secondary prev"
                title="voltar"
            >
                &larr;
            </button>
        </div>
        <span class="pagedisplay"></span>
        <div
            class="btn-group btn-group-sm mx-1"
            role="group"
        >
            <button
                type="button"
                class="btn btn-secondary next"
                title="avançar"
            >
                &rarr;
            </button>
            <button
                type="button"
                class="btn btn-secondary last"
                title="ultimo"
            >
                &#8677;
            </button>
        </div>
    </div>
</th>
</tr>`;
};
const createTable = ({
    thead = null,
    tbody = null,
    apoio = null,
    tfoot = null,
    element = null,
    deleta = true,
}) => {
    let atualiza = "";
    if (apoio?.atualiza) {
        atualiza = apoio.atualiza;
    }
    let posBody = [];
    let filter_cssFilter = [];
    let theadHtml = "<thead id='thead'><tr>";
    Object.keys(thead).map((key) => {
        let data = thead[key];
        posBody.push(data.target);
        filter_cssFilter.push("form-control");
        theadHtml += `<th data-priority="${data.priority}">${data.name}</th>`;
    });
    if (deleta) {
        filter_cssFilter.push("form-control");
        theadHtml += deleta
            ? '<th data-priority="critical" data-filter="false" data-sorter="false"></th>'
            : "";
    }
    theadHtml += "</tr></thead>";

    let tbodyHtml = "<tbody>";
    Object.keys(tbody).map((key) => {
        let data = tbody[key];
        tbodyHtml += "<tr>";
        posBody.map((elm) => {
            let funcao =
                atualiza != ""
                    ? `onclick='${apoio.atualiza}("${data[apoio.busca]}")'`
                    : "";
            if (apoio[elm]) {
                let dados = apoio[elm];
                let value = dados.data.find(
                    (value) => value[dados.find] == data[elm]
                );

                if (value != null) {
                    tbodyHtml += `<td  style='cursor:pointer' ${funcao}>${
                        value[dados.target]
                    }</td>`;
                } else {
                    tbodyHtml += `<td  style='cursor:pointer' ${funcao}></td>`;
                }
            } else if (elm == "ativo") {
                tbodyHtml += switchAtiva(data[apoio.busca], data[elm]);
            } else {
                if (data[elm] === true) {
                    tbodyHtml += `<td  style='cursor:pointer' ${funcao}>Sim</td>`;
                } else if (data[elm] === false) {
                    tbodyHtml += `<td  style='cursor:pointer' ${funcao}>Não</td>`;
                } else {
                    tbodyHtml += `<td  style='cursor:pointer' ${funcao}>${data[elm]}</td>`;
                }
            }
        });
        tbodyHtml += deleta
            ? `<td><i style='cursor:pointer' class="fas fa-minus-circle"  onclick='${
                  apoio.excluir
              }("${data[apoio.busca]}")'></i></td>`
            : "";
        tbodyHtml += "</tr>";
    });
    tbodyHtml += `</tbody>`;

    let tfootHtml = "<tfoot><tr>";
    Object.keys(thead).map((key) => {
        let data = thead[key];
        tfootHtml += `<th >${data.name}</th>`;
    });
    tfootHtml += deleta ? "<th></th>" : "";
    tfootHtml += `</tr>${pagesTable(filter_cssFilter.length)}</tfoot>`;

    let tableHtml = `<table id="table" class="table table-bordered table-striped">${theadHtml}${tbodyHtml}${tfootHtml}</table>`;
    $(element).append(tableHtml);
    $.tablesorter.language.button_print = "Print";
    $("#table")
        .tablesorter({
            theme: "bootstrap",

            widthFixed: true,
            widgets: [
                "filter",
                "columns",
                "zebra",
                "reflow",
                "print",
                "columnSelector",
            ],

            widgetOptions: {
                zebra: ["even", "odd"],
                columns: ["primary", "secondary", "tertiary"],
                filter_reset: ".reset",
                filter_cssFilter: filter_cssFilter,
                print_title: "", // this option > caption > table id > "table"
                print_dataAttrib: "data-name", // header attrib containing modified header name
                print_rows: "f", // (a)ll, (v)isible, (f)iltered, or custom css selector
                print_columns: "s", // (a)ll, (v)isible or (s)elected (columnSelector widget)
                print_extraCSS:
                    ".tableexport-caption{display:none} .ts-pager{display:none}", // add any extra css definitions for the popup window here
                print_now: true, // Open the print dialog immediately if true
                // callback executed when processing completes - default setting is null
                print_callback: function (config, $table, printStyle) {
                    console.log(printStyle);
                    ($.tablesorter.printTable.popupStyle = scrollbars = 1),
                        (resizable = 1);
                    $.tablesorter.printTable.printOutput(
                        config,
                        $table.html(),
                        printStyle
                    );
                },
            },
            columnSelector_container: $("#columnSelector"),
            columnSelector_name: "data-name",
            reflow_headerAttrib: "data-name",
        })
        .tablesorterPager({
            container: $(".ts-pager"),
            removeRows: false,
            size: 10,
            output: "{startRow} - {endRow} / {filteredRows} ({totalRows})",
        })
        .tableExport();

    $("caption[class='tableexport-caption']").append(
        "<button class='btn btn-info m-1' onclick='geraPdf()' id='pdf'>Pdf</button><button class='btn btn-info m-1' onclick='imprimir()' id='print'>Print</button>"
    );

    // if (deleta) {
    //     $(
    //         "#thead tr td input[class='tablesorter-filter form-control disabled']"
    //     ).remove();
    // }
};
