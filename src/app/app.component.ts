import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {AgGridAngular} from "ag-grid-angular";
import {AlphaVantageService} from "./services/alpha-vantage.service";
import {HttpClientModule} from "@angular/common/http";
import {HighchartsChartModule} from "highcharts-angular";
import Highcharts from 'highcharts';
import {GridOptions} from "ag-grid-community";
import {formatData, formatDate} from "./helper";
import {MatDialog} from "@angular/material/dialog";
import {StockModalComponent} from "./components/stock-modal.component";
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, AgGridAngular, HttpClientModule, HighchartsChartModule, StockModalComponent],
    providers: [AlphaVantageService],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    @ViewChild('agGrid') agGrid: AgGridAngular;

    Highcharts: typeof Highcharts = Highcharts;
    chartOptions1 = null;
    chartOptions2 = null;
    chartOptions3 = null;
    gridOptions: GridOptions = {
        columnDefs: [
            {
                headerName: 'Date',
                field: 'date',
                flex: 1,
                filter: 'agDateColumnFilter',
                filterParams: {
                    comparator: (filterLocalDateAtMidnight, cellValue) => {
                        const cellDate = new Date(cellValue);
                        const filterDate = new Date(filterLocalDateAtMidnight);
                        if (cellDate.getTime() < filterDate.getTime()) {
                            return -1;
                        } else if (cellDate.getTime() > filterDate.getTime()) {
                            return 1;
                        } else {
                            return 0;
                        }
                    },
                    suppressAndOrCondition: true,
                    browserDatePicker: true,
                    minValidYear: 1900,
                    inRangeInclusive: true
                },
                valueFormatter: (params) => formatDate(params.value),
                headerCheckboxSelection: true,
                checkboxSelection: true,
                showDisabledCheckboxes: true,
            },
            {
                headerName: 'AAPL',
                field: 'AAPL',
                flex: 1,
                filter: 'agNumberColumnFilter',
                filterParams: {suppressAndOrCondition: true}
            },
            {
                headerName: 'MSFT',
                field: 'MSFT',
                flex: 1,
                filter: 'agNumberColumnFilter',
                filterParams: {suppressAndOrCondition: true}
            },
            {
                headerName: 'GOOGL',
                field: 'GOOGL',
                flex: 1,
                filter: 'agNumberColumnFilter',
                filterParams: {suppressAndOrCondition: true}
            }
        ],
        defaultColDef: {
            flex: 1,
            minWidth: 100,
        },
        rowSelection: "multiple",
        suppressRowClickSelection: true,
    };

    rowData: any[] = [];

    constructor(private alphaVantageService: AlphaVantageService, private dialog: MatDialog) {
    }

    ngOnInit() {
        const symbols = ['AAPL', 'MSFT', 'GOOGL'];
        this.alphaVantageService.getMultipleTimeSeries(symbols).subscribe(dataArray => {
            const rowData: any[] = [];
            const dates = Object.keys(dataArray[0]).slice(0, 10);
            dates.forEach(date => {
                const row = {date: `${new Date(date).toISOString().split('T')[0]} 00:00:00`};
                symbols.forEach((symbol, index) => {
                    row[symbol] = parseFloat(dataArray[index][date]['4. close']);
                });
                rowData.push(row);
            });

            this.rowData = rowData;

            this.agGrid.api.setRowData(this.rowData);
            this.updateChartOptions(dataArray);
        });
    }

    get isAnyRowSelected() {
      return !!this.agGrid?.api.getSelectedRows().length
    }

    updateChartOptions(dataArray: any[]) {
        const symbols = ['AAPL', 'MSFT', 'GOOGL'];

        dataArray.forEach((data, index) => {
            const chartData = formatData(data);
            const chartOptions = {
                series: [{
                    type: 'line',
                    data: chartData,
                    name: symbols[index],
                    events: {
                        click: (event) => this.onPointClick(event)
                    }
                }],
                title: {
                    text: `${symbols[index]} Stock Price`
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: 'Price'
                    }
                }
            };

            if (index === 0) {
                this.chartOptions1 = chartOptions;
            } else if (index === 1) {
                this.chartOptions2 = chartOptions;
            } else if (index === 2) {
                this.chartOptions3 = chartOptions;
            }
        });
    }

    onPointClick(event) {
        const clickedDate = new Date(event.point.x).toISOString().split('T')[0];
        this.agGrid.api.setFilterModel({
            date: {
                type: 'equals',
                dateFrom: clickedDate
            }
        });
        this.agGrid.api.onFilterChanged();
    }

    openModal() {
        this.dialog.open(StockModalComponent, {
            width: '600px',
            data: {}
        });
    }

  exportSelectedRowsToExcel() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);

    const worksheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SelectedRows');

    XLSX.writeFile(workbook, 'selected_rows.xlsx');
  }
}
