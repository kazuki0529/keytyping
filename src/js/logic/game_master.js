/**
* 定数定義
*/
	//1ラウンドあたりの時間
	const ROUND_TIME_SEC = 180;
	//ラウンド開始前の準備時間(秒)
	const READY_TIME_SEC = 3;

	//ラウンドの状態
	const ROUND_STATUS = {
		READY:"READY", //準備中
		RUNNING:"RUNNING",//実行中
		FINISH:"FINISH"//完了
	}

/**
* オブジェクト定義
*/

	/**
	 * 状態管理オブジェクトの定義
	 * 画面はこの値を参照して描写を変える
	 */
	const store = {
		debug	: false,
		state 	: {
			rounds:{}
		},
		/**
		* roundを追加する
		* @param {Object} roundinfo コントローラから渡されたラウンド情報
		*/
		addRound(roundinfo){
			this.state.rounds[roundinfo.roundId] = Object.assign({},roundinfo,{
				status:ROUND_STATUS.READY,
				remainsSec:ROUND_TIME_SEC,
				players:{
					SPRING:{},
					SUMMER:{},
					AUTUMN:{},
					WINTER:{}
				},
				score:{
					SPRING:0,
					SUMMER:0,
					AUTUMN:0,
					WINTER:0
				}
			});
		},

		/**
		* 指定されたラウンドを実行中にする
		* @param {String} roundId 実行中にするラウンドID
		*/
		setRoundRunning(roundId){
			var round = this.state.rounds[roundId];
			if(round){
				if(round.status === ROUND_STATUS.READY){
					round.status = ROUND_STATUS.RUNNING;
				}
			}
		},

		/**
		* 残り時間を更新する
		* @param {String} roundId 対象のラウンドID
		* @param {int} remainsSec 更新後の残り時間(秒)
		*/
		updateRemainsSec(roundId,remainsSec){
			var round = this.state.rounds[roundId];
			if(round){
				if(round.status === ROUND_STATUS.RUNNING){
					round.remainsSec = remainsSec;
				}
			}
		},

		/**
		* 指定されたラウンドを完了する
		* @param {String} roundId 完了するラウンドID
		*/
		setRoundFinish(roundId){
			var round = this.state.rounds[roundId];
			if(round){
				round.status = ROUND_STATUS.FINISH;
				round.remainsSec = 0;
			}
		},

		/**
		* 現在実行中のラウンドを取得する
		* @return {Object} 実行中のラウンド。なければnull。
		*/
		getRunningRound(){
			var self = this;
			var runningRounds = Object.keys(this.state.rounds).map(function(key){
				return self.state.rounds[key];
			}).filter(function(round){
				return round.status === ROUND_STATUS.RUNNING;
			});

			if(runningRounds.length === 1){
				return this.state.rounds[runningRounds[0].roundId];
			}else{
				return null;
			}
		}
	};


	/**
	* PubNubへのpublishオブジェクトを返す高階関数
	* @param {Object} pubnub PubNubオブジェクト
	*/
	function Publisher(pubnub){
		return {
			/**
			* GAME_INFOイベントのpublisher
			* @param {Object} info game情報
			*/
			gameInfo:function(info){
				var sendInfo = {
					type	: GAME_INFO,
					payload	: info
				};

				pubnub.publish({
					channel: GAME_PROGRESS,
					message: JSON.stringify( sendInfo )
				});
			},
			/**
			* GAME_STARTイベントのpublisher
			* @param {String} roundId ラウンドのID
			*/
			gameStart:function(roundId){
				const sendStart = {
					type	: GAME_START,
					payload	: {
						roundId	: roundId
					}
				};
				pubnub.publish({
					channel: GAME_PROGRESS,
					message: JSON.stringify( sendStart )
				});
			},
			/**
			* GAME_FINISHイベントのpublisher
			* @param {String} roundId ラウンドのID
			*/
			gameFinish:function(roundId){
				const sendData = {
					type	: GAME_FINISH,
					payload	: {
						roundId	: roundId
					}
				};
				pubnub.publish({
					channel: GAME_PROGRESS,
					message: JSON.stringify( sendData )
				});
			},
			/**
			* GAME_START_COUNTイベントのpublisher
			* @param {string} roundId 対象のroundId
			* @param {int} remainsSec 残り時間(秒)
			*/
			gameStartCount(roundId,remainsSec){
				const sendData = {
					type: GAME_START_COUNT,
					payload:{
						roundId : roundId,
						remainsSec : remainsSec
					}
				};

				pubnub.publish({
					channel: GAME_PROGRESS,
					message: JSON.stringify( sendData )
				});
			},

			/**
			* GAME_FINISH_COUNTイベントのpublisher
			* @param {string} roundId 対象のラウンドID
			* @param {int} remainsSec 残り時間(秒)
			*/
			gameFinishCount(roundId,remainsSec){
				const sendData = {
					type: GAME_FINISH_COUNT,
					payload:{
						roundId: roundId,
						remainsSec: remainsSec
					}
				};

				pubnub.publish({
					channel: GAME_PROGRESS,
					message: JSON.stringify( sendData )
				});
			},
		};
	}

	/**
	* PubNubからのsubscribe時のイベント群を返す高階関数
	* @param {Object} store storeオブジェクト
	* @param {Object} publisher Publisherオブジェクト
	* @param {function} idGenerator UUID作成関数
	* @param {Object} roundTimeKeeperManager RoundTimeKeeperManagerインスタンス
	*/
	function SubscribeEvents(store,publisher,idGenerator,roundTimeKeeperManager){
		return {
			/**
			* GAME_STARTイベントのハンドラ
			* @param {Object} message イベントメッセージ
			*/
			onGameStart:function(message){
				/**
				 * ①ゲームの情報をpublish
				 * ②開始までのカウントダウンをpublish
				 * ③ゲーム開始をpublish
				 * ④試合時間を過ぎたらゲーム終了をpublish
				 */
				var roundInfo = message.payload;
				var roundId = idGenerator();
				roundInfo.roundId	= roundId;

				var roundTimeKeeper = roundTimeKeeperManager.new();

				roundTimeKeeper
					.onReady(function(){
						store.addRound(roundInfo);
						publisher.gameInfo(roundInfo);
						publisher.gameStartCount(roundId,READY_TIME_SEC);
					})
					.onTimeProceed(function(readySec,gameSec){
						if(readySec > 0){
							publisher.gameStartCount(roundId,readySec);
						}else if(gameSec > 0){
							store.updateRemainsSec(roundId, gameSec);
							publisher.gameFinishCount(roundId, gameSec);
						}
					})
					.onStart(function(){
						store.setRoundRunning(roundId);
						publisher.gameStart(roundId);
					})
					.onEnd(function(){
						store.setRoundFinish(roundId);
						publisher.gameFinish(roundId);
					})
					.start();
			},
			/**
			* GAME_FINISHイベントのハンドラ
			* @param {Object} message イベントメッセージ
			*/
			onGameFinish:function(message){
				var roundTimeKeeper = roundTimeKeeperManager.get();

				if(roundTimeKeeper){
					roundTimeKeeper.end();
				}
			},
			/**
			* INPUT_FINISHイベントのハンドラ
			* @param {Object} message イベントメッセージ
			*/
			onInputFinish:function(message){
				// 単語情報のため込み
				// TODO:カッコイイ方法ないか。。。
				//store.state.summary[store.state.gameInfo.roundId][json.payload.userInfo.team][json.payload.userInfo.userId] =  json.payload;
			}
		};
	}
	/**
	* ゲーム時間のタイムキーパーオブジェクト
	* @param {int} readySec 準備時間(秒)
	* @param {int} gameSec ゲーム実行時間(秒)
	*/
	function RoundTimeKeeper(readySec,gameSec){
		//準備時間
		this.readySec = readySec;
		//ゲーム実行時間
		this.gameSec = gameSec;
		//タイマーのtick
		this.deltaSec = 1;

		//準備時間に入った時のcallback
		this.onReadyCallback = function(){};
		//ゲーム開始した際のcallback
		this.onStartCallback = function(){};
		//ゲーム終了した際のcallback
		this.onEndCallback = function(){};
		//時間が経過した際のcallback
		this.onTimeProceedCallback = function(){};

		//jsのタイマーID
		this.currentTimerId = null;

		/**
		* 準備時間callbackの設定メソッド
		* @param {function} cb callback
		* @return this(メソッドチェーン)
		*/
		this.onReady = function(cb){
			this.onReadyCallback = cb;
			return this;
		}

		/**
		* ゲーム開始callbackの設定メソッド
		* @param {function} cb callback
		* @return this(メソッドチェーン)
		*/
		this.onStart = function(cb){
			this.onStartCallback = cb;
			return this;
		}

		/**
		* ゲーム終了callbackの設定メソッド
		* @param {function} cb callback
		* @return this(メソッドチェーン)
		*/
		this.onEnd = function(cb){
			this.onEndCallback = cb;
			return this;
		}

		/**
		* 時間経過callbackの設定メソッド
		* @param {function} cb callback
		* @return this(メソッドチェーン)
		*/
		this.onTimeProceed = function(cb){
			this.onTimeProceedCallback = cb;
			return this;
		}

		/**
		* タイマースタート
		*/
		this.start = function(){
			this.onReadyCallback();

			var self = this;
			this.currentTimerId = setInterval(
				function(){


					if(self.readySec > 0){
						//準備中
						self.readySec = self.readySec - 1;
						self.onTimeProceedCallback(self.readySec,self.gameSec);
						if(self.readySec === 0){
							self.onStartCallback();
						}
					}else if(self.gameSec > 0){
						//実行中
						self.gameSec = self.gameSec - 1;
						self.onTimeProceedCallback(self.readySec,self.gameSec);
						if(self.gameSec === 0){
							self.onEndCallback();
						}
					}else{
						self.stopTimer();
					}
				}
				,this.deltaSec * 1000
			)
		}

		/**
		* タイマー(強制)ストップ
		*/
		this.stop = function(){
			this.stopTimer();
			this.onEndCallback();
		}

		/**
		* jsのタイマー処理のクリア
		*/
		this.stopTimer = function(){
			clearInterval(this.currentTimerId);
		}
	}

	/**
	* RoundTimeKeeperのインスタンス管理オブジェクト
	* @param {int} readySec 準備時間（秒）
	* @param {int} gameSec ゲーム時間(秒)
	*/
	function RoundTimeKeeperManager(readySec,gameSec){
		//RoundTimeKeeperインスタンス
		this.instance = null;

		/**
		* 既存のインスタンスを破棄して新しいインスタンスを作成する
		* @return {Object} RoundTimeKeeperインスタンス
		*/
		this.new = function(){
			if(this.instance){
				this.instance.stop();
				this.instance = null;
			}

			this.instance = new RoundTimeKeeper(readySec,gameSec);
			return this.instance;
		}

		/**
		* 既存のインスタンスを取得する
		* @return {Object} RoundTimeKeeperインスタンス　or null
		*/
		this.get = function(){
			return this.instance;
		}
	}

/**
* メイン処理
*/

	//unit test時は実行しない
	if(location.href.indexOf("test") === -1){
		/**
		* メインのVueコンポーネント
		*/
		const app = new Vue({
			el 		: "#app",
			data	: store.state,
			methods : {

			}
		});

		/**
		 * PUBNUBインスタンスの初期化とsubscribe設定
		 */
		// PUBNUBの初期化処理
		var pubnub = PUBNUB.init({
			publish_key:    PUBLISH_KEY,
			subscribe_key:  SUBSCRIBE_KEY
		});

		//PubNubへのpublishオブジェクトのインスタンス
		const publisher = Publisher(pubnub);

		const roundTimeKeeperManager = new RoundTimeKeeperManager(READY_TIME_SEC,ROUND_TIME_SEC);

		//PUBNUBからのsubscribe時のイベント群
		const subscribeEvents = SubscribeEvents(store,publisher,generateUUID,roundTimeKeeperManager);

		/**
		* PubNub制御
		*/

		// PUBNUBからのメッセージをsubscribeし、受け取った際の動作を設定する
		// Game Master操作用画面からpublishを受け取る
		pubnub.subscribe({
			channel: GAME_CONTROL,
			message: function( message ){
				json = JSON.parse( message );
				console.dir(json);
				switch( json.type )
				{
					case GAME_START:		// ゲーム開始
						subscribeEvents.onGameStart(json);
						break;
					case GAME_FINISH:		// ゲーム終了
						subscribeEvents.onGameFinish(json);
						break;
					default :
						break;
				}
			}
		});

		// プレイヤー画面からのメッセージを受け取る
		pubnub.subscribe({
			channel: ANSWER,
			message: function( message ){
				json = JSON.parse( message );
				console.dir(json);
				switch( json.type )
				{
					case INPUT_FINISH:		// 単語入力完了
						subscribeEvents.onInputFinish(json);
						break;
					default :
						break;
				}
			}
		});
	}
