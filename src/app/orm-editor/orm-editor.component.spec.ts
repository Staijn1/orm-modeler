import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrmEditorComponent } from './orm-editor.component';

describe('OrmEditorComponent', () => {
  let component: OrmEditorComponent;
  let fixture: ComponentFixture<OrmEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrmEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrmEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
