import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChartComponent } from '../../../shared/chart/chart.component';

@Component({
  selector: 'app-feedback-by-salesperson',
  standalone: true,
  imports: [ChartComponent, ReactiveFormsModule],
  template: `
    <h1>Feedback by Salesperson</h1>
    <div class="salesperson-container">
      <form class="form" [formGroup]="salespersonForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="salesPerson">Salesperson</label>
          <select class="select" formControlName="salesPerson" id="salesPerson" name="salesPerson">
            @for(salesperson of salesPeople; track salesperson) {
              <option value="{{ salesperson }}">{{ salesperson }}</option>
            }
          </select>
        </div>
        <div class="form__actions">
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>

      @if(feedbackData.length > 0) {
        <div class="card chart-card">
          <app-chart [type]="'pie'" [label]="chartLabel" [data]="feedbackValues" [labels]="feedbackLabels"></app-chart>
        </div>
      }
    </div>
  `,
  styles: `
    .salesperson-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
      padding: 10px;
    }
  `
})
export class FeedbackBySalespersonComponent  implements OnInit {
  // Create variables
  chartLabel: string = ''; // Variable to hold the chart's title
  feedbackValues: any[] = []; // Variable to hold the feedback values
  feedbackData: any[] = []; // Array to hold feedback data
  feedbackLabels: string[] = []; // Variable to hold the feedback labels
  salesPeople: string[] = []; // Sales people from the database
  selectedSalesPerson: string | null = null; // Selected salesperson from the control
  reportTitle: string = ''; // Report title, constructed in the submit function.

  // Create a form group
  salespersonForm = this.fb.group({
    salesPerson: [null, Validators.compose([Validators.required])]
  });

  // Constructor to handle initial setup and dependency injection
  constructor(private http: HttpClient, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.loadSalesPeople();
  }

  /**
   * @description
   *
   * Function to load the sales people.
   */
  loadSalesPeople() {
    // Populate the salesPeople variable from the database
    this.http.get(`${environment.apiBaseUrl}/reports/customer-feedback/salespeople`).subscribe({
      next: (data: any) => {
        this.salesPeople = data;
      },
      error: (err) => {
        console.error('Error fetching sales people:', err);
      }
    });
  }

  /**
   * @description
   *
   * onSubmit function to handle form action to generate a report.
   * This should not execute if there is no selected salesperson
   */
  onSubmit() {
    // Get the selected salesperson
    this.selectedSalesPerson = this.salespersonForm.controls['salesPerson'].value;

    // Clear array data
    this.feedbackValues = [];
    this.feedbackLabels = [];

    // Query the database for report data
    this.http.get(`${environment.apiBaseUrl}/reports/customer-feedback/feedback-by-salesperson/${this.selectedSalesPerson}`).subscribe({
      next: (data: any) => {
        this.feedbackData = data;
        // Populate arrays from the returned data, if there is any
        if(this.feedbackData.length > 0) {
          // Cycle through the data to populate the arrays for the chart
          for(let i = 0; i < this.feedbackData.length; i++) {
            this.feedbackValues.push(this.feedbackData[i].totalSales);
            this.feedbackLabels.push(this.feedbackData[i].channelName + ' Total Sales');
            this.feedbackValues.push(this.feedbackData[i].averageRating);
            this.feedbackLabels.push(this.feedbackData[i].channelName + ' Average Rating');
          }
        }

        // Construct the report title
        this.reportTitle = "Feedback by Salesperson - " + this.selectedSalesPerson;

        // Construct the chart label
        this.chartLabel = "Feedback for " + this.selectedSalesPerson;

        console.log('Feedback data:', this.feedbackData);
      },
      error: (err) => {
        console.error('Error fetching feedback data:', err);
      }
    });
  }
}
