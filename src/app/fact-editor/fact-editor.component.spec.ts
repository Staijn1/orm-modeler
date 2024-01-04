import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactEditorComponent } from './fact-editor.component';

describe('FactEditorComponent', () => {
  let component: FactEditorComponent;
  let fixture: ComponentFixture<FactEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FactEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
