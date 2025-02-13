import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UploaderService } from './uploader.service';
import {
  FileSystemFileEntry,
  NgxFileDropEntry,
  NgxFileDropModule,
} from 'ngx-file-drop';
import * as XLSX from 'xlsx';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import ProductParser from './data.parser';

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
      this.excelData = this.formatDates(rawData);
      for (let i = 0; i < this.excelData.length; i++) {
        const element = this.excelData[i];
        const t = ProductParser(element);
        console.log(t);
      }
      this.headers = Object.keys(this.excelData[0] || {});
    };

    reader.readAsArrayBuffer(file);
  }

  private formatDates(data: any[]): any[] {
    return data.map((row) => {
      const formattedRow = { ...row };
      Object.keys(formattedRow).forEach((key) => {
        if (this.isDate(formattedRow[key])) {
          formattedRow[key] = this.formatDate(formattedRow[key]);
        }
      });
      return formattedRow;
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
      this.excelService.uploadFile(this.selectedFile).subscribe((response) => {
        console.log('Fichier envoyé avec succès', response);
      });
    }
  }
}
