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

  test("store#updateRemainsSec",function(){
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

    var nextSec = 179;
    testStore.updateRemainsSec(dummyRoundId,nextSec);

    equal(testStore.state.rounds[dummyRoundId].remainsSec, nextSec, "残り時間の更新");
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
    expect(1);

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
    expect(1);

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
    expect(1);

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

  test("Publisher#gameStartCount",function(){
    expect(1);

    var dummyRoundId = "dummyRoundId";
    var nextSec = 3;

    var mockPubNub = {
      publish:function(message){
        deepEqual(
          message,
          {
            channel:GAME_PROGRESS,
            message:JSON.stringify({
                type:GAME_START_COUNT,
                payload:{
                  roundId:dummyRoundId,
                  remainsSec:nextSec
                }
            })
          },
          "GAME_START_COUNTのpublish"
        );
      }
    };

    var publisher = Publisher(mockPubNub);

    publisher.gameStartCount(dummyRoundId,nextSec);

  });

  test("Publisher#gameFinishCount",function(){
    expect(1);

    var dummyRoundId = "dummyRoundId";
    var nextSec = 179;

    var mockPubNub = {
      publish:function(message){
        deepEqual(
          message,
          {
            channel:GAME_PROGRESS,
            message:JSON.stringify({
                type:GAME_FINISH_COUNT,
                payload:{
                  roundId:dummyRoundId,
                  remainsSec:nextSec
                }
            })
          },
          "GAME_FINISH_COUNTのpublish"
        );
      }
    };

    var publisher = Publisher(mockPubNub);

    publisher.gameFinishCount(dummyRoundId,nextSec);
  });

/**
* SubscribeEventsのUnit Test
*/

  test("SubscribeEvents#onGameStart",function() {
    expect(11);

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
      },
      setRoundFinish(roundId){
        equal(roundId,dummyRoundId,"store#setRoundFinishの呼び出し");
      },
      updateRemainsSec(roundId,nextSec){
        ok(roundId === dummyRoundId && nextSec < ROUND_TIME_SEC,"store#updateRemainsSecの呼び出し");
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
      },
      gameFinish:function(roundId){
        equal(roundId,dummyRoundId,"GAME_FINISHのpublish");
      },
      gameStartCount:function(roundId,remainsSec){
        if(remainsSec === READY_TIME_SEC){
          equal(roundId,dummyRoundId,"準備開始時のGAME_START_COUNTのpublish");
        }else if(remainsSec < READY_TIME_SEC){
          equal(roundId,dummyRoundId,"GAME_START_COUNTの更新");
        }
      },
      gameFinishCount:function(roundId,remainsSec){
        ok(roundId === dummyRoundId && remainsSec < ROUND_TIME_SEC,"GAME_FINISH_COUNTの更新");
      }
    }

    var mockIdGenerator = function(){
      ok(true,"UUIDの生成");
      return dummyRoundId;
    };

    var mockRoundTimeKeeperManager = {
      new : function(){
        return new (function(){
          this.onStartCallback = function(){};
          this.onReadyCallback = function(){};
          this.onTimeProceedCallback = function(){};
          this.onEndCallback = function(){};

          this.onStart = function(cb){
            this.onStartCallback = cb;
            return this;
          }

          this.onReady = function(cb){
            this.onReadyCallback = cb;
            return this;
          }

          this.onTimeProceed = function(cb){
            this.onTimeProceedCallback = cb;
            return this;
          }

          this.onEnd = function(cb){
            this.onEndCallback = cb;
            return this;
          }

          this.start = function(){
            this.onReadyCallback();
            this.onTimeProceedCallback(2,180);
            this.onTimeProceedCallback(0,179);
            this.onStartCallback();
            this.onEndCallback();
          }
        })();
      }
    }

    var subscribeEvents = SubscribeEvents(mockStore,mockPublisher,mockIdGenerator,mockRoundTimeKeeperManager);

    subscribeEvents.onGameStart(dummyMessage);
  });

  test("SubscribeEvents#onGameFinish",function(){
    expect(1);

    var dummyMessage = {
      type:GAME_FINISH
    };

    var mockStore = {
      state:{
        rounds:{}
      }
    };

    var mockPublisher = {};

    var mockIdGenerator = {}

    var mockRoundTimeKeeperManager = {
      get : function(){
        return {
          end : function(){
            ok(true,"RoundTimeKeeper#endの呼び出し");
          }
        }
      }
    }

    var subscribeEvents = SubscribeEvents(mockStore,mockPublisher,mockIdGenerator,mockRoundTimeKeeperManager);

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

/**
* RoundTimeKeeperManagerのテスト
*/

  test("RoundTimeKeeperManager#new",function(){
    var roundTimeKeeperManager = new RoundTimeKeeperManager(3,180);

    var obj1 = roundTimeKeeperManager.new();

    ok(obj1 instanceof RoundTimeKeeper, "1回目の呼び出しでRoundTimeKeeperの取得");

    var obj2 = roundTimeKeeperManager.new();

    ok(obj2 instanceof RoundTimeKeeper, "2回目の呼び出しでRoundTimeKeeperの取得");

    ok(obj1 !== obj2, "1回目と２回目でインスタンスが異なる");
  });

  test("RoundTimeKeeperManager#get",function(){
    var roundTimeKeeperManager = new RoundTimeKeeperManager(3,180);

    ok(roundTimeKeeperManager.get() === null, "インスタンスが作られていない場合はnullが返る");

    var obj1 = roundTimeKeeperManager.new();//インスタンスの作成

    var obj2 = roundTimeKeeperManager.get();

    ok(obj2 instanceof RoundTimeKeeper, "インスタンスが作られている場合は取得できる");
    ok(obj1 === obj2, "newメソッドで最後に作成されたものと同一インスタンスである");
  });
