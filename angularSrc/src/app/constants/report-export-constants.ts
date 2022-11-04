export const REPORT_EXPORT_CONSTANTS = {
    PDF: {
        DOCUMENT:{ FILE_NAME: 'Report.pdf' },
        PAGE: { WIDTH: 1200, HEIGHT: 800 },
        META: { TITLE: 'IRIS Report' },
        CONTENT: {
            LOGO:
                { WIDTH: 200, HEIGHT: 75 },
            HEADER: {
                TITLE:
                {
                    TEXT: 'PROJECT REPORT',
                    ALIGNMENT: 'right',
                    FONT_SIZE: 25,
                    MARGIN: [0, 20, 0, 0], BOLD: true,
                    COLOR: '#555'
                }, DATE: {
                    FORMAT: 'dd-MMM-yy hh:mm:ss a',
                    ALIGNMENT: 'right', FONT_SIZE: 10,
                    ITALICS: true, COLOR: '#666'
                },
                HORIZONTAL_RULER: {
                    TYPE: 'line', X1: 0, Y1: 5, Y2: 5,
                    LINE_WIDTH: 1, COLOR: '#888',
                    MARGIN: [0, 0, 0, 15]
                }
            },
            TABLE: {
                HEADER: {
                    ROW_COUNT: 1,
                    FILL_COLOR: '#fae716'
                },
                BODY: {
                    HORIZONTAL_LINE_WIDTH: 1,
                    VERTICAL_LINE_WIDTH: 1,
                    HORIZONTAL_LINE_COLOR: '#aaa',
                    VERTICAL_LINE_COLOR: '#aaa',
                    PADDING_LEFT: 6,
                    PADDING_RIGHT: 6,
                }
            }
        }
    }
}