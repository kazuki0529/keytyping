/** テストユーザー数 */
const NUM_OF_USERS = 300;

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

  this.timerId = null;

  /**
  * クイズに回答する
  * @param {Object} questionInfo 問題情報
  */
  this.answer = function(questionInfo){
    var questionId = questionInfo.questionId;
    var selections = questionInfo.selections;
    var self = this;

    this.timerId = setTimeout(function () {
      var selectedIndex = self._chooseAnswer(selections);
      var sendInfo = {
        type:ANSWER,
        payload:{
          userInfo:self.userInfo,
          answer:{
            questionId:questionId,
            selectIndex:selectedIndex,
            selectTime:new Date()
          }
        }
      };

      self.pubnub.publish({
        channel:QUIZ_ANSWER,
        message:JSON.stringify(sendInfo)
      });
    }, this.answerSpeedSec * 1000);
  }

  this._chooseAnswer = function(selections){
    return Math.floor(Math.random(100) * 100) % selections.length;
  }

  this.stop = function(){
    clearInterval(this.timerId);
  }
}

/**
* TestRunner オブジェクト
* @param {array} users Userオブジェクトの配列
*/
function TestRunner(users){
  this.users = users;
  this.questionInfo = null;

  /**
  * roundInfoのsetter
  * @param {Object} questionInfo ラウンド情報
  */
  this.setQuestionInfo = function(questionInfo){
    this.questionInfo = questionInfo;
  }

  this.run = function(){
    var self = this;

    this.users.forEach(function(user){
      user.answer(self.questionInfo);
    });
  }

  this.stop = function(){
    var self = this;

    this.users.forEach(function(user){
      user.stop();
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

var pubnub = PUBNUB.init({
  publish_key:    PUBLISH_KEY,
  subscribe_key:  SUBSCRIBE_KEY
});

var users = createUsers(NUM_OF_USERS,pubnub);

var testRunner = new TestRunner(users);

pubnub.subscribe({
  channel: QUIZ_PROGRESS,
  message: function( message ){
    json = JSON.parse( message );
    console.log(json.type);
    console.dir(json.payload);
    switch( json.type )
    {
      case QUESTION_INFO:
        testRunner.setQuestionInfo(json.payload);
        break;
      case QUESTION_START:
        testRunner.run();
        break;
      case QUESTION_FINISH:
        testRunner.stop();
        break;
      default:
        break;
    }
  }
});
