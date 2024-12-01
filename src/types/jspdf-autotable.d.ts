declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface AutoTableSettings {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid' | 'always';
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableWidth?: 'auto' | 'wrap' | number;
    theme?: 'striped' | 'grid' | 'plain';
    styles?: {
      font?: string;
      fontStyle?: string;
      fontSize?: number;
      cellPadding?: number;
      lineColor?: number[];
      lineWidth?: number;
      fontColor?: number[];
      fillColor?: number[];
    };
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: {
      [key: number]: any;
    };
  }

  interface UserOptions extends AutoTableSettings {
    columns?: (string | number)[];
    columnStyles?: { [key: string]: any };
  }

  function autoTable(doc: jsPDF, options: UserOptions | AutoTableSettings): void;
  
  export default autoTable;
}
