import { Component } from '@angular/core';
import { UploaderService } from './uploader.service';
import {
  FileSystemFileEntry,
  NgxFileDropEntry,
  NgxFileDropModule,
} from 'ngx-file-drop';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import ProductParser from './data.parser';
import { Product } from './product.model';

@Component({
  selector: 'app-root',
  imports: [NgxFileDropModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  excelData: any[] = [];
  headers: string[] = [];
  selectedFile: File | null = null;
  extractedData: Product[] = [];

  constructor(private excelService: UploaderService) {}

  onFileDropped(files: NgxFileDropEntry[]) {
    const fileEntry = files[0].fileEntry as FileSystemFileEntry;
    fileEntry.file((file) => this.processExcelFile(file));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processExcelFile(file);
    }
  }

  private processExcelFile(file: File) {
    this.selectedFile = file;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rawData = XLSX.utils.sheet_to_json(worksheet);
      console.log('Raw data :', rawData);
      this.excelData = this.formatDates(rawData);
      for (let i = 0; i < this.excelData.length; i++) {
        const element = this.excelData[i];
        const parsedProduct = ProductParser(element);
        if (parsedProduct) {
          this.extractedData.push(parsedProduct);
        }
        console.log(parsedProduct);
      }
      this.extractedData = this.removeDuplicateByName(this.extractedData);
      this.extractedData = this.removeHeaderDataFromExtractedData(
        this.extractedData
      );
      this.headers = Object.keys(this.excelData[0] || {});
    };

    reader.readAsArrayBuffer(file);
  }

  private formatDates(data: any[]): any[] {
    return data.map((row) => {
      const formattedRow = { ...row };
      ['UpdatedOn', 'updated_on'].forEach((key) => {
        if (this.isDate(formattedRow[key])) {
          formattedRow[key] = this.formatDate(formattedRow[key]);
        }
      });
      return formattedRow;
    });
  }

  private removeDuplicateByName(products: Product[]): Product[] {
    const checked = new Set();
    return products.filter((item) => {
      const key = item.name;
      if (key === undefined) {
        return false;
      }
      if (checked.has(key)) {
        return false;
      }
      checked.add(key);
      return true;
    });
  }

  private removeHeaderDataFromExtractedData(products: Product[]): Product[] {
    return products.filter((product) => {
      return product.name !== 'name';
    });
  }

  private isDate(value: any): boolean {
    return !isNaN(Date.parse(value));
  }

  private formatDate(value: any): string {
    const date = new Date(value);
    return date.toISOString().split('T')[0];
  }

  uploadExcel() {
    if (this.selectedFile) {
      this.excelService.uploadData(this.extractedData).subscribe((response) => {
        console.log('Data sent successfully', response);
      });
    }
  }
}
