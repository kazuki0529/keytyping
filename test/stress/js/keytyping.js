/** テストユーザー数 */
const NUM_OF_USERS = 100;

/**
* Userオブジェクト
* @param {Object} userInfo ユーザー情報
* @param {int} answerSpeedSec 回答スピード(秒)
* @param {Object} pubnub PubNubオブジェクト
*/
function User(userInfo,answerSpeedSec,pubnub){
  this.userInfo = userInfo;
  this.answerSpeedSec = answerSpeedSec;
  this.pubnub = pubnub;

  /**
  * 問題に回答する
  * @param {Object} roundInfo 回答する問題情報
  */
  this.answer = function(roundInfo){
    var roundId = roundInfo.roundId;
    var wordsCount = roundInfo.words.length;
    var self = this;

    var timerId = setInterval(function(){
      if(wordsCount === 0){
        clearInterval(timerId);
      }else{
        var sendInfo = {
            type:INPUT_FINISH,
            payload:{
              userInfo:self.userInfo,
              input:{
                roundId:roundId,
                wordsIndex:roundInfo.words.length - wordsCount,
                startTime:new Date(),
                finishTime:new Date()
              }
            }
          }

          self.pubnub.publish({
            channel:ANSWER,
            message:JSON.stringify(sendInfo)
          });
        }
        wordsCount--;
    },this.answerSpeedSec * 1000);
  }
}

/**
* TestRunner オブジェクト
* @param {array} users Userオブジェクトの配列
*/
function TestRunner(users){
  this.users = users;
  this.roundInfo = null;

  /**
  * roundInfoのsetter
  * @param {Object} roundInfo ラウンド情報
  */
  this.setRoundInfo = function(roundInfo){
    this.roundInfo = roundInfo;
  }

  this.run = function(){
    var self = this;

    this.users.forEach(function(user){
      user.answer(self.roundInfo);
    });
  }
}

/**
* 指定した数のユーザーを作成する
* @param {int} numOfUsers ユーザー数
* @param {Object} pubnub PubNubオブジェクト
*/
function createUsers(numOfUsers,pubnub){
  const teams = ["SPRING","SUMMER","AUTUMN","WINTER"];
  const answerSpeedSecList = [3,5,8,13,21,34];

  var users = [];
  for(var i = 0; i < numOfUsers -1; i++){
    var userId = generateUUID();
    var userName = userId;
    var team = teams[i % teams.length];
    var userInfo = {
      userId:userId,
      userName:userName,
      team:team
    };

    var answerSpeedSec = answerSpeedSecList[i % answerSpeedSecList.length];

    var user = new User(userInfo,answerSpeedSec,pubnub);

    users.push(user);
  }

  return users;
}

/** main */

var pubnub = PUBNUB.init({
  publish_key:    PUBLISH_KEY,
  subscribe_key:  SUBSCRIBE_KEY
});

var users = createUsers(NUM_OF_USERS,pubnub);

var testRunner = new TestRunner(users);

pubnub.subscribe({
  channel: ROUND_PROGRESS,
  message: function( message ){
    json = JSON.parse( message );
    console.log(json.type);
    console.dir(json.payload);
    switch( json.type )
    {
      case ROUND_INFO:			// ラウンド情報
        testRunner.setRoundInfo(json.payload);
        break;
      case ROUND_START:		// ラウンド開始
        testRunner.run();
        break;
      default:
        break;
    }
  }
});
