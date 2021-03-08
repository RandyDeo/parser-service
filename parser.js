const PDFParser = require("pdf2json"); //https://www.npmjs.com/package/pdf2json

/**
 * @description receives the location of a pdf file and returns a promise which resolves with the parsed json data 
 * @param {String} fileBuffer the file stored in memory 
 */
async function getPDFText(fileBuffer){
    let json = await new Promise((resolve, reject) => {
        let pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataReady", pdfData => resolve(pdfData));
        pdfParser.on("pdfParser_dataError", errData => reject(errData));
        pdfParser.parseBuffer(fileBuffer);
    });
    
    let pdfText = [];

    for(let page of json['formImage']['Pages']){
        for(let text of page['Texts']){
            for(let rec of text['R']){
                let token = rec['T'];
                pdfText.push(token)
            }
        }
    }
    return pdfText;
}

/**
 * @param {String} token - Replaces uri encoding in the string given eg %2B => +
 */
function decode(token){
    token = token.replace(/\%2B/g, '+');
    token = token.replace(/\%20/g, ' ');
    return token;
}

 /**
  * 
  * @param {*} text - data retrieved from parsing with pdfParser and flattening with getPDFText()
  * @param {*} filename - name of file
  */
function getStudentData(text, filename){
    let inprogress = false;
    let comp_codes = ["2601", "2603", "2606", "2611", "3601", "3602", "3603", "3612", "3613"];
    let info_codes = ["3600", "3604"];
    let math_codes = ["2250"];
    let dupe_codes = ["2602", "2604", "2605", "3605", "3606", "3607", "3608", "3609", "3610", "3611"]
    let student = {
        id:undefined,
        gpa:undefined,
        fullname: undefined,

        comp2601: 'N/A',
        comp2602: 'N/A',
        comp2603: 'N/A',
        comp2604: 'N/A',
        comp2605: 'N/A',
        comp2606: 'N/A',
        comp2611: 'N/A',
        comp3601: 'N/A',
        comp3602: 'N/A',
        comp3603: 'N/A',
        comp3605: 'N/A',
        comp3606: 'N/A',
        comp3607: 'N/A',
        comp3608: 'N/A',
        comp3609: 'N/A',
        comp3610: 'N/A',
        comp3611: 'N/A',
        comp3612: 'N/A',
        comp3613: 'N/A',

        info2602: 'N/A',
        info2604: 'N/A',
        info2605: 'N/A',
        info3600: 'N/A',
        info3604: 'N/A',
        info3605: 'N/A',
        info3606: 'N/A',
        info3607: 'N/A',
        info3608: 'N/A',
        info3609: 'N/A',
        info3610: 'N/A',
        info3611: 'N/A',

        math2250: 'N/A',
        parsedText: undefined
    }

    if(filename)
        student.filename = filename;

    let i = 0;
    for(let token of text){

        if(token === "Record%20of%3A")
            student.fullname = decode(text[i-1])

        //reached the courses in progress section of transcript
        if(!inprogress && token === "In%20Progress%20Courses%3A"){
            inprogress = true;
        }

        if(token === "DEGREE%20GPA%20TOTALS"){
            student.gpa = text[i - 1]; 
        }

        if(token === "Record%20of%3A"){
            student.id = text[ i + 1]
        }

        //we want the grades of 4 specific courses
        if(comp_codes.includes(token)){
            // console.log(token, decode(text[i + 4]));
            //grade column is 4 cols after the course column
            if(!inprogress)
                student[`comp${token}`] = decode(text[i + 4]); //pull grade
            else
                student[`comp${token}`] = 'IP'; //indicate In Progress
        }

        if(info_codes.includes(token)){
            // console.log(token, decode(text[i + 4]));
            //grade column is 4 cols after the course column
            if(!inprogress)
                student[`info${token}`] = decode(text[i + 4]); //pull grade
            else
                student[`info${token}`] = 'IP'; //indicate In Progress
        }

        if(math_codes.includes(token)){
            // console.log(token, decode(text[i + 4]));
            //grade column is 4 cols after the course column
            if(!inprogress)
                student[`math${token}`] = decode(text[i + 4]); //pull grade
            else
                student[`math${token}`] = 'IP'; //indicate In Progress
        }

        if(dupe_codes.includes(token)){
            // console.log(token, decode(text[i + 4]));
            //grade column is 4 cols after the course column

            if(!inprogress) {
                if(dupe_codes.includes(token) && text[i - 1]==='COMP') {
                    student[`comp${token}`] = decode(text[i + 4]); //pull grade
                else
                    student[`comp${token}`] = 'IP';
                }

            else if {
                    if(dupe_codes.includes(token) && text[i - 1]==='INFO')
                        student[`info${token}`] = decode(text[i + 4]); //pull grade
                    else
                        student[`info${token}`] = 'IP';
                    }
            }
        }

        i++;
    }

    student.parsedText = text;

    return student;
}

async function parse(file){
    const text = await getPDFText(file);
    return getStudentData(text);
}


module.exports = {parse}


