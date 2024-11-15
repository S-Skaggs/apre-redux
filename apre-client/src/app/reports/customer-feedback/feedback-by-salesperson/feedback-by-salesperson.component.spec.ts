import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeedbackBySalespersonComponent } from './feedback-by-salesperson.component';

describe('FeedbackBySalespersonComponent', () => {
  let component: FeedbackBySalespersonComponent;
  let fixture: ComponentFixture<FeedbackBySalespersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FeedbackBySalespersonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackBySalespersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Default test to see if component is created
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test for the proper title
  it('should display the title "Feedback by Salesperson"', () => {
    // Create a reference to the component's element
    const compiled = fixture.nativeElement;
    // Create a reference to the title which is an h1 tag
    const titleElement = compiled.querySelector('h1');

    // Expect the titleElement to exist
    expect(titleElement).toBeTruthy();
    // Expect the title element's text content to contain 'Feedback by Salesperson'
    expect(titleElement.textContent).toContain('Feedback by Salesperson');
  });

  // Test that the salesperson select element has a default value of null
  it('should default to a null value for the salesperson select element', () => {
    // Create a reference to the salesperson select element
    const salesPersonSelect = component.salespersonForm.controls['salesPerson'];

    // Expect the value to be null
    expect(salesPersonSelect.value).toBeNull();
    // Expect the salesperson control to be invalid
    expect(salesPersonSelect.valid).toBeFalse();
  });

  // Test that the form is not submitted if there is no selected salesperson
  it('should not submit if no salesperson is selected', () => {
    // Create a spy on the onSubmit function
    spyOn(component, 'onSubmit').and.callThrough();

    // Create a reference to the component's element
    const compiled = fixture.nativeElement;

    // Create a reference to the form's submit button
    const submitButton = compiled.querySelector('.form__actions button');

    // Simulate submitting
    submitButton.click();

    // Expect onSubmit to have been called
    expect(component.onSubmit).toHaveBeenCalled();
    // Expect the form to be invalid since we did not select a salesperson
    expect(component.salespersonForm.valid).toBeFalse();
  });
});
