// @ts-ignore
import * as XLSX from "xlsx";

export const formatXlsxFileToJson = (file: any, header?: boolean) => {
  return new Promise((r) => {
    var reader = new FileReader();
    reader.onload = function (e: any) {
      try {
        var data = e.target.result;
        var workbook = XLSX.read(data, { type: "binary" });
        // 工作表名称集合
        var sheetNames = workbook.SheetNames;
        // 只读取第一张sheet
        var worksheet = workbook.Sheets[sheetNames[0]];

        // 解析成json
        var jsonArr: any[] = XLSX.utils.sheet_to_json(worksheet);

        // 解析成json
        var headers: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: "A",
        });

        if (header) {
          r({
            jsonArr,
            header: headers,
          });
        } else {
          r({
            jsonArr,
          });
        }
      } catch (err) {
        console.log(err);
        return false;
      }
    };
    reader.readAsBinaryString(file);
  });
};

export const formatCSVFileToJson = (file: any) => {
  return new Promise((r) => {
    var reader = new FileReader();
    reader.onload = function (e: any) {
      try {
        var data = e.target.result;

        var workbook = XLSX.read(data, { type: "binary" });
        // 工作表名称集合
        var sheetNames = workbook.SheetNames;
        // 只读取第一张sheet
        var worksheet = workbook.Sheets[sheetNames[0]];
        // 解析成json
        var jsonArr: any[] = XLSX.utils.sheet_to_json(worksheet);
        r(jsonArr);
      } catch (err) {
        console.log(err);
        return false;
      }
    };
    reader.readAsBinaryString(file);
  });
};
