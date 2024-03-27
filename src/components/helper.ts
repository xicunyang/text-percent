import moment from "moment";

export const calcTime = (time: string) => {
  const changeChi = time

    .replaceAll("二十一", "21")
    .replaceAll("二十二", "22")
    .replaceAll("二十三", "23")
    .replaceAll("二十四", "24")
    .replaceAll("二十五", "25")
    .replaceAll("二十六", "26")
    .replaceAll("二十七", "27")
    .replaceAll("二十八", "28")
    .replaceAll("二十九", "29")
    .replaceAll("二十", "20")

    .replaceAll("三十一", "31")
    .replaceAll("三十二", "32")
    .replaceAll("三十三", "33")
    .replaceAll("三十四", "34")
    .replaceAll("三十五", "35")
    .replaceAll("三十六", "36")
    .replaceAll("三十七", "37")
    .replaceAll("三十八", "38")
    .replaceAll("三十九", "39")
    .replaceAll("三十", "30")

    .replaceAll("四十一", "41")
    .replaceAll("四十二", "42")
    .replaceAll("四十三", "43")
    .replaceAll("四十四", "44")
    .replaceAll("四十五", "45")
    .replaceAll("四十六", "46")
    .replaceAll("四十七", "47")
    .replaceAll("四十八", "48")
    .replaceAll("四十九", "49")
    .replaceAll("四十", "40")

    .replaceAll("五十一", "51")
    .replaceAll("五十二", "52")
    .replaceAll("五十三", "53")
    .replaceAll("五十四", "54")
    .replaceAll("五十五", "55")
    .replaceAll("五十六", "56")
    .replaceAll("五十七", "57")
    .replaceAll("五十八", "58")
    .replaceAll("五十九", "59")
    .replaceAll("五十", "50")

    .replaceAll("六十一", "61")
    .replaceAll("六十二", "62")
    .replaceAll("六十三", "63")
    .replaceAll("六十四", "64")
    .replaceAll("六十五", "65")
    .replaceAll("六十六", "66")
    .replaceAll("六十七", "67")
    .replaceAll("六十八", "68")
    .replaceAll("六十九", "69")
    .replaceAll("六十", "60")

    .replaceAll("七十一", "71")
    .replaceAll("七十二", "72")
    .replaceAll("七十三", "73")
    .replaceAll("七十四", "74")
    .replaceAll("七十五", "75")
    .replaceAll("七十六", "76")
    .replaceAll("七十七", "77")
    .replaceAll("七十八", "78")
    .replaceAll("七十九", "79")
    .replaceAll("七十", "70")

    .replaceAll("八十一", "81")
    .replaceAll("八十二", "82")
    .replaceAll("八十三", "83")
    .replaceAll("八十四", "84")
    .replaceAll("八十五", "85")
    .replaceAll("八十六", "86")
    .replaceAll("八十七", "87")
    .replaceAll("八十八", "88")
    .replaceAll("八十九", "89")
    .replaceAll("八十", "80")
    .replaceAll("九十", "90")

    .replaceAll("十一", "11")
    .replaceAll("十二", "12")
    .replaceAll("十三", "13")
    .replaceAll("十四", "14")
    .replaceAll("十五", "15")
    .replaceAll("十六", "16")
    .replaceAll("十七", "17")
    .replaceAll("十八", "18")
    .replaceAll("十九", "19")

    .replaceAll("一", "1")
    .replaceAll("二", "2")
    .replaceAll("三", "3")
    .replaceAll("四", "4")
    .replaceAll("五", "5")
    .replaceAll("六", "6")
    .replaceAll("七", "7")
    .replaceAll("八", "8")
    .replaceAll("九", "9")
    .replaceAll("十", "10");

  const datePattern =
    /(\d{0,4}(年|\.))?\d{1,2}(月|\.)\d{1,2}(日|号)?|\d{1,2}(月|\.)\d{1,2}(日|号)?/g;

  const matches = changeChi.match(datePattern);
  return {
    changeChi,
    matches: matches ? matches : [],
  };
};

export const formatTime = (time: string) => {
  if(time === "文本内无时间") return "文本内无时间"

  const fTime = time
    .replaceAll("年", ".")
    .replaceAll("月", ".")
    .replaceAll("日", "")
    .replaceAll("号", "");

  const hasYear = fTime.split(".").length === 3;
  let res = fTime;

  if (hasYear) {
    const sRes = fTime.split(".");
    sRes.shift();
    res = sRes.join(".");
  }


  const ress = moment(`2024.${res}`).format("MM-DD");
  if(ress === "Invalid date") {
    return "-"
  }
  return ress;
};
