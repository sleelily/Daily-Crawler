const cheerio = require('cheerio');
const superagent = require('superagent');
const config = require('config');
const groupName = config.groupName || 'beijingzufang';
const moment = require('moment');

const PERSON_REGEXP = /people\/(\w+)\//;
const TOPIC_REGEXP = /topic\/(\d+)\//;
const MONTH_AND_DATE = /^\d{2}-\d{2}\s\d{2}:\d{2}$/;
const YEAR_AND_MONTH = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_STRING = moment().format('YYYY-');

async function main() {
  const URL_MAIN = `http://www.douban.com/group/${groupName}/discussion`
  
  try {
    const res = await superagent.get(URL_MAIN);

    // 处理正文
    const $ = cheerio.load(res.text);
    const items = [];
    
    // 收集简略信息
    $('.article table tr:not(.th)').each(function(_, elem){
      const $element = $(elem);
      const timeString = $element.children("td:last-child").text();

      let updateTime;
      if (MONTH_AND_DATE.test(timeString)) {
        updateTime = moment(`${YEAR_STRING}${timeString}`).valueOf();
      } else if (YEAR_AND_MONTH.test(timeString)){
        updateTime =  moment(`${timeString}`).valueOf();
      } else {
        console.log('该日期格式无法解析 :: ', timeString);
      }

      items.push({
        title: $element.children("td.title").children('a').attr('title'), 
        id: TOPIC_REGEXP.exec($element.children("td.title").children('a').attr('href'))[1],
        people: {
          name: $element.children("td:nth-child(2)").text(),
          id: PERSON_REGEXP.exec($element.children("td:nth-child(2)").children('a').attr('href'))[1],
        },
        repeat: +$element.children("td:nth-child(3)").text(),
        updateTime
      });
    });

    console.log('items:: ', items);
  } catch (error) {
    console.log('出现错误 :: ', error);
  }
  
  process.exit();
};

// main();

async function detail(topic) {
  const DETAIL_URL = getTopicUrl(topic.id);

  try {
    const res = await superagent.get(DETAIL_URL);

    // 处理正文
    const $ = cheerio.load(res.text);
    // 创建时间
    const createdTime = $('.topic-doc h3 span:nth-child(2)').text();
    // 正文内容
    const topicContent = $('.topic-content p').text();
    // 收集正文图片地址
    const topicImages = [];
    $('.topic-content image-container imp').each((_, elem) => {
      const $image = $(elem);
      topicImages.push($image.attr('src'));
    });

    const content = {
      createdTime,
      topicContent,
      topicImages,
    }

    console.log('content %j', content);
  } catch (error) {
    console.log('解析topic内容失败 :: ', error);
  }
}

detail({
  title: '北京市青年社区33个社区出租，只为给您一个家～非中介',
  id: '132795683',
  people: { name: '百晓生', id: '149857351' },
  repeat: '135',
  updateTime: 1550912940000
});

function getTopicUrl (id) {
  return `http://www.douban.com/group/topic/${id}/`;
}