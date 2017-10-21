/**
* PublisherのUnit Test
*/
  test("Publisher#gameInfo",function(){
    var dummyGameInfo = {
      roundId:"dummyRoundId",
      roundName:"単体テストラウンド",
      words:[
          {view:"単体テスト",typing:"たんたいてすと"},
          {view:"ユニットテスト",typing:"ゆにっとてすと"}
      ]
    };

    var mockPubNub = {
      publish:function(message){
        deepEqual(
          message,
          {
            channel:GAME_PROGRESS,
            message:JSON.stringify({
              type:GAME_INFO,
              payload:dummyGameInfo
            })
          },
          "GAME_INFOのpublish"
        );
      }
    };

    var publisher = Publisher(mockPubNub);

    publisher.gameInfo(dummyGameInfo);
  });

  test("Publisher#gameStart",function(){
    var dummyRoundId = "dummyRoundId";

    var mockPubNub = {
      publish:function(message){
        deepEqual(
          message,
          {
            channel:GAME_PROGRESS,
            message:JSON.stringify({
              type:GAME_START,
              payload:{roundId:dummyRoundId}
            })
          },
          "GAME_STARTのpublish"
        );
      }
    };

    var publisher = Publisher(mockPubNub);

    publisher.gameStart(dummyRoundId);
  });

  test("Publisher#gameFinish",function(){
    var dummyRoundId = "dummyRoundId";

    var mockPubNub = {
      publish:function(message){
        deepEqual(
          message,
          {
            channel:GAME_PROGRESS,
            message:JSON.stringify({
              type:GAME_FINISH,
              payload:{roundId:dummyRoundId}
            })
          },
          "GAME_FINISHのpublish"
        );
      }
    };

    var publisher = Publisher(mockPubNub);

    publisher.gameFinish(dummyRoundId);
  });

/**
* SubscribeEventsのUnit Test
*/

  test("SubscribeEvents#onGameStart",function() {
    var dummyRoundId = "dummyRoundId";

    var dummyMessage = {
      type:GAME_START,
      payload:{
        roundName:"単体テストラウンド",
        words:[
            {view:"単体テスト",typing:"たんたいてすと"},
            {view:"ユニットテスト",typing:"ゆにっとてすと"}
        ]
      }
    };

    var mockStore = {
      state:{
        gameInfo	: {
          limitSec	: -1,
          roundId		: '',
          roundName	: '',
          words		: []
        },
        summary			: []
      }
    };

    var mockPublisher = {
      gameInfo:function(info){
        deepEqual(
          info
          ,Object.assign({},dummyMessage.payload,{roundId:dummyRoundId})
          ,"GAME_INFOのpublish");
      },
      gameStart:function(roundId){
        equal(roundId,dummyRoundId,"GAME_STARTのpublish");
      }
    }

    var mockIdGenerator = function(){
      ok(true,"UUIDの生成");
      return dummyRoundId;
    };

    var subscribeEvents = SubscribeEvents(mockStore,mockPublisher,mockIdGenerator);

    subscribeEvents.onGameStart(dummyMessage);

    deepEqual(
      mockStore.state.gameInfo
      ,Object.assign({},dummyMessage.payload,{roundId:dummyRoundId})
      ,"stateの更新"
    );
  });

  test("SubscribeEvents#onGameFinish",function(){
    var dummyRoundId = "dummyRoundId";

    var dummyMessage = {
      type:GAME_FINISH,
      payload:{
        roundId:dummyRoundId
      }
    };

    var mockStore = {
      state:{
        gameInfo:{
          roundId:dummyRoundId,
          roundName:"単体テストラウンド",
          words:[
              {view:"単体テスト",typing:"たんたいてすと"},
              {view:"ユニットテスト",typing:"ゆにっとてすと"}
          ]
        }
      },
      initGameInfo:function(){
        ok(true,"store#initGameInfoの呼び出し");
      }
    };

    var mockPublisher = {
      gameFinish:function(roundId){
        equal(roundId,dummyRoundId,"GAME_FINISHのpublish");
      }
    };

    var mockIdGenerator = function(){
      return dummyRoundId;
    }

    var subscribeEvents = SubscribeEvents(mockStore,mockPublisher,mockIdGenerator);

    subscribeEvents.onGameFinish(dummyMessage);
  });
