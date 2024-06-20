import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { AlphaVantageService } from '../services/alpha-vantage.service';
import Highcharts from 'highcharts';
import {formatData} from "../helper";
import {MatFormField} from "@angular/material/form-field";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {HighchartsChartModule} from "highcharts-angular";
import {NgIf} from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-stock-modal',
  templateUrl: './stock-modal.component.html',
  imports: [
    MatDialogContent,
    MatFormField,
    FormsModule,
    HighchartsChartModule,
    MatDialogActions,
    NgIf,
    MatDialogTitle,
    ReactiveFormsModule
  ],
  providers:[AlphaVantageService]
})
export class StockModalComponent {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: any = null;
  symbol = new FormControl<string>(null, [Validators.required]);

  constructor(
    private dialogRef: MatDialogRef<StockModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private alphaVantageService: AlphaVantageService
  ) {}

  fetchStockData() {
    this.alphaVantageService.getTimeSeries(this.symbol.value).subscribe(data => {
      const chartData = formatData(data);
      this.chartOptions = {
        series: [{
          type: 'line',
          data: chartData,
          name: this.symbol.value
        }],
        title: {
          text: `${this.symbol.value} Stock Price`
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
    });
  }

  close() {
    this.dialogRef.close();
  }

  get symbolFieldValid(): boolean{
    return this.symbol.valid;
  }
}
