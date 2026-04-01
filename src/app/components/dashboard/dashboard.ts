import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MeasurementService, UNIT_DATA } from '../../services/measurement';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  unitData = UNIT_DATA;
  objectKeys = Object.keys;
  
  currentType = 'length';
  currentAction = 'comparison';
  unsupportedArithmeticTypes = ['temperature'];

  availableUnits: string[] = [];
  
  value1: number = 1;
  unit1: string = '';
  value2: number | string = 1000;
  unit2: string = '';
  targetUnit: string = '';

  message = '';
  isSuccess = false;

  constructor(private measurementService: MeasurementService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.populateUnits();
  }

  getIcon(type: string): string {
    const icons: any = {
      length: '📏', weight: '⚖️', temperature: '🌡️', volume: '🧊',
      angle: '📐', area: '⬛', energy: '⚡', power: '🔋',
      pressure: '🎈', speed: '🏎️', time: '⏱️'
    };
    return icons[type] || '📏';
  }

  selectType(type: string) {
    this.currentType = type;
    if (this.unsupportedArithmeticTypes.includes(type) && this.currentAction === 'arithmetic') {
      this.currentAction = 'comparison';
    }
    this.populateUnits();
    this.message = '';
  }

  selectAction(action: string) {
    this.currentAction = action;
    this.message = '';
    if (action === 'conversion') {
      this.value2 = '';
    }
  }

  populateUnits() {
    this.availableUnits = this.unitData[this.currentType];
    this.unit1 = this.availableUnits[0];
    this.unit2 = this.availableUnits.length > 1 ? this.availableUnits[1] : this.availableUnits[0];
    this.targetUnit = this.availableUnits[0];
  }

  get isConversion() { return this.currentAction === 'conversion'; }
  
  get fromLabel() {
    if (this.currentAction === 'comparison') return 'COMPARE';
    if (this.currentAction === 'conversion') return 'FROM';
    return 'OPERAND 1';
  }

  get toLabel() {
    if (this.currentAction === 'comparison') return 'WITH';
    if (this.currentAction === 'conversion') return 'TO';
    return 'OPERAND 2';
  }

  get operationIcon() {
    if (this.currentAction === 'comparison') return '=?';
    if (this.currentAction === 'conversion') return '➔';
    return '...';
  }

  get executeBtnText() {
    return this.currentAction === 'comparison' ? 'Compare' : 'Convert';
  }

  handleError(err: any) {
    if (err.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }
    this.message = err.error?.error || err.error?.Error || err.error?.message || err.message || 'Action failed';
    this.isSuccess = false;
  }

  executeAction() {
    this.message = '';
    if (this.value1 == null || isNaN(this.value1)) {
      this.message = 'Invalid value for the first operand.';
      this.isSuccess = false;
      return;
    }

    if (this.currentAction === 'conversion') {
      const body = {
        Source: { Value: this.value1, Unit: this.unit1, MeasurementType: this.currentType },
        TargetUnit: this.unit2
      };
      this.measurementService.convert(body).subscribe({
        next: (res: any) => {
          this.value2 = res.value;
          this.message = 'Conversion successful!';
          this.isSuccess = true;
        },
        error: (err) => this.handleError(err)
      });
    } else if (this.currentAction === 'comparison') {
      const v2 = Number(this.value2);
      if (this.value2 == null || isNaN(v2)) {
        this.message = 'Invalid value for second operand.';
        this.isSuccess = false;
        return;
      }
      const body = {
        Quantity1: { Value: this.value1, Unit: this.unit1, MeasurementType: this.currentType },
        Quantity2: { Value: v2, Unit: this.unit2, MeasurementType: this.currentType }
      };
      this.measurementService.compare(body).subscribe({
        next: (res: any) => {
          this.message = res.areEqual ? 'The quantities are Equal.' : 'The quantities are Not Equal.';
          this.isSuccess = res.areEqual;
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  executeArithmetic(operation: string) {
    this.message = '';
    const v2 = Number(this.value2);
    if (this.value1 == null || isNaN(this.value1) || this.value2 == null || isNaN(v2)) {
      this.message = 'Invalid operand values.';
      this.isSuccess = false;
      return;
    }
    
    const body = {
        Quantity1: { Value: this.value1, Unit: this.unit1, MeasurementType: this.currentType },
        Quantity2: { Value: v2, Unit: this.unit2, MeasurementType: this.currentType },
        TargetUnit: this.targetUnit
    };

    this.measurementService.arithmetic(operation, body).subscribe({
      next: (res: any) => {
        this.message = `Result: ${res.value} ${res.unit}`;
        this.isSuccess = true;
      },
      error: (err) => this.handleError(err)
    });
  }
}
