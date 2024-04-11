import moment from "moment";
import { changeDate } from "../components/Time";
import { unionBy } from "lodash";

export const SPLIT_FLAG = "____";
export const getTimes = (list: any[]) => {
  const dates = list.map((item) => {
    const originDate =
      typeof item["CREATEDATE"] === "number" ? item["CREATEDATE"] : 0;
    return moment(changeDate(originDate)).format("YYYY-MM-DD");
  });
  const datesArr = unionBy(dates);
  const sortDates = datesArr.sort((a, b) => {
    if (moment(a) > moment(b)) {
      return 1;
    }
    return -1;
  });

  return sortDates;
};

export const handleCalcUsualWork = (jsonList: any[], nameList: string[]) => {
  const jsonNameItemMap: Record<
    string,
    {
      items?: any[];
      // 包含的日期
      times: string[];
    }
  > = {};

  jsonList.forEach((rowItem) => {
    const nameStr = nameList
      .map((name) => {
        return rowItem[name];
      })
      .join(SPLIT_FLAG);

    if (jsonNameItemMap[nameStr]) {
      jsonNameItemMap[nameStr].items?.push(rowItem);
    } else {
      jsonNameItemMap[nameStr] = {
        items: [rowItem],
        times: [],
      };
    }
    return nameStr;
  });

  Object.keys(jsonNameItemMap).forEach((jsonName) => {
    const value = jsonNameItemMap[jsonName];
    const items = value.items;
    const _times = getTimes(items || []);
    jsonNameItemMap[jsonName].times = _times;
    delete jsonNameItemMap[jsonName].items;
  });

  return jsonNameItemMap;
};

export const calcTimes = (
  allGridsArr: string[],
  works: Record<
    string,
    {
      items?: any[] | undefined;
      times: string[];
    }
  >,
  actions: Record<
    string,
    {
      items?: any[] | undefined;
      times: string[];
    }
  >
) => {

  const result: Record<
    string,
    {
      workDays?: string[];
      actionDays?: string[];
    }
  > = {};

  allGridsArr.forEach(grid => {
    const workDays = works[grid]?.times || [];
    const actionDays = actions[grid]?.times || [];
    result[grid] = {
      workDays,
      actionDays,
    }
  })

  return result;
};
