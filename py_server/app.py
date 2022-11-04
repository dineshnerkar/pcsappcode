import os

from pdfrw import PdfReader, PdfWriter, PageMerge, PdfDict, PdfObject
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.pagesizes import A4, LETTER, landscape, portrait

from flask import Flask, request, jsonify
from config import BASE_DIR, DEBUG, PORT, APP_URL, NODE_DIR
from waitress import serve

app = Flask(__name__)

@app.route('/pyApi/getFormFields', methods=['POST'])
def get_form_filed():
    content = request.get_json(force=True)
    pdfpath = os.path.normpath(os.path.join(NODE_DIR + "/formFiledTemplate/" + content['path']))
    overlayDoc = PdfReader(pdfpath)
    filedlist = {}
    for field in overlayDoc.Root.AcroForm.Fields:
        #print(field)
        filedlist[field.T.strip("()") if field.T else field.T] = field.V.strip(
            "()") if field.V else field.V
    return jsonify(filedlist)

@app.route('/pyApi/getPDFPageCount', methods=['POST'])
def get_pdf_page_count():
    content = request.get_json(force=True)
    pdfpath = os.path.normpath(os.path.join(NODE_DIR + "/docs/" + content['path']))
    pdfDoc = PdfReader(pdfpath)
    filedlist = {}
    filedlist["pageCount"] = len(pdfDoc.pages)
    return jsonify(filedlist)


def getFont(f):
    return 'Helvetica'


@app.route('/pyApi/overlayDocument', methods=['POST'])
def overlay_doc():
    content = request.get_json(force=True)
    baseDoc = PdfReader(NODE_DIR + "/docs/" + content['basePath'])
    outputFileName = content['name']
    dataDict = content['formFields']
    overlayDocs = content['templatePath']

    for doc in overlayDocs:
        overlayDoc = PdfReader(NODE_DIR + "/templates/" + doc)
        for field in overlayDoc.Root.AcroForm.Fields:
            if field.T.strip("()") in dataDict:
                field.DV = dataDict[field.T.strip("()")]

        overlayDoc.Root.AcroForm.update(PdfDict(NeedAppearances=PdfObject('true')))

        flatObjs = []
        for i, page in enumerate(overlayDoc.pages):
            flatObjs = []
            for annot in page.Annots:
                if annot['/Parent'] is not None:
                    if '/DV' in annot['/Parent'] and annot['/Parent']['/DV'] is not None:
                        arr = annot['/Parent']['/DA'].strip("()").split()
                        flatObjs.append({"rect": annot['/Rect'],
                                        "value": annot['/Parent']['/DV'].strip("()"),
                                        "font": getFont(arr[0]), "fontSize": arr[1], "color": [arr[3], arr[4], arr[5]],
                                        "mk": annot['/MK']})
            pageWidth = 612
            if (page.MediaBox == ['0.0', '792.0', '612.0', '0.0'] or page.MediaBox == ['0.0', '0.0', '612.0', '792.0'] ) and page.Rotate == '0':
                canvas = Canvas(BASE_DIR+"/LetterPortrait.pdf",
                                pagesize=portrait(LETTER))
            if (page.MediaBox == ['0.0', '792.0', '612.0', '0.0'] or page.MediaBox == ['0.0', '0.0', '612.0', '792.0'] ) and (page.Rotate == '270' or page.Rotate == '-90'):
                canvas = Canvas(BASE_DIR+"/LetterLandscape.pdf",
                                pagesize=landscape(LETTER))
                pageWidth = 792
            if page.MediaBox == ['0', '0', '595', '842'] and page.Rotate == '0':
                canvas = Canvas(BASE_DIR+"/A4Portrait.pdf", pagesize=portrait(A4))
                pageWidth = 595
            if page.MediaBox == ['0', '0', '595', '842'] and (page.Rotate == '270' or page.Rotate == '-90'):
                canvas = Canvas(BASE_DIR+"/A4Landscape.pdf",
                                pagesize=landscape(A4))
                pageWidth = 842

            for k in range(0, len(flatObjs)):

                if '/R' in flatObjs[k]['mk']:
                    effCanvRotate = float(
                        flatObjs[k]['mk']['/R']) - float(page.Rotate)
                else:
                    effCanvRotate = 0 - float(page.Rotate)

                if effCanvRotate == 360:
                    effCanvRotate = 0
                if effCanvRotate == -90:
                    effCanvRotate = 270
                if effCanvRotate == -180:
                    effCanvRotate = 180

                canvas.rotate(effCanvRotate)
                xcord = 0
                ycord = 0

                if '/R' not in flatObjs[k]['mk']:
                    if effCanvRotate == 90 or effCanvRotate == -270:
                        xcord = float(flatObjs[k]['rect'][0])
                        ycord = float(flatObjs[k]['rect'][1]) - pageWidth
                    else:
                        xcord = float(flatObjs[k]['rect'][0])
                        ycord = float(flatObjs[k]['rect'][1])
                elif float(flatObjs[k]['mk']['/R']) == 90:
                    xcord = float(flatObjs[k]['rect'][1])
                    ycord = -1*float(flatObjs[k]['rect'][0]) - 13

                elif float(flatObjs[k]['mk']['/R']) == 180 or float(flatObjs[k]['mk']['/R']) == -180:
                    xcord = -1 * float(flatObjs[k]['rect'][0])
                    ycord = -1*float(flatObjs[k]['rect'][1])
                elif float(flatObjs[k]['mk']['/R']) == 270 or float(flatObjs[k]['mk']['/R']) == -90:
                    if effCanvRotate == 0:
                        xcord = pageWidth - float(flatObjs[k]['rect'][1])
                        ycord = float(flatObjs[k]['rect'][0])
                    else:
                        xcord = -1 * float(flatObjs[k]['rect'][1])
                        ycord = float(flatObjs[k]['rect'][0])
                canvas.setFont(flatObjs[k]['font'], int(flatObjs[k]['fontSize']))
                canvas.setFillColorRGB(
                    flatObjs[k]['color'][0], flatObjs[k]['color'][1], flatObjs[k]['color'][2])
                canvas.drawString(xcord, ycord, flatObjs[k]['value'])
                canvas.rotate(-1 * effCanvRotate)
            canvas.save()

        x = len(dataDict["#pagesToPrint"])

        pagesToPrint = PdfWriter(BASE_DIR+"/temp1.pdf")
        if x > 0:
            for pagenum in dataDict["#pagesToPrint"]:
                pagesToPrint.addpage(baseDoc.pages[int(pagenum)])
        else:
            pagesToPrint.addpages(baseDoc.pages)

        pagesToPrint.write()
        printPages = PdfReader(BASE_DIR+"/temp1.pdf")

        for page in printPages.pages:
            if page.MediaBox == ['0', '0', '612', '792']:
                wmark = PageMerge().add(
                    PdfReader(BASE_DIR+"/LetterPortrait.pdf").pages[0])[0]
            elif page.MediaBox == ['0', '0', '792', '612']:
                wmark = PageMerge().add(
                    PdfReader(BASE_DIR+"/LetterLandscape.pdf").pages[0])[0]
            elif page.MediaBox == ['0', '0', '841.95', '595.35']:
                wmark = PageMerge().add(
                    PdfReader(BASE_DIR+"/A4Landscape.pdf").pages[0])[0]
            elif page.MediaBox == ['0', '0', '595.35', '841.95']:
                wmark = PageMerge().add(
                    PdfReader(BASE_DIR+"/A4Portrait.pdf").pages[0])[0]
            PageMerge(page).add(wmark, prepend=False).render()

        PdfWriter(NODE_DIR+"/output/"+outputFileName +
                ".pdf", trailer=printPages).write()
        baseDoc =  PdfReader(NODE_DIR+"/output/"+outputFileName +".pdf")

    return jsonify({"success": "true"})

if __name__ == '__main__':
    print(APP_URL)
    print(PORT)
    serve(app, host=APP_URL, port = PORT)
