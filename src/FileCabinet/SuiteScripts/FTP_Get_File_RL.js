/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
 define(['N/file', 'N/record'], function (file, record) {

    return {
        post: post,
    };

    function post(context) {
        try {

            var filename = context.filename; 

            if (filename)
            {   
                var contents = context.filecontent;
                var fileObj = file.create({
                    name: filename,
                    fileType: file.Type.CSV,
                    contents: contents,
                    folder: 2147 // folder name: Skybitz CSV Files
                });
                fileObj.save();
            }
            return { isSuccess: true, message: 'File Imported Correctly.' };
        } catch (err) {
            return { isSuccess: false, message: err.message, detail: JSON.stringify(err) };
        }
    }
});