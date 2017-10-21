/**
* storeのUnit Test
*/

  test("store#addRound",function(){
    //storeはグローバル変数なのでコピーしてテストする
    var testStore = Object.assign({},store);

    var dummyRoundId1 = "dummyRoundId1";

    var dummyRoundInfo1 = {
      roundId:dummyRoundId1,
      roundName:"単体テストラウンド",
      words:[
          {view:"単体テスト",typing:"たんたいてすと"},
          {view:"ユニットテスト",typing:"ゆにっとてすと"}
      ]
    };

    testStore.addRound(dummyRoundInfo1);
    equal(Object.keys(testStore.state.rounds).length,1,"rounds stateにroundを追加");

    var addedRound1 = testStore.state.rounds[dummyRoundId1];
    ok(
      addedRound1.roundId === dummyRoundInfo1.roundId &&
      addedRound1.roundName === dummyRoundInfo1.roundName &&
      addedRound1.words === dummyRoundInfo1.words
      ,"基本情報の一致"
    );
    equal(
      addedRound1.status
      ,ROUND_STATUS.READY
      ,"statusの初期化"
    );
    equal(
      addedRound1.remainsSec
      ,ROUND_TIME_SEC
      ,"残り時間の初期化"
    );
    deepEqual(
      addedRound1.players
      ,{
        SPRING:{},
        SUMMER:{},
        AUTUMN:{},
        WINTER:{}
      }
      ,"参加者情報の初期化"
    );
    deepEqual(
      addedRound1.score
      ,{
				SPRING:0,
				SUMMER:0,
				AUTUMN:0,
				WINTER:0
      }
      ,"スコアの初期化"
    );

    var dummyRoundId2 = "dummyRoundId2";

    var dummyRoundInfo2 = {
      roundId:dummyRoundId2,
      roundName:"単体テストラウンド2",
      words:[
          {view:"単体テスト2",typing:"たんたいてすと"},
          {view:"ユニットテスト2",typing:"ゆにっとてすと"}
      ]
    };

    testStore.addRound(dummyRoundInfo2);
    equal(Object.keys(testStore.state.rounds).length,2,"2つめのround追加");
  });

  test("store#setRoundRunning",function(){
    //storeはグローバル変数なのでコピーしてテストする
    var testStore = Object.assign({},store);

    var dummyRoundId = "dummyRoundId";

    var dummyRoundInfo = {
      roundId:dummyRoundId,
      roundName:"単体テストラウンド",
      words:[
          {view:"単体テスト",typing:"たんたいてすと"},
          {view:"ユニットテスト",typing:"ゆにっとてすと"}
      ]
    };

    testStore.addRound(dummyRoundInfo);

    testStore.setRoundRunning(dummyRoundId);

    equal(testStore.state.rounds[dummyRoundId].status, ROUND_STATUS.RUNNING, "roundを実行中に変更");

  });

  test("store#setRoundFinish",function(){
    //storeはグローバル変数なのでコピーしてテストする
    var testStore = Object.assign({},store);

    var dummyRoundId = "dummyRoundId";

    var dummyRoundInfo = {
      roundId:dummyRoundId,
      roundName:"単体テストラウンド",
      words:[
          {view:"単体テスト",typing:"たんたいてすと"},
          {view:"ユニットテスト",typing:"ゆにっとてすと"}
      ]
    };

    testStore.addRound(dummyRoundInfo);

    testStore.setRoundRunning(dummyRoundId);

    testStore.setRoundFinish(dummyRoundId);

    equal(testStore.state.rounds[dummyRoundId].status, ROUND_STATUS.FINISH, "roundを完了に変更");
  });

  test("store#getRunningRound",function(){
    //storeはグローバル変数なのでコピーしてテストする
    var testStore = Object.assign({},store);

    var dummyRoundId1 = "dummyRoundId1";

    var dummyRoundInfo1 = {
      roundId:dummyRoundId1,
      roundName:"単体テストラウンド",
      words:[
          {view:"単体テスト",typing:"たんたいてすと"},
          {view:"ユニットテスト",typing:"ゆにっとてすと"}
      ]
    };

    testStore.addRound(dummyRoundInfo1);

    var dummyRoundId2 = "dummyRoundId2";

    var dummyRoundInfo2 = {
      roundId:dummyRoundId2,
      roundName:"単体テストラウンド2",
      words:[
          {view:"単体テスト2",typing:"たんたいてすと"},
          {view:"ユニットテスト2",typing:"ゆにっとてすと"}
      ]
    };

    testStore.addRound(dummyRoundInfo2);

    testStore.setRoundRunning(dummyRoundId2);

    var runningRound = testStore.getRunningRound();
    equal(runningRound.roundId, dummyRoundId2, "実行中のroundを取得");

  });

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
        rounds:{}
      },
      addRound(roundinfo){
        deepEqual(
          roundinfo
          ,Object.assign({},dummyMessage.payload,{roundId:dummyRoundId})
          ,"store#addRoundの呼び出し"
        );
      },
      setRoundRunning(roundId){
        equal(roundId,dummyRoundId,"store#setRoundRunningの呼び出し");
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
        rounds:{}
      },
      getRunningRound(){
        ok(true,"store#getRunningRoundの呼び出し");
        return {
          roundId:dummyRoundId,
          roundName:"単体テストラウンド",
          words:[
              {view:"単体テスト",typing:"たんたいてすと"},
              {view:"ユニットテスト",typing:"ゆにっとてすと"}
          ]
        };
      },
      setRoundFinish(roundId){
        equal(roundId,dummyRoundId,"store#setRoundFinishの呼び出し");
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

/**
* RoundTimeKeeperのunit test
*/
  asyncTest("RoundTimeKeeper#start",function(){
    var readySec = 3;
    var gameSec = 5;

    var timeProceedCount = 0;
    var readyCount = 0;
    var startCount = 0;
    var endCount = 0;

    var timeKeeper = new RoundTimeKeeper(readySec,gameSec);

    timeKeeper
      .onReady(function(){
        readyCount += 1;
      })
      .onStart(function(){
        startCount += 1;
      })
      .onEnd(function(){
        endCount += 1;

        equal(timeProceedCount,readySec + gameSec,"時間経過callback");
        equal(readyCount,1,"準備callback");
        equal(startCount,1,"ゲーム開始callback");
        equal(endCount,1,"ゲーム終了callback");
        //次のテストの再開
        start();
      })
      .onTimeProceed(function(){
        timeProceedCount += 1;
      })
      .start();
  });

  asyncTest("RoundTimeKeeper#stop",function(){
    var readySec = 3;
    var gameSec = 5;

    var timeProceedCount = 0;
    var readyCount = 0;
    var startCount = 0;
    var endCount = 0;

    let timeKeeper = new RoundTimeKeeper(readySec,gameSec);

    timeKeeper
      .onReady(function(){
        readyCount += 1;
      })
      .onStart(function(){
        startCount += 1;
      })
      .onEnd(function(){
        endCount += 1;
        equal(readyCount,1,"準備完了callback");
        equal(startCount,1,"ゲーム開始callback");
        equal(endCount,1,"ゲーム終了callback");
        ok(timeProceedCount < readySec + gameSec,"ゲームの強制終了");
        //次のテストの再開
        start();
      })
      .onTimeProceed(function(readySec,gameSec){
        timeProceedCount += 1;
      })
      .start();

    //5秒後に強制終了
    setTimeout(
      function(){
        timeKeeper.stop();
      }
      ,4000
    )
  });
