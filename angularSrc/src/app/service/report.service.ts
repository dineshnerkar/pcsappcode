import { Injectable } from '@angular/core';
import { REPORT_EXPORT_CONSTANTS } from 'src/app/constants/report-export-constants';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { DatePipe } from '@angular/common';


@Injectable({ providedIn: 'root' }) export class ReportService {
    constructor(private datePipe: DatePipe) { }

    private pad(num, size): string {
        var s = "00" + num;
        return s.substr(s.length - size);
    }

    public getReportDateWithTime(dat: string): string {
        if (dat && dat.length > 0) {
            const date = new Date(dat);
            let hours = date.getHours();
            hours = hours % 12;
            hours = hours ? hours : 12;
            return `${this.pad(date.getDate(), 2)}/${this.pad(date.getMonth() + 1, 2)}/${date.getFullYear()}, ${this.pad(hours, 2)}:${this.pad(date.getMinutes(), 2)}:${this.pad(date.getSeconds(), 2)} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
        } else {
            return '-';
        }
    }
    public getReportDateWithOutTime(dat: string): string {
        if (dat && dat.length > 0) {
            const date = new Date(dat);
            return `${this.pad(date.getDate(), 2)}/${this.pad(date.getMonth() + 1, 2)}/${date.getFullYear()}`;
        } else {
            return '-';
        }
    }

    exportTableAsPdf(tableContent: any, columnWidths: string[], reportTitle?: string, reportFileTitle?: string, pageWidth = 1200, pageHeight = 800) {
        const docDefinition = {
            info:
            {
                title: reportFileTitle || REPORT_EXPORT_CONSTANTS.PDF.META.TITLE
            }, pageSize: { width: pageWidth, height: pageHeight },
            content: [
                {
                    columns:
                        [{
                            text: reportTitle || REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.TITLE.TEXT,
                            alignment: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.TITLE.ALIGNMENT,
                            fontSize: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.TITLE.FONT_SIZE,
                            margin: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.TITLE.MARGIN,
                            bold: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.TITLE.BOLD, color: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.TITLE.COLOR
                        }, {
                            text: this.datePipe.transform(new Date(), REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.DATE.FORMAT), alignment: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.DATE.ALIGNMENT,
                            fontSize: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.DATE.FONT_SIZE,
                            italics: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.DATE.ITALICS,
                            color: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.DATE.COLOR
                        }]
                },
                {
                    canvas:
                        [{
                            type: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.HORIZONTAL_RULER.TYPE, x1: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.HORIZONTAL_RULER.X1, y1: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.HORIZONTAL_RULER.Y1, x2: pageWidth - 2 * 40, y2: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.HORIZONTAL_RULER.Y2, lineWidth: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.HORIZONTAL_RULER.LINE_WIDTH,
                            color: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.HORIZONTAL_RULER.COLOR
                        }],
                    margin: REPORT_EXPORT_CONSTANTS.PDF.CONTENT.HEADER.HORIZONTAL_RULER.MARGIN
                }, { layout: 'reportTableLayout', table: { headerRows: 1, widths: columnWidths, body: tableContent } }]
        };
        pdfMake.tableLayouts = {
            reportTableLayout: {
                hLineWidth: () => REPORT_EXPORT_CONSTANTS.PDF.CONTENT.TABLE.BODY.HORIZONTAL_LINE_WIDTH,
                vLineWidth: () => REPORT_EXPORT_CONSTANTS.PDF.CONTENT.TABLE.BODY.VERTICAL_LINE_WIDTH, hLineColor: () => REPORT_EXPORT_CONSTANTS.PDF.CONTENT.TABLE.BODY.HORIZONTAL_LINE_COLOR,
                vLineColor: () => REPORT_EXPORT_CONSTANTS.PDF.CONTENT.TABLE.BODY.VERTICAL_LINE_COLOR,
                paddingLeft: () => REPORT_EXPORT_CONSTANTS.PDF.CONTENT.TABLE.BODY.PADDING_LEFT, paddingRight: () => REPORT_EXPORT_CONSTANTS.PDF.CONTENT.TABLE.BODY.PADDING_RIGHT,
                fillColor: (i) => { return (i === 0) ? REPORT_EXPORT_CONSTANTS.PDF.CONTENT.TABLE.HEADER.FILL_COLOR : null; }
            }
        };
        pdfMake.createPdf(docDefinition).download(REPORT_EXPORT_CONSTANTS.PDF.DOCUMENT.FILE_NAME);
    }

}