const {uploadFile, deleteFile} = require("../s3")

test('Empty File Upload', () => {
    const result = uploadFile(null);

    expect(result).toBeNull();
})

test ('Empty Key Delete', () => {
    const result = deleteFile('');

    expect(result).toBeNull()
})